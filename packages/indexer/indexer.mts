/*
 * Copyright (c) 2024 Elide Technologies, Inc.
 *
 * Licensed under the MIT license (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *   https://opensource.org/license/mit/
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under the License.
 */

import { model } from 'hashlock'
import { formatHashfileContent } from 'hashlock/generator'
import { globSync } from 'glob'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readdir, stat, mkdir, writeFile } from 'node:fs/promises'
import { join, resolve, sep, dirname, basename } from 'node:path'

import { MavenCoordinate, mavenCoordinate } from '@javamodules/maven'
import { parseAsync as parsePomAsync } from '@javamodules/maven/parser'
import { GradleModuleInfo } from '@javamodules/gradle'
import { JarFile } from '@javamodules/java/jar'
import { JavaModuleInfo } from '@javamodules/java/model'
import { gradleModule } from '@javamodules/gradle/util'

import { RepositoryPackage, RepositoryJar, RepositoryIndexBundle, RepositoryIndexFile } from './indexer-model.mjs'

const DEFAULT_PRETTY = true
const snapshotAllowlist: Set<string> = new Set()
snapshotAllowlist.add('org.checkerframework:checker-qual:3.43.0-SNAPSHOT')

async function buildRepositoryJar(coordinate: MavenCoordinate, path: string): Promise<RepositoryJar> {
  // capture size while parsing jar
  const sizeOp = stat(path)
  const jar = await JarFile.fromFile(path)
  const size = (await sizeOp).size
  const name = basename(path)

  // interrogate for jar metadata
  const { mainClass, automaticModuleName } = jar
  const modular = await jar.modular
  let module: JavaModuleInfo | undefined
  if (modular) {
    module = await jar.moduleInfo
  }

  return {
    path,
    coordinate,
    name,
    size,
    modular,
    mainClass: mainClass || undefined,
    automaticModuleName: automaticModuleName || undefined,
    module
  }
}

async function repositoryPackage(
  root: string,
  maven: MavenCoordinate,
  pom: string,
  gradle?: GradleModuleInfo
): Promise<RepositoryPackage> {
  // capture the suite of jars for this pom
  const parsedPom = await parsePomAsync({
    filePath: pom
  })

  // find jars within this package directory
  const jarOps = globSync(join(dirname(pom), '**', '*.jar')).map(jarPath => buildRepositoryJar(maven, jarPath))

  // wait for jar indexing to complete
  const jars = await Promise.all(jarOps)
  const relative = pom.slice(root.length + 1)

  return {
    key: maven.valueOf() as string,
    coordinate: maven,
    maven: parsedPom.pomObject.project,
    pom: relative,
    gradle,
    jars,
    valueOf: function () {
      return `${pom} (${maven})`
    }
  }
}

function coordinateForPomPath(prefix: string, path: string) {
  if (!path.startsWith(prefix))
    throw new Error(`Cannot generate coordinate for path '${path}' which is not under prefix '${prefix}'`)

  // like `/.../jpms/repository/org/reactivestreams/reactive-streams/1.0.5-jpms/reactive-streams-1.0.5-jpms.pom`
  const trimmed = path.slice(prefix.length + 1)
  const segments = trimmed.split(sep)

  // like `reactive-streams-1.0.5-jpms.pom`
  const pomName = segments[segments.length - 1]

  // like `org/reactivestreams/reactive-streams/1.0.5-jpms`
  const coordinateTarget = trimmed.slice(0, trimmed.length - 1 - pomName.length)
  const coordinateSegments = coordinateTarget.split(sep)

  // like `1.0.5-jpms`
  const versionString = coordinateSegments[coordinateSegments.length - 1]

  // like `reactive-streams`
  const artifactId = coordinateSegments[coordinateSegments.length - 2]

  // like ['org', 'reactivestreams']
  const groupSegments = coordinateSegments.slice(0, coordinateSegments.length - 2)

  return mavenCoordinate(groupSegments.join('.'), artifactId, versionString)
}

async function buildPackages(prefix: string, path: string) {
  const found: RepositoryPackage[] = []
  const pathPoms = globSync(join(path, '**', '*.pom'))
  for (const pomPath of pathPoms) {
    const coordinate = coordinateForPomPath(prefix, pomPath)
    console.log(`- Scanning '${coordinate.valueOf()}'`)
    found.push(
      await repositoryPackage(
        prefix,
        coordinate,
        pomPath,
        await gradleModule(dirname(pomPath), basename(pomPath), {
          lenient: true
        })
      )
    )
  }
  return found
}

async function buildRootPackage(prefix: string, path: string): Promise<RepositoryPackage[]> {
  const filestat = await stat(path)
  if (!filestat.isDirectory()) return [] // we are only processing directory roots
  return await buildPackages(prefix, path)
}

