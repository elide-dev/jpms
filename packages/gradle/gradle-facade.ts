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

import { basename, dirname } from "node:path";
import { GradleAttribute, GradleModuleSchema, GradleVariantSchema } from "./gradle-schema";
import { GradleModuleOptions, gradleModule } from "./gradle-util";

/**
 * Gradle Info
 *
 * Basic interface which describes generic info provided by various Gradle objects, including variants,
 * components, and so on.
 */
export interface GradleInfo {
  /**
   * Obtain the value of the specified Gradle attribute, or `null` if no value is set
   *
   * @param attr Attribute to obtain a value for
   * @return Attribute value as a `string`, or `null`
   */
  attribute(attr: GradleAttribute | string): string | null;
}

/**
 * Gradle Variant
 */
export class GradleVariant implements GradleInfo {
  /**
   * Primary constructor.
   *
   * @param _variant Variant wrapped by this instance
   */
  private constructor(private readonly _variant: GradleVariantSchema) {}

  /**
   * Obtain the value of the specified Gradle attribute, or `null` if no value is set
   *
   * @param attr Attribute to obtain a value for
   * @return Value as a string, or `null`
   */
  attribute(attr: GradleAttribute): string | null {
    return this._variant.attributes[attr] || null;
  }

  /**
   * Wrap variant data in a Gradle Variant
   *
   * @param data Data to wrap
   * @returns Wrapped variant data
   */
  static fromData(data: GradleVariantSchema): GradleVariant {
    return new GradleVariant(data);
  }
}

/**
 * Gradle Module
 *
 * Describes an interpreted Gradle Module, with a backing implementation that allows the module definition to be
 * interrogated with various APIs; attributes can be resolved, files within the release can be located, and
 * support for various use cases can be determined.
 *
 * Gradle Module instances can be created from an interpreted `GradleModuleSchema`, or can be loaded directly
 * from a JSON Gradle Module definition.
 */
export class GradleModule implements GradleInfo {
  /**
   * Primary constructor.
   *
   * @param _module Parsed and validated module definition
   * @param _file Filepath to the module, if known
   */
  private constructor(
    private readonly _module: GradleModuleSchema,
    private readonly _file: string | null,
  ) {}

  /**
   * @returns Underlying Gradle Module data
   */
  module(): GradleModuleSchema {
    return this._module;
  }

  /**
   * @returns File from which this definition was parsed, as applicable
   */
  file(): string | null {
    return this._file;
  }

  /**
   * Obtain a variant by name
   *
   * @param name Name of the variant to retrieve
   * @return Requested Gradle Variant, or `null`
   */
  variant(name: string): GradleVariant | null {
    const variantData = this._module.variants.find((it) => it.name === name);
    if (variantData) return GradleVariant.fromData(variantData);
    return null;
  }

  /**
   * Obtain the value of the specified Gradle attribute
   *
   * @param attr Attribute to obtain a value for
   * @return Value as a string, or `null`
   */
  attribute(attr: GradleAttribute | string): string | null {
    return this._module.component.attributes[attr] || null;
  }

  /**
   * Create a Gradle Module instance from the provided schema
   *
   * @param schema Parsed/validated schema to create the module from
   * @param file Filename or path, if known
   * @return Wrapped module definition
   */
  static fromData(schema: GradleModuleSchema, file?: string): GradleModule {
    return new GradleModule(schema, file || null);
  }

  /**
   * Read a Gradle Module from the specified file
   *
   * @param path File path or directory
   * @param optionalName Name of the file if `path` is a directory
   * @param options Options to apply
   * @return Wrapped module definition
   */
  static async fromFile(path: string, optionalName?: string, options?: GradleModuleOptions): Promise<GradleModule> {
    const parent = !!optionalName ? path : dirname(path);
    const filename = !!optionalName ? optionalName : basename(path);
    const mod = await gradleModule(
      parent,
      filename,
      options || {
        validate: true,
        lenient: true,
      },
    );
    if (!mod) throw new Error(`Failed to load Gradle module from file: ${parent}/${filename}`);
    return this.fromData(mod.module, mod.path);
  }
}
