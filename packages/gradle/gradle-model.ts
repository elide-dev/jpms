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

/**
 * Gradle Attribute
 *
 * Enumerates well-known or commonly used Gradle attribute names
 */
export enum GradleAttribute {
  STATUS = "org.gradle.status",
  CATEGORY = "org.gradle.category",
  USAGE = "org.gradle.usage",
  BUNDLING = "org.gradle.dependency.bundling",
  DOCS_TYPE = "org.gradle.docstype",
  KOTLIN_PLATFORM = "org.jetbrains.kotlin.platform.type",
  KOTLIN_NATIVE_TARGET = "org.jetbrains.kotlin.native.target",
}

/**
 * Gradle Attributes
 *
 * Describes the type structure of generic Gradle attributes, which may or may not be known
 */
export type GradleAttributes = {
  [key: GradleAttribute | string]: string;
};

/**
 * Gradle Version Spec
 *
 * Describes the version specification info for a given Gradle Module dependency
 */
export type GradleVersionSpec = {
  requires?: string;
  prefers?: string;
  strictly?: string;
};

/**
 * Gradle Dependency
 *
 * Describes a dependency declared for a Gradle Module
 */
export type GradleDependencyDeclaration = {
  group: string;
  module: string;
  version: GradleVersionSpec;
};

/**
 * Gradle Release File
 *
 * Describes a file which is referenced by a variant in a Gradle Module
 */
export type GradleReleaseFile = {
  name: string;
  url: string;
  size: number;
  md5: string;
  sha1: string;
  sha256?: string;
  sha512?: string;
};

/**
 * Gradle Variant
 *
 * Describes a single variant of a Gradle module
 */
export type GradleVariant = {
  name: string;
  attributes: GradleAttributes;
  files?: GradleReleaseFile[];
  dependencies?: GradleDependencyDeclaration[];
};

/**
 * Gradle Component
 *
 * Describes the module being provided by a Gradle Module definition
 */
export type GradleComponent = {
  url: string;
  group: string;
  module: string;
  version: string;
  attributes: GradleAttributes;
}

/**
 * Gradle Creator Info
 *
 * Describes information about a Gradle build agent that created a Gradle Module
 */
export type GradleCreatorInfo = {
  version: string
}

/**
 * Gradle Created-By
 *
 * Describes the build agent that created the Gradle Module info
 */
export type GradleCreatedBy = {
  gradle: GradleCreatorInfo,
}

/**
 * Gradle Module
 *
 * Describes the raw type structure of a Gradle module info file
 */
export type GradleModuleType = {
  formatVersion: string;
  component: GradleComponent;
  createdBy: GradleCreatedBy;
  variants: GradleVariant[];
};

/**
 * Gradle Module Info
 *
 * Gathers the path for a Gradle module file with its contents
 */
export type GradleModuleInfo = {
  path: string;
  module: GradleModuleType;
};
