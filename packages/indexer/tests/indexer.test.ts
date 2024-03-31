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

import { describe, expect, test, beforeAll, jest } from '@jest/globals'
import { join } from 'node:path'
import { buildRepositoryIndexes } from '../src/indexer'

let consoleLogSpy: jest.SpiedFunction<typeof console.log>
let consoleErrorSpy: jest.SpiedFunction<typeof console.error>

const repoPath = join('..', '..', 'repository')

describe('indexer', () => {
  beforeAll(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => ({}))
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => ({}))
  })

  test('should be able to generate indexes for project', async () => {
    await buildRepositoryIndexes(repoPath, join('..', '..', '.well-known', 'maven-indexes'), false)
    expect(consoleLogSpy).toHaveBeenCalled()
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  }, 25000)
})
