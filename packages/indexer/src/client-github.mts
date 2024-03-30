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

import { Octokit } from '@octokit/core'
export { graphql } from '@octokit/graphql'
export type { GraphQlQueryResponseData } from '@octokit/graphql'

// Resolve the GitHub Token to use for interactions with the API.
function resolveGithubToken(): string | undefined {
  return process.env.GITHUB_TOKEN
}

// Create an instance of Octokit.
function createOctokit(): Octokit {
  return new Octokit({
    auth: resolveGithubToken()
  })
}

// Main Octokit singleton.
const octokit = createOctokit()

/**
 * Obtain an authorized Octokit instance and then run a callback with it.
 *
 * @param callback Callback to run once Octokit is ready
 * @returns Return result of the callback
 */
export async function withOctokit<R>(callback: (octokit: Octokit) => Promise<R>): Promise<R> {
  return await callback(octokit)
}
