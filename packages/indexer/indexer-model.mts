import { MavenCoordinate } from '@javamodules/maven'
import { GradleModuleInfo } from '@javamodules/gradle'

/**
 * Repository Package
 *
 * Describes an interpreted repository package, which includes its loaded POM and Gradle
 * content, as needed and applicable
 */
export type RepositoryPackage = {
  maven: MavenCoordinate
  pom: string
  root: string
  gradle?: GradleModuleInfo
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
