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

const MAVEN_SEPARATOR = ':'

/**
 * Maven Coordinate
 *
 * Describes the shape of a parsed Maven coordinate, with a group, artifact, and version
 */
export type MavenCoordinate = {
  groupId: string,
  artifactId: string,
  version?: string,
  classifier?: string,
}

/**
 * Maven Project: Coordinate
 *
 * Specializes a Maven Coordinate for the raw structure provided by a POM
 */
export type MavenProjectCoordinate = {
  groupId: string,
  artifactId: string,
  version: string,
}

/**
 * Maven Project: Parent Coordinate
 *
 * Unions with a regular coordinate based on parameters only provided to parent coordinates
 */
export type MavenProjectParentCoordinate = MavenProjectCoordinate | {
  relativePath?: string
}

/**
 * Maven Project: Parent Info
 *
 * Some Maven projects have a parent project; this models that block, which can override or supply a default for the
 * artifact ID / group ID and version.
 *
 * If provided, the parent coordinate version is required and an optional relative path can be specified.
 */
export type MavenProjectParentInfo = {
  parent: MavenProjectParentCoordinate
}

/**
 * Maven Project: Coordinate or Inheritance
 *
 * Every Maven project must specify coordinates; either these coordinates are specified in the project itself, as
 * `groupId` and `artifactId` properties (with a `version`), or these properties can inherit from their parent, if
 * provided.
 *
 * Note that it is possible to provide these properties as well as a parent.
 */
export type MavenProjectCoordinateOrInherited = (
  MavenProjectCoordinate |
  MavenProjectParentInfo
)

/**
 * Maven Project: Packaging
 *
 * Enumerates known packaging options which can be specified for a Maven project; technically, the packaging field can
 * be extended, so `string` is also accepted in the POM object.
 */
export enum MavenProjectPackaging {
  POM = 'pom',
  JAR = 'jar',
  WAR = 'war',
  BUNDLE = 'bundle'
}

/**
 * Maven Project: License Distribution
 *
 * Enumerates known distribution types for a license which is mapped in the `<licenses>` block for a Maven project.
 */
export enum MavenProjectLicenseDistribution {
  REPO = 'repo'
}

/**
 * Maven Project: License
 *
 * Describes a license which is mapped in the `<licenses>` block for a Maven proejct.
 */
export type MavenProjectLicense = {
  name: string,
  url?: string,
  distribution?: MavenProjectLicenseDistribution | string,
}

/**
 * Maven Project: Contact Person
 *
 * Describes a contact (of type person) which is listed in a Maven project.
 */
export type MavenProjectContactPerson = {
  name: string,
  email?: string,
  url?: string,
}

/**
 * Maven Project: Contact Organization
 *
 * Describes a contact (of type organization) which is listed in a Maven project.
 */
export type MavenProjectContactOrg = {
  organization: string,
  organizationUrl?: string,
}

/**
 * Maven Project: Contact
 *
 * Describes information for an individual, or an organization, or both, which is affixed to a Maven project in a field
 * such as `<developers>`.
 */
export type MavenProjectContact = Partial<MavenProjectContactPerson> & Partial<MavenProjectContactOrg> & {
  id: string,
}

/**
 * Maven Project: Source Control
 *
 * Describes information specified in the `<scm>` or `<developerScm>` fields within a Maven project.
 */
export type MavenProjectSourceControl = {
  url: string,
  connection: string,
  developerConnection?: string,
}

/**
 * Maven Project: Dependency Use
 *
 * Enumerates types of dependency usage which can be specified for a given Maven dependency.
 */
export enum MavenProjectDependencyUse {
  COMPILE = 'compile',
  PROVIDED = 'provided',
  TEST = 'test',
}

/**
 * Maven Project: Dependency Scope
 *
 * Describes a dependency mapped in the `<dependencies>` block in a Maven project, which is eligible to specify the
 * `scope` property.
 */
export type MavenProjectDependencyScope = {
  scope: MavenProjectDependencyUse | string,
}

/**
 * Maven Project: Dependency Exclusion
 *
 * Describes exclusions for a dependency mapped within a Maven project.
 */
export type MavenProjectDependencyExclusion = Omit<MavenCoordinate, 'version'>

/**
 * Maven Project: Dependency Exclusions
 *
 * Describes exclusions for a dependency mapped within a Maven project.
 */
export type MavenProjectDependencyExclusions = {
  exclusions: MavenProjectDependencyExclusion[],
}

/**
 * Maven Project: Dependency
 *
 * Describes a dependency mapped in the `<dependencies>` or `<dependencyManagement>` blocks; a dependency includes a
 * regular Maven coordinate, plus use-type and/or versioning information.
 */
export type MavenProjectDependency = (
  MavenCoordinate & Partial<MavenProjectDependencyScope> & Partial<MavenProjectDependencyExclusions>
)

/**
 * Maven Project: Managed Dependency
 *
 * Describes a dependency mapped in the `<dependencyManagement>` block; a managed dependency can include exclusion
 * information, but no scope.
 */
export type MavenProjectManagedDependency = (
  MavenCoordinate & Partial<MavenProjectDependencyExclusions>
)

/**
 * Maven Project
 *
 * Top-level type for a raw interpreted Maven Project Object Model (POM); represents the interpreted raw project model,
 * considering any parent model properties which apply.
 */
// export type MavenProject = MavenProjectCoordinateOrInherited & Partial<MavenProjectParentInfo> & {
export type MavenProject = {
  modelVersion: string,
  name?: string,
  description?: string,
  url?: string,
  packaging: MavenProjectPackaging | string,
  licenses?: MavenProjectLicense[],
  developers?: MavenProjectContact[],
  scm?: MavenProjectSourceControl,
  dependencyManagement?: MavenProjectManagedDependency[],
  dependencies?: MavenProjectDependency[],
}

/**
 * Parse a Maven coordinate from a string
 *
 * This variant of this method requires that the Maven coordinate provide a version
 *
 * @param coordinate String coordinate to parse
 * @returns Maven Coordinate record
 */
export function parseMavenCoordinate(coordinate: string): MavenCoordinate {
  const segments = coordinate.split(MAVEN_SEPARATOR)

  // requires at least 3 segments (`group:artifact:version`)
  if (segments.length < 3) throw new Error(`Invalid segment count in Maven coordinate: '${coordinate}'`)
  const version = segments[segments.length - 1]  // version is last
  const artifact = segments[segments.length - 2]  // artifact is second-to-last
  const group = segments.slice(0, segments.length - 2).join(MAVEN_SEPARATOR)
  return mavenCoordinate(group, artifact, version)
}

/**
 * Build a Maven Coordinate record from the provided inputs
 *
 * @param groupId Group ID for the artifact
 * @param artifactId Artifact ID for the artifact
 * @param version Version string for the artifact
 * @returns Maven Coordinate record
 */
export function mavenCoordinate(
  groupId: string,
  artifactId: string,
  version?: string,
  classifier?: string,
): MavenCoordinate {
  return {
    groupId,
    artifactId,
    version,
    classifier,
    // @ts-ignore
    valueOf: () => `${groupId}:${artifactId}:${version}`
  }
}
