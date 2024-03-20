import { object, array, string, number, InferType, ObjectSchema } from "yup";
import { GRADLE_SCHEMA_VERSION } from "./gradle-constants";

import {
  GradleAttribute,
  GradleAttributes,
  GradleCreatedBy,
  GradleCreatorInfo,
  GradleComponent,
  GradleDependencyDeclaration,
  GradleModuleType,
  GradleReleaseFile,
  GradleVariant,
} from "./gradle-model";

export type {
  GradleAttribute,
  GradleAttributes,
  GradleCreatedBy,
  GradleCreatorInfo,
  GradleComponent,
  GradleDependencyDeclaration,
  GradleModuleType,
  GradleReleaseFile,
};

const gradleComponentType = {
  url: string().label("URL").required(),
  group: string().label("Group").required(),
  module: string().label("Module").required(),
  version: string().label("Version").required(),
  attributes: object().label("Attributes").required(),
};

export const gradleComponentSchema: ObjectSchema<GradleComponent> = object(gradleComponentType);

const gradleCreatedByType = {
  gradle: object({
    version: string().label("Gradle Version").required(),
  })
    .label("Gradle")
    .required(),
};

export const gradleCreatedBySchema: ObjectSchema<GradleCreatedBy> = object(gradleCreatedByType);

export const gradleDependencySchema: ObjectSchema<GradleDependencyDeclaration> = object({
  group: string().label("Group").required(),
  module: string().label("Module").required(),
  version: object({
    requires: string().label("Requires").optional(),
    prefers: string().label("Prefers").optional(),
    strictly: string().label("Strictly").optional(),
  })
    .label("Version")
    .required(),
});

export const gradleFileSchema: ObjectSchema<GradleReleaseFile> = object({
  name: string().label("Name").required(),
  url: string().label("URL").required(),
  size: number().label("Size").required(),
  md5: string().label("MD5").required(),
  sha1: string().label("SHA1").required(),
  sha256: string().label("SHA256").optional(),
  sha512: string().label("SHA512").optional(),
});

export const gradleVariantSchema: ObjectSchema<GradleVariant> = object({
  name: string().label("Name").required(),
  attributes: object().label("Attributes").required(),
  dependencies: array(gradleDependencySchema).optional(),
  files: array(gradleFileSchema).optional(),
});

export const gradleAttributesSchema: ObjectSchema<GradleAttributes> = object({
  // @TODO(sgammon): keyof string, valueof string, known attrs?
});

export const gradleModuleSchema: ObjectSchema<GradleModuleType> = object({
  // `formatVersion: "1.1"`
  formatVersion: string().label("Format Version").matches(new RegExp(GRADLE_SCHEMA_VERSION)).required(),

  // `component: {...}`
  component: object(gradleComponentType).label("Component").required(),

  // `createdBy: {...}`
  createdBy: object(gradleCreatedByType).label("Created By").required(),

  // `variants: [{...}]`
  variants: array(gradleVariantSchema).label("Variants").required(),
});

/**
 * Type inference for a variant schema.
 */
export interface GradleVariantSchema extends InferType<typeof gradleVariantSchema> {
  // Nothing extending at this time.
}

/**
 * Type inference for a module schema.
 */
export interface GradleModuleSchema extends InferType<typeof gradleModuleSchema> {
  // Nothing extending at this time.
}
