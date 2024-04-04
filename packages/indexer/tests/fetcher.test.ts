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

import { describe, expect, test, jest, beforeAll } from '@jest/globals'
import { modules, gradle, publications } from '../src/client-indexes'

let fetchMock: jest.SpiedFunction<typeof fetch>

describe('index fetcher', () => {
  beforeAll(() => {
    fetchMock = jest.spyOn(global, 'fetch')
    fetchMock.mockImplementation(async () => {
      return {
        json: async () => ({})
      } as Response
    })
  })

  test('can fetch the modules index', async () => {
    const index = await modules()
    expect(index).toBeDefined()
  })

  test('can fetch the publications index', async () => {
    const index = await publications()
    expect(index).toBeDefined()
  })

  test('can fetch the gradle index', async () => {
    const index = await gradle()
    expect(index).toBeDefined()
  })
})
