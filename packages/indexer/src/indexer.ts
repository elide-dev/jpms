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
import { model } from 'hashlock'
import { formatHashfileContent } from 'hashlock/generator'
import JSONStringify from 'json-stable-stringify'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readdir, stat, mkdir, writeFile } from 'node:fs/promises'
import { join, resolve, sep, dirname, basename } from 'node:path'
import { PackageURL } from 'packageurl-js'

import { MavenCoordinate, mavenCoordinate } from '@javamodules/maven'
import { PomProject, parseAsync as parsePomAsync } from '@javamodules/maven/parser'
import { GradleModuleInfo } from '@javamodules/gradle'
import { JarFile } from '@javamodules/java/jar'
import { JavaModuleInfo, JvmTarget } from '@javamodules/java/model'
import { gradleModule } from '@javamodules/gradle/util'

import {
  RepositoryPackage,
  RepositoryJar,
  RepositoryIndexBundle,
  RepositoryIndexFile,
  RepositoryModulesIndexEntry,
  RepositoryGradleModulesIndexEntry,
  RepositoryPomIndexEntry,
  RepositoryPackageIndexEntry,
  RepositoryIndexMetadata,
  formatVersion
} from './indexer-model'
import { ProjectInfo, ProjectProfileInfo } from './info-project'
import { ProjectSourceControl } from './info-model'

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
  if (module?.requires.length === 1) {
    if (module.requires[0].module === 'java.base') {
      module.requires = [] // we can omit this
    }
  }

  // determine mrjar and bytecode targeting
  const mrjar = jar.multiRelease
  const min = await jar.minimumBytecodeTarget
  let max: JvmTarget | undefined = await jar.maximumBytecodeTarget
  if (max && max === min) {
    max = undefined
  }

  return {
    path,
    coordinate,
    name,
    size,
    modular,
    mainClass: mainClass || undefined,
    automaticModuleName: automaticModuleName || undefined,
    module,
    mrjar,
    minimumBytecodeTarget: min,
    maximumBytecodeTarget: max
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
  const mainJar = jars.find(jar => jar.coordinate.classifier === undefined)
  if (jars.length > 0 && !mainJar) {
    throw new Error(`Main jar not found for ${maven.valueOf()}`)
  }
  const relative = pom.slice(root.length + 1)

  // obtain bytecode targeting for main jar, mrjar status
  const { mrjar, minimumBytecodeTarget, maximumBytecodeTarget } = mainJar || {
    mrjar: false,
    minimumBytecodeTarget: undefined,
    maximumBytecodeTarget: undefined
  }
  const clonedProject = JSON.parse(JSON.stringify(parsedPom.pomObject.project))

  // delete unused properties
  delete clonedProject['xmlns']
  delete clonedProject['xmlns:xsi']
  delete clonedProject['xsi:schemaLocation']
  if (clonedProject['modelversion'] === '4.0.0') {
    delete clonedProject['modelversion']
  }

  return {
    objectID: maven.valueOf() as string,
    coordinate: maven,
    maven: clonedProject,
    pom: relative,
    gradle,
    jars,
    flags: {
      modular: jars.find(jar => jar.modular) !== undefined,
      gradleModule: !!gradle,
      mrjar,
      minimumBytecodeTarget: minimumBytecodeTarget === '1.5' ? undefined : minimumBytecodeTarget,
      maximumBytecodeTarget: maximumBytecodeTarget === minimumBytecodeTarget ? undefined : maximumBytecodeTarget
    },
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
    const containingDir = dirname(pomPath)
    const pomFileName = basename(pomPath)
    const gradlemod = await gradleModule(containingDir, pomFileName, {
      lenient: true,
      root: prefix
    })

    const coordinate = coordinateForPomPath(prefix, pomPath)
    console.log(`- Scanning '${coordinate.valueOf()}'`)
    found.push(await repositoryPackage(prefix, coordinate, pomPath, gradlemod))
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
  if (allPackages.has(pkg.objectID)) {
    throw new Error(`Duplicate package key: ${pkg.objectID}`)
  } else {
    allPackages.add(pkg.objectID)
  }
  return true
}

function buildModulesIndex(eligible: RepositoryPackage[]): RepositoryModulesIndexEntry[] {
  const allPackages = new Set<string>()
  const modular = eligible.filter(pkg => !!pkg.jars.find(jar => jar.modular))
  const modules = modular
    .map(pkg => {
      if (allPackages.has(pkg.objectID)) {
        throw new Error(`Duplicate package key: ${pkg.objectID}`)
      }
      allPackages.add(pkg.objectID)
      const mainJar = pkg.jars.filter(jar => jar.coordinate.classifier === undefined).filter(jar => jar.modular)

      let mod: JavaModuleInfo
      if (mainJar.length === 0) {
        return
      } else if (mainJar.length > 1) {
        throw new Error(`Multiple modular jars found for ${pkg.coordinate.valueOf()}`)
      } else {
        mod = mainJar[0].module as JavaModuleInfo
      }

      const modularJar = {
        jar: mainJar[0].name,
        module: mod
      }
      return {
        objectID: pkg.objectID,
        coordinate: pkg.coordinate,
        flags: pkg.flags,
        module: modularJar
      }
    })
    .filter(it => it !== undefined)

  return modules as RepositoryModulesIndexEntry[]
}

function buildGradleIndex(eligible: RepositoryPackage[]): RepositoryGradleModulesIndexEntry[] {
  return eligible
    .filter(pkg => !!pkg.gradle)
    .flatMap(pkg => (pkg.gradle?.module.variants || []).map(variant => ({ pkg, variant })))
    .map(item => {
      const { pkg, variant } = item

      return {
        objectID: `${pkg.objectID}::${variant.name}`,
        coordinate: pkg.coordinate,
        flags: pkg.flags,
        variant: variant.name,
        gradle: variant
      }
    })
    .filter(it => it !== undefined)
}

type IndexData<V> = Map<string, V>

function buildIndex<V>(data: { objectID: string }[]): IndexData<V> {
  return new Map(data.map(it => [it.objectID, it] as [string, V]))
}

function buildProjectSourceControl(_pom: PomProject): ProjectSourceControl | undefined {
  return undefined // @TODO
}

function buildProjectProfile(
  objectID: string,
  maven: PomProject,
  _gradle: GradleModuleInfo | null,
  _module: JavaModuleInfo | null
): ProjectInfo {
  const profile: ProjectProfileInfo = {
    name: maven.pom.name || _module?.name || undefined,
    description: maven.pom.description || undefined
  }
  return {
    objectID,
    profile,
    source: buildProjectSourceControl(maven)
  }
}

function buildPackageSummaryIndex(
  mavenPoms: IndexData<RepositoryPomIndexEntry>,
  gradleVariants: IndexData<RepositoryGradleModulesIndexEntry>,
  modules: IndexData<RepositoryModulesIndexEntry>,
  eligible: RepositoryPackage[]
): RepositoryPackageIndexEntry[] {
  return eligible.map(pkg => {
    const variants: string[] = Array.from(gradleVariants.keys()).filter(it => it.startsWith(pkg.objectID))
    const module = modules.get(pkg.objectID)
    const maven = mavenPoms.get(pkg.objectID)
    if (!maven) throw new Error(`no parsed pom found for coordinate: ${pkg.coordinate.valueOf()}`)
    const projectInfo = buildProjectProfile(pkg.objectID, maven, pkg.gradle || null, module?.module?.module || null)
    const packageUrl = new PackageURL(
      'maven',
      maven.coordinate.groupId,
      maven.coordinate.artifactId,
      maven.coordinate.version,
      undefined,
      undefined
    )

    // don't list the ID redundantly
    delete projectInfo['objectID']

    return {
      objectID: pkg.objectID,
      purl: packageUrl.toString(),
      coordinate: pkg.coordinate,
      flags: pkg.flags,
      module: module?.module,
      gradleVariants: variants || [],
      project: projectInfo
    } satisfies RepositoryPackageIndexEntry
  })
}

function buildMavenIndex(eligible: RepositoryPackage[]): RepositoryPomIndexEntry[] {
  return eligible
    .map(pkg => {
      return {
        objectID: pkg.objectID,
        coordinate: pkg.coordinate,
        flags: pkg.flags,
        pom: pkg.maven
      }
    })
    .filter(it => it !== undefined)
}

type IDAssigned = {
  objectID: string
}

function sortEntries<V extends IDAssigned>(entries: V[]): V[] {
  return entries.sort((a, b) => a.objectID.localeCompare(b.objectID)) as V[]
}

function buildIndexes(allPackages: RepositoryPackage[]): RepositoryIndexBundle {
  const packageNames = new Set<string>()
  const eligible = allPackages.filter(pkg => pkgEligible(packageNames, pkg))
  const maven = sortEntries(buildMavenIndex(eligible))
  console.log(`Built index: 'maven' (entries: ${maven.length})`)
  const gradle = sortEntries(buildGradleIndex(eligible))
  console.log(`Built index: 'gradle' (entries: ${gradle.length})`)
  const modules = sortEntries(buildModulesIndex(eligible))
  console.log(`Built index: 'modules' (entries: ${modules.length})`)
  const packages = sortEntries(
    buildPackageSummaryIndex(buildIndex(maven), buildIndex(gradle), buildIndex(modules), eligible)
  )

  console.log(`Built index 'summary' (entries: ${packages.length})`)
  return {
    allPackages,
    modules,
    gradle,
    maven,
    packages
  }
}

function buildIndexMetadata(
  ts: number,
  name: string,
  index: unknown[],
  md5: string,
  sha1: string,
  sha256: string,
  sha512: string,
): RepositoryIndexMetadata {
  return {
    name: name.split('.').at(0) as string,
    version: formatVersion.toString(),
    count: index.length,
    generated: ts,
    md5,
    sha1,
    sha256,
    sha512,
  }
}

function buildIndexFile(ts: number, name: string,  contents: unknown[], pretty: boolean = DEFAULT_PRETTY): RepositoryIndexFile {
  const md5 = createHash('md5')
  const sha1 = createHash('sha1')
  const sha256 = createHash('sha256')
  const sha512 = createHash('sha512')

  let rendered: string
  try {
    rendered = JSONStringify(contents, {
      space: pretty ? 2 : 0
    })
  } catch (err) {
    console.error(err)
    throw err
  }
  md5.update(rendered)
  sha1.update(rendered)
  sha256.update(rendered)
  sha512.update(rendered)

  const md5hex = md5.digest('hex')
  const sha1hex = sha1.digest('hex')
  const sha256hex = sha256.digest('hex')
  const sha512hex = sha512.digest('hex')

  const metadata = buildIndexMetadata(
    ts,
    name,
    contents,
    md5hex,
    sha1hex,
    sha256hex,
    sha512hex
  )
  let renderedMetadata: string
  try {
    renderedMetadata = JSONStringify(metadata, {
      space: pretty ? 2 : 0
    })
  } catch (err) {
    console.error(err)
    throw err
  }

  return {
    name,
    contents: rendered,
    metadata: renderedMetadata,
    md5: md5hex,
    sha1: sha1hex,
    sha256: sha256hex,
    sha512: sha512hex
  }
}

async function prepareContent(indexes: RepositoryIndexBundle): Promise<RepositoryIndexFile[]> {
  // build modules index file
  const timestamp = +(new Date())
  return [
    buildIndexFile(timestamp, 'modules.json', indexes.modules),
    buildIndexFile(timestamp, 'gradle.json', indexes.gradle),
    buildIndexFile(timestamp, 'maven.json', indexes.maven),
    buildIndexFile(timestamp, 'packages.json', indexes.packages)
  ]
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
  const metadata = join(root, `${write.name.split('.').at(0)}.metadata.json`)
  const md5target = join(root, hashFileName('md5'))
  const sha1target = join(root, hashFileName('sha1'))
  const sha256target = join(root, hashFileName('sha256'))
  const sha512target = join(root, hashFileName('sha512'))

  await writeFile(json, write.contents)
  await writeFile(metadata, write.metadata)
  await writeFile(md5target, formatHashfile(write.name, model.HashAlgorithm.MD5, write.md5))
  await writeFile(sha1target, formatHashfile(write.name, model.HashAlgorithm.SHA1, write.sha1))
  await writeFile(sha256target, formatHashfile(write.name, model.HashAlgorithm.SHA256, write.sha256))
  await writeFile(sha512target, formatHashfile(write.name, model.HashAlgorithm.SHA512, write.sha512))
  console.log(`Index written: '${write.name}' (size: ${write.contents.length})`)
}

async function writeIndexes(outpath: string, indexes: RepositoryIndexBundle, write: boolean): Promise<RepositoryIndexBundle> {
  const resolvedOut = resolve(outpath)
  console.log(`Writing indexes → ${resolvedOut}`)
  if (!existsSync(resolvedOut)) {
    await mkdir(resolvedOut, { recursive: true })
  }
  const writes = await prepareContent(indexes)
  if (write) {
    for (const write of writes) {
      await writeIndexFile(resolvedOut, write)
    }
    console.info('Index write complete.')
  }
  return indexes
}

/**
 * Build indexes for a Maven repository.
 *
 * @param path Path to the repository
 * @param outpath Output path (directory) for generated index files
 * @param write Whether to write
 */
export async function buildRepositoryIndexes(path: string, outpath: string, write: boolean): Promise<RepositoryIndexBundle> {
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

  return writeIndexes(outpath, buildIndexes(all_packages), write)
}
