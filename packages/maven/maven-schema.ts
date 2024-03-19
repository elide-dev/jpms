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

import { object, array, string, InferType, ObjectSchema } from "yup"
import { POM_MODEL_VERSION } from "./maven-constants"

import {
  MavenProjectLicense,
  MavenProjectContact,
  MavenProjectCoordinate,
  MavenProjectDependency,
  MavenProjectSourceControl,
  MavenProject as MavenProjectType,
  MavenProjectManagedDependency,
} from "./maven-model"

export type {
  MavenProjectLicense,
  MavenProjectContact,
  MavenProjectSourceControl,
  MavenProjectType,
}

// Schema for a Maven project license.
const mavenLicenseSchema: ObjectSchema<MavenProjectLicense> = object({
  name: string().label("Name").required(),
  url: string().label("URL").optional(),
  distribution: string().label("Distribution").optional(),  // add enum (@TODO)
})

// Schema for a Maven developer or organization.
const mavenContactSchema: ObjectSchema<MavenProjectContact> = object({
  id: string().label("ID").required(),
  name: string().label("Name").optional(),
  email: string().label("Email").optional(),
  url: string().label("URL").optional(),
  organization: string().label("Organization").optional(),
  organizationUrl: string().label("Organization URL").optional(),
})

// Shape for SCM settings.
const scmType = {
  url: string().label("URL").required(),
  connection: string().label("Connection").required(),
  developerConnection: string().label("Developer Connection").optional(),
}

// Schema for a Maven project's source control.
export const mavenScmSchema: ObjectSchema<MavenProjectSourceControl> = object(scmType)

// Base for a Maven coordinate.
const coordinateBase = {
  groupId: string().label("Group").required(),
  artifactId: string().label("Artifact").required(),
  classifier: string().label("Classifier").optional(),
}

/**
 * Schema for a Maven coordinate.
 */
export const coordinateSchema: ObjectSchema<Omit<MavenProjectCoordinate, 'version'>> = object(coordinateBase)

// Version-optional coordinate.
const versionedOptionalCoordinateBase = {
  ...coordinateBase,
  version: string().label("Version").optional(),
}

// Version-required coordinate.
const versionedRequiredCoordinateBase = {
  ...coordinateBase,
  version: string().label("Version").required(),
}

// Exclusions property.
const dependencyExclusions = {
  exclusions: array(coordinateSchema).label("Exclusions").optional(),
}

// Scope property.
const dependencyScope = {
  scope: string().label("Scope").optional(),  // add enum (@TODO)
}

/**
 * Schema for a dependency specified in a Maven project.
 */
export const dependencySchema: ObjectSchema<MavenProjectDependency> = object({
  ...versionedOptionalCoordinateBase,
  ...dependencyExclusions,
  ...dependencyScope,
})

/**
 * Schema for a managed dependency specified in a Maven project.
 */
export const managedDependencySchema: ObjectSchema<MavenProjectManagedDependency> = object({
  ...versionedRequiredCoordinateBase,
  ...dependencyExclusions,
})

/**
 * Schema for a full Maven project.
 */
export const mavenProjectSchema: ObjectSchema<MavenProjectType> = object({
  modelVersion: string().label("Model Version").matches(new RegExp(POM_MODEL_VERSION)).required(),
  name: string().label("Name").optional(),
  description: string().label("Description").optional(),
  url: string().label("URL").optional(),
  packaging: string().label("Packaging").required(),  // add enum (@TODO)
  licenses: array(mavenLicenseSchema).label("Licenses").optional(),
  developers: array(mavenContactSchema).label("Developers").optional(),
  scm: object(scmType).label("SCM").optional(),
  dependencyManagement: array(managedDependencySchema).label("Managed Dependencies").optional(),
  dependencies: array(dependencySchema).label("Dependencies").optional(),
})

/**
 * Maven Project: Schema
 *
 * Inferred type for a schema-verified Maven Project Object Model (POM) structure; instances of this interface have
 * been parsed with validation.
 */
export interface MavenProjectSchema extends InferType<typeof mavenProjectSchema> {
    //
}
