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

import { resolve } from "node:path";
import { env } from "node:process";
import { expect, test } from "@jest/globals";
import { JavaToolchain } from "../java-home";

test("obtain the current java toolchain from JAVA_HOME", () => {
  expect(JavaToolchain.current()).toBeDefined();
  const toolchain = JavaToolchain.current();
  expect(toolchain.path()).toBeDefined();
  expect(toolchain.versionInfo()).toBeDefined();
  expect(toolchain.version()).toBeDefined();
  expect(toolchain.semver()).toBeDefined();
});

test("obtain a java toolchain for a path", () => {
  expect(JavaToolchain.forPath(resolve(env["JAVA_HOME"] as string))).toBeDefined();
});

test("obtain the current java compiler from JAVA_HOME", () => {
  expect(JavaToolchain.current().compiler()).toBeDefined();
});

test("obtain the current java launcher from JAVA_HOME", () => {
  expect(JavaToolchain.current().launcher()).toBeDefined();
});

test("obtain the current jar tool from JAVA_HOME", () => {
  expect(JavaToolchain.current().tool('jar')).toBeDefined();
});
