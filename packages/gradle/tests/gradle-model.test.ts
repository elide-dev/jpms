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

import { expect, test } from '@jest/globals'
import { gradleModule } from '../gradle-util'

test('gradle model parse from content (pom)', async () => {
  const mod = await gradleModule(__dirname, 'gradle-module-sample.pom')
  expect(mod).not.toBeNull()
  expect(mod?.path).not.toBeNull()
})

test('gradle model parse from content (module)', async () => {
  const mod = await gradleModule(__dirname, 'gradle-module-sample.json')
  expect(mod).not.toBeNull()
  expect(mod?.path).not.toBeNull()
})

test('gradle model parse from unknown file (strict pom)', async () => {
  let caught = false
  try {
    await gradleModule(__dirname, 'unknown-file.pom')
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})

test('gradle model parse from unknown file (strict module)', async () => {
  let caught = false
  try {
    await gradleModule(__dirname, 'unknown-file.module')
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})

test('gradle model parse from file (empty)', async () => {
  let caught = false
  try {
    await gradleModule(__dirname, 'gradle-module-empty.pom')
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})

test('gradle model parse from file (empty object)', async () => {
  let caught = false
  try {
    await gradleModule(__dirname, 'gradle-module-empty-object.pom')
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})
