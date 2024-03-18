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

import { expect, test } from "@jest/globals"
import { MavenCoordinate, mavenCoordinate, parseMavenCoordinate } from "../model"

test("build a maven coordinate", () => {
  const coordinate: MavenCoordinate = mavenCoordinate('com.google.guava', 'guava', '1.0.0')
  expect(coordinate).not.toBeNull()
  expect(coordinate.groupId).toBe('com.google.guava')
  expect(coordinate.artifactId).toBe('guava')
  expect(coordinate.version).toBe('1.0.0')
})

test("build a maven coordinate with a classifier", () => {
  const coordinate: MavenCoordinate = mavenCoordinate('com.google.guava', 'guava', '1.0.0', 'linux-amd64')
  expect(coordinate).not.toBeNull()
  expect(coordinate.groupId).toBe('com.google.guava')
  expect(coordinate.artifactId).toBe('guava')
  expect(coordinate.version).toBe('1.0.0')
  expect(coordinate.classifier).toBe('linux-amd64')
})

test("build a maven coordinate to string", () => {
  const coordinate: MavenCoordinate = mavenCoordinate('com.google.guava', 'guava', '1.0.0')
  expect(coordinate).not.toBeNull()
  expect(coordinate.groupId).toBe('com.google.guava')
  expect(coordinate.artifactId).toBe('guava')
  expect(coordinate.version).toBe('1.0.0')
  expect(coordinate.valueOf()).toBe('com.google.guava:guava:1.0.0')
})

test("parsing a maven coordinate from a string", () => {
  const coordinate: MavenCoordinate = mavenCoordinate('com.google.guava', 'guava', '1.0.0')
  expect(coordinate).not.toBeNull()
  expect(coordinate.groupId).toBe('com.google.guava')
  expect(coordinate.artifactId).toBe('guava')
  expect(coordinate.version).toBe('1.0.0')
  expect(coordinate.valueOf()).toBe('com.google.guava:guava:1.0.0')
  const parsed: MavenCoordinate = parseMavenCoordinate(coordinate.valueOf() as string)
  expect(parsed).not.toBeNull()
  expect(parsed.groupId).toBe('com.google.guava')
  expect(parsed.artifactId).toBe('guava')
  expect(parsed.version).toBe('1.0.0')
  expect(parsed.valueOf()).toBe(coordinate.valueOf())
})
