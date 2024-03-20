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

import { expect, test } from "@jest/globals";
import { join } from "node:path";
import { GradleModule } from "../gradle-facade";
import { GradleAttribute, GradleModuleType } from "../gradle-model";
import { gradleModule } from "../gradle-util";

test("gradle module facade instance parse from file", async () => {
  const mod = await GradleModule.fromFile(__dirname, "gradle-module-sample.pom");
  expect(mod).not.toBeNull();
  expect(mod.file()).not.toBeNull();
  expect(mod.module()).not.toBeNull();
});

test("gradle module facade instance parse from file (from data)", async () => {
  const sampleModule = (await gradleModule(__dirname, "gradle-module-sample.json"))?.module;
  expect(sampleModule).toBeDefined();
  const mod = await GradleModule.fromData(sampleModule as GradleModuleType);
  expect(mod).not.toBeNull();
  expect(mod.file()).toBeNull();
  expect(mod.module()).not.toBeNull();
});

test("gradle module facade instance parse from file (unknown)", async () => {
  let caught = false;
  try {
    await GradleModule.fromFile(__dirname, "gradle-module-sample-unknown.pom");
  } catch (err) {
    caught = true;
  }
  expect(caught).toBeTruthy();
});

test("gradle module facade instance parse from file (unknown, full path)", async () => {
  let caught = false;
  try {
    await GradleModule.fromFile(join(__dirname, "gradle-module-sample-unknown.pom"), undefined, { validate: true });
  } catch (err) {
    caught = true;
  }
  expect(caught).toBeTruthy();
});

test("gradle module facade instance parse from file with options (full path)", async () => {
  const mod = await GradleModule.fromFile(join(__dirname, "gradle-module-sample.pom"), undefined, { validate: true });
  expect(mod).not.toBeNull();
  expect(mod.file()).not.toBeNull();
  expect(mod.module()).not.toBeNull();
});

test("gradle module facade instance parse from file with options (validate)", async () => {
  const mod = await GradleModule.fromFile(__dirname, "gradle-module-sample.pom", { validate: true });
  expect(mod).not.toBeNull();
  expect(mod.file()).not.toBeNull();
  expect(mod.module()).not.toBeNull();
});

test("gradle module facade instance parse from file with options (non-validate)", async () => {
  const mod = await GradleModule.fromFile(__dirname, "gradle-module-sample.pom", { validate: false });
  expect(mod).not.toBeNull();
  expect(mod.file()).not.toBeNull();
  expect(mod.module()).not.toBeNull();
});

test("gradle module facade instance parse from file with options (lenient)", async () => {
  const mod = await GradleModule.fromFile(__dirname, "gradle-module-sample.pom", { lenient: true });
  expect(mod).not.toBeNull();
  expect(mod.file()).not.toBeNull();
  expect(mod.module()).not.toBeNull();
});

test("gradle module facade instance parse from file with options (non-lenient)", async () => {
  const mod = await GradleModule.fromFile(__dirname, "gradle-module-sample.pom", { lenient: false });
  expect(mod).not.toBeNull();
  expect(mod.file()).not.toBeNull();
  expect(mod.module()).not.toBeNull();
});

test("gradle module facade resolve component attribute", async () => {
  const mod = await GradleModule.fromFile(__dirname, "gradle-module-sample.pom");
  expect(mod).not.toBeNull();
  expect(mod.file()).not.toBeNull();
  expect(mod.module()).not.toBeNull();

  expect(mod.attribute(GradleAttribute.STATUS)).not.toBeNull();
  expect(mod.attribute(GradleAttribute.STATUS)).toBe("release");
});

test("gradle module facade resolve unknown attribute", async () => {
  const mod = await GradleModule.fromFile(__dirname, "gradle-module-sample.pom");
  expect(mod).not.toBeNull();
  expect(mod.file()).not.toBeNull();
  expect(mod.module()).not.toBeNull();

  expect(mod.attribute("unknown")).toBeNull();
});

test("gradle module facade resolve unknown variant by name", async () => {
  const mod = await GradleModule.fromFile(__dirname, "gradle-module-sample.pom");
  expect(mod).not.toBeNull();
  expect(mod.file()).not.toBeNull();
  expect(mod.module()).not.toBeNull();
  expect(mod.variant("unknown")).toBeNull();
});

test("gradle module facade resolve variant by name", async () => {
  const mod = await GradleModule.fromFile(__dirname, "gradle-module-sample.pom");
  expect(mod).not.toBeNull();
  expect(mod.file()).not.toBeNull();
  expect(mod.module()).not.toBeNull();

  const variant = mod.variant("watchosX64ApiElements-published");
  expect(variant).not.toBeNull();
});
