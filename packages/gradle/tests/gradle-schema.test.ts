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
import { gradleModuleSchema } from "../gradle-schema"
import { gradleModule } from "../gradle-util"

async function sampleModule() {
  return (await gradleModule(__dirname, 'gradle-module-sample.json'))?.module
}

test('expects gradle module to load for testing', () => {
  expect(sampleModule).not.toBeNull();
})

test('gradle module should fail with invalid format version', async () => {
  let caught = false
  try {
    await gradleModuleSchema.validate({
      ...(await sampleModule()),
      formatVersion: 'invalid-version',
    })
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
});

test('gradle module should fail with unexpected format version', async () => {
  let caught = false
  try {
    await gradleModuleSchema.validate({
      ...(await sampleModule()),
      formatVersion: '1.2',
    })
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
});