function pkgEligible(allPackages: Set<string>, pkg: RepositoryPackage): boolean {
  const version = pkg.coordinate.version
  if (!version) return false // packages must have a version
  const isSnapshot = version.includes('SNAPSHOT') || false
  if (isSnapshot) {
    return snapshotAllowlist.has(pkg.coordinate.valueOf() as string) // snapshots are not eligible
  }
  if (allPackages.has(pkg.key)) {
    throw new Error(`Duplicate package key: ${pkg.key}`)
  } else {
    allPackages.add(pkg.key)
  }
  return true
}

function buildIndexes(all_packages: RepositoryPackage[]): RepositoryIndexBundle {
  const allPackages = new Set<string>()
  const eligible = all_packages.filter(pkg => pkgEligible(allPackages, pkg))

  const modular = eligible.filter(pkg => !!pkg.jars.find(jar => jar.modular))

  const modules = modular.map(pkg => ({
    key: pkg.key,
    coordinate: pkg.coordinate,
    modules: pkg.jars
      .filter(jar => jar.modular)
      .map(jar => ({
        jar: jar.name,
        module: jar.module as JavaModuleInfo
      }))
  }))

  return {
    artifacts: [],
    modules
  }
}

function buildIndexFile(name: string, contents: object, pretty: boolean = DEFAULT_PRETTY): RepositoryIndexFile {
  const md5 = createHash('md5')
  const sha1 = createHash('sha1')
  const sha256 = createHash('sha256')
  const sha512 = createHash('sha512')

  let rendered: string
  try {
    rendered = JSON.stringify(contents, null, pretty ? 2 : 0)
  } catch (err) {
    console.error(err)
    throw err
  }
  md5.update(rendered)
  sha1.update(rendered)
  sha256.update(rendered)
  sha512.update(rendered)

  return {
    name,
    contents: rendered,
    md5: md5.digest('hex'),
    sha1: sha1.digest('hex'),
    sha256: sha256.digest('hex'),
    sha512: sha512.digest('hex')
  }
}

async function prepareContent(indexes: RepositoryIndexBundle): Promise<RepositoryIndexFile[]> {
  // build modules index file
  const modulesIndex = buildIndexFile('modules.json', indexes.modules)
  return [modulesIndex]
}

function formatHashfile(subject: string, algorithm: model.HashAlgorithm, hash: string): string {
  return formatHashfileContent({
    algorithm,
    encoding: model.HashEncoding.HEX,
    subjects: [{ hash, subject }]
  })
}

async function writeIndexFile(root: string, write: RepositoryIndexFile) {
  const hashFileName = (algorithm: string): string => {
    return `${write.name}.${algorithm}`
  }
  const json = join(root, write.name)
  const md5target = join(root, hashFileName('md5'))
  const sha1target = join(root, hashFileName('sha1'))
  const sha256target = join(root, hashFileName('sha256'))
  const sha512target = join(root, hashFileName('sha512'))

  await writeFile(json, write.contents)
  await writeFile(md5target, formatHashfile(write.name, model.HashAlgorithm.MD5, write.md5))
  await writeFile(sha1target, formatHashfile(write.name, model.HashAlgorithm.SHA1, write.sha1))
  await writeFile(sha256target, formatHashfile(write.name, model.HashAlgorithm.SHA256, write.sha256))
  await writeFile(sha512target, formatHashfile(write.name, model.HashAlgorithm.SHA512, write.sha512))
  console.log(`Index written: '${write.name}' (size: ${write.contents.length})`)
}

async function writeIndexes(outpath: string, all_packages: RepositoryPackage[]) {
  const resolvedOut = resolve(outpath)
  console.log(`Writing indexes → ${resolvedOut}`)
  if (!existsSync(resolvedOut)) {
    await mkdir(resolvedOut, { recursive: true })
  }
  const indexes = buildIndexes(all_packages)
  const writes = await prepareContent(indexes)
  for (const write of writes) {
    await writeIndexFile(resolvedOut, write)
  }
  console.info('Index write complete.')
}

/**
 * Build indexes for a Maven repository.
 *
 * @param path Path to the repository
 * @param outpath Output path (directory) for generated index files
 */
export async function buildRepositoryIndexes(path: string, outpath: string) {
  const prefix = resolve(path)
  console.log(`Scanning repository '${prefix}'...`)
  let all_packages: RepositoryPackage[] = []
  try {
    const files = await readdir(prefix)
    for (const file of files) {
      all_packages = all_packages.concat(await buildRootPackage(prefix, join(prefix, file)))
    }
  } catch (err) {
    console.error(err)
  }

  writeIndexes(outpath, all_packages)
}

// argument expected is path to repository
await buildRepositoryIndexes(
  process.argv[2] || join('..', '..', 'repository'),
  join('..', '..', '.well-known', 'maven-indexes')
)
