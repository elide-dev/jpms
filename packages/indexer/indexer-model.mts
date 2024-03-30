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

import { MavenCoordinate } from '@javamodules/maven'
import { PomProject } from '@javamodules/maven/parser'
import { GradleModuleInfo } from '@javamodules/gradle'
import { JavaModuleInfo, JvmTarget } from '@javamodules/java/model'

/**
 * Repository JAR Info
 *
 * Describes decoded/parsed/interpreted information about a JAR.
 */
export type RepositoryJarInfo = {
  modular: boolean
  mrjar: boolean
  minimumBytecodeTarget: JvmTarget
  maximumBytecodeTarget?: JvmTarget
  automaticModuleName?: string
  mainClass?: string
  module?: JavaModuleInfo
}

/**
 * Repository JAR
 *
 * Describes information about a JAR within a Maven repository.
 */
export type RepositoryJar = RepositoryJarInfo & {
  path: string
  name: string
  coordinate: MavenCoordinate
  size: number
}

/**
 * Package Flags
 *
 * Indicates top-level flags which are set for each package for easy faceting and querying.
 */
export type PackageFlags = {
  modular: boolean
  gradleModule: boolean
  mrjar: boolean
  minimumBytecodeTarget: JvmTarget
  maximumBytecodeTarget?: JvmTarget
}

/**
 * Repository Package
 *
 * Describes an interpreted repository package, which includes its loaded POM and Gradle
 * content, as needed and applicable
 */
export type RepositoryPackage = {
  key: string
  coordinate: MavenCoordinate
  pom: string
  gradle?: GradleModuleInfo
  maven: PomProject
  jars: RepositoryJar[]
  flags: PackageFlags
  valueOf: any
}

/**
 * Indexed Artifact
 *
 * Describes a single release of artifacts, including its Maven coordinate, POM location,
 * Gradle Module, and parsed metadata from the POM and Gradle Module.
 */
export type IndexedArtifact = {
  maven: MavenCoordinate
  pom: string
  name?: string
  description?: string
  gradle?: GradleModuleInfo
}

/**
 * Repository Artifacts Index
 *
 * Describes an index file which maps artifacts to their metadata; includes an index of
 * all available versions for a given artifact.
 */
export type RepositoryArtifactsIndex = {}

export type JarModulePair = {
  jar: string
  module: JavaModuleInfo
}

/**
 * Repository Modules Index Entry
 *
 * Describes an entry in an index file which maps indexed artifacts by their Java Module coordinate.
 */
export type RepositoryModulesIndexEntry = {
  // Well-qualified Maven coordinate.
  key: string
  coordinate: MavenCoordinate
  flags: PackageFlags
  module: JarModulePair
}

/**
 * Repository Gradle Modlues Index Entry
 *
 * Describes an entry in an index file which maps indexed artifacts by their Gradle Module info.
 */
export type RepositoryGradleModulesIndexEntry = {
  // Well-qualified Maven coordinate.
  key: string
  coordinate: MavenCoordinate
  flags: PackageFlags
  gradle: GradleModuleInfo
}

/**
 * Repository Index Bundle
 *
 * Gathers together all computed materialized indexes for a given Maven repository; used
 * as an intermediate data structure before indexes are written.
 */
export type RepositoryIndexBundle = {
  artifacts: RepositoryArtifactsIndex
  gradle: RepositoryGradleModulesIndexEntry[]
  modules: RepositoryModulesIndexEntry[]
}

/**
 * Repository Index File
 *
 * Specifies the contents of a single index file as JSON; the contents are written to the
 * named file, and an additional compressed file at `<name>.gz` if `compressed` content is
 * provided.
 *
 * Hashes are written to the `<name>.<hash>` as peers to the index file.
 */
export type RepositoryIndexFile = {
  name: string
  contents: string
  gzip?: string
  md5: string
  sha1: string
  sha256: string
  sha512: string
}
