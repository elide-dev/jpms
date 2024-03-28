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

import { globSync } from 'glob'
import { existsSync } from 'node:fs'
import { readdir, stat, mkdir } from 'node:fs/promises'
import { join, resolve, sep, dirname, basename } from 'node:path'

import { MavenCoordinate, mavenCoordinate } from '@javamodules/maven'
import { parseAsync as parsePomAsync } from '@javamodules/maven/parser'
import { GradleModuleInfo } from '@javamodules/gradle'
import { JarFile } from '@javamodules/java/jar'
import { gradleModule } from '@javamodules/gradle/util'

import { RepositoryPackage, RepositoryJar, RepositoryIndexBundle, RepositoryIndexFile } from './indexer-model.mjs'
import { JavaModuleInfo } from '@javamodules/java/model'

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
  const project = await parsePomAsync({
    filePath: pom
  })

  // find jars within this package directory
  const jarOps = globSync(join(dirname(pom), '**', '*.jar')).map(jarPath => buildRepositoryJar(maven, jarPath))

  // wait for jar indexing to complete
  const jars = await Promise.all(jarOps)

  return {
    coordinate: maven,
    maven: project,
    root,
    pom,
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

// @ts-ignore
function buildIndexes(all_packages: RepositoryPackage[]): RepositoryIndexBundle {
  // @TODO build indexes
  console.log('all packages', all_packages)
  return {
    artifacts: [],
    modules: []
  }
}

// @ts-ignore
async function prepareContent(indexes: RepositoryIndexBundle): Promise<RepositoryIndexFile[]> {
  return []
}

// @ts-ignore
async function writeIndexFile(write: RepositoryIndexFile) {
  console.log('write', write)
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
    await writeIndexFile(write)
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
await buildRepositoryIndexes(process.argv[2] || join('..', '..', 'repository'), './indexes')
