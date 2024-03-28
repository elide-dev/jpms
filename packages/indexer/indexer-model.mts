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
import { ParsedOutput as MavenPom } from '@javamodules/maven/parser'
import { GradleModuleInfo } from '@javamodules/gradle'
import { JavaModuleInfo } from '@javamodules/java/model'

/**
 * Repository JAR Info
 *
 * Describes decoded/parsed/interpreted information about a JAR.
 */
export type RepositoryJarInfo = {
  modular: boolean
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
 * Repository Package
 *
 * Describes an interpreted repository package, which includes its loaded POM and Gradle
 * content, as needed and applicable
 */
export type RepositoryPackage = {
  coordinate: MavenCoordinate
  pom: string
  root: string
  gradle?: GradleModuleInfo
  maven: MavenPom
  jars: RepositoryJar[]
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

/**
 * Repository Modules Index
 *
 * Describes an index file which maps indexed artifacts by their Java Module coordinate;
 * this mapping can produce an offset in the `RepositoryArtifactsIndex`.
 */
export type RepositoryModulesIndex = {}

/**
 * Repository Index Bundle
 *
 * Gathers together all computed materialized indexes for a given Maven repository; used
 * as an intermediate data structure before indexes are written.
 */
export type RepositoryIndexBundle = {
  artifacts: RepositoryArtifactsIndex
  modules: RepositoryModulesIndex
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
