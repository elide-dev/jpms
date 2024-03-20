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

import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { GradleModuleType, GradleModuleInfo } from "./gradle-model";

/**
 * Read a Gradle Module definition from the provided absolute path
 *
 * @param absolutePath Absolute path to the Gradle module to read
 * @returns Promise for a decoded Gradle module
 */
export async function readGradleModule(absolutePath: string): Promise<GradleModuleType> {
  const contents = await readFile(absolutePath, { encoding: "utf8" });
  if (!contents) throw new Error(`Failed to read Gradle module at path '${absolutePath}'`);

  const obj = JSON.parse(contents) as GradleModuleType;
  if (Object.keys(obj).length === 0) throw new Error("Parsed Gradle Module is an empty object");
  return obj;
}

/**
 * Options that can be provided to `gradleModule` when reading a Gradle Module descriptor
 */
export type GradleModuleOptions = {
  /** Whether to allow missing files and other lenient behavior. */
  lenient?: boolean;

  /** Whether to perform schema validation steps on parsed Gradle Modules. */
  validate?: boolean;
};

/**
 * Options that can be provided to `validateGradleModule` when verifying the schema expected for a Gradle Module
 * descriptor.
 */
export type GradleModuleVerifyOptions = {
  // Nothing at this time.
};

/**
 * Validate the structure/schema of a Gradle Module descriptor; based on the provided options, different validation may
 * be available.
 *
 * @param module Parsed module info to validate/verify
 * @param options Options to apply to verification
 * @return Boolean (if there is no failure and `err` is not set in the options)
 */
// @ts-ignore
export function validateGradleModule(module: GradleModuleInfo, options?: GradleModuleVerifyOptions): boolean {
  return true; // not yet implemented
}

/**
 * Decode a Gradle Module into a `GradleModuleInfo` record
 *
 * If `validate` is turned on in the provided `options`, `strict` mode is applied for verifying the produced module,
 * so errors are thrown if issues are encountered.
 *
 * Validation is active by default; lenient mode is disabled by default.
 *
 * @param path Path to the Gradle module
 * @param pomName Corresponding POM name (just the basename of the file)
 * @param options Options to apply to this parse operation
 * @returns Promise for a decoded Gradle module info spec
 */
export async function gradleModule(
  path: string,
  pomName: string,
  options?: GradleModuleOptions,
): Promise<GradleModuleInfo | undefined> {
  const moduleName = pomName.replace(".pom", ".module");
  const moduleNameAlt = pomName.replace(".pom", ".json");
  const modulePath = resolve(join(path, moduleName));
  const modulePathAlt = resolve(join(path, moduleNameAlt));
  const moduleExists = existsSync(modulePath);
  const moduleExistsAlt = existsSync(modulePathAlt);

  if (moduleExists || moduleExistsAlt) {
    const moduleNameResolved = moduleExists ? moduleName : moduleNameAlt;
    const moduleTarget = moduleExists ? modulePath : modulePathAlt;

    const mod = {
      path: moduleTarget,
      module: await readGradleModule(join(path, moduleNameResolved)),
    };
    if (options?.validate !== false) validateGradleModule(mod, { strict: true, err: true });
    return mod;
  }

  if (options?.lenient !== true) throw new Error(`Failed to locate Gradle Module at '${modulePath}'`);

  // no module file found for this release
  return undefined;
}
