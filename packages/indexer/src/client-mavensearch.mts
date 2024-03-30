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

/**
 * Maven Search Response
 *
 * Outer type for a JSON response from the Maven Central search API.
 */
export type MavenSearchResponse = {
  responseHeader: ResponseHeader
  response: SearchResponse
  spellcheck: Spellcheck
}

/**
 * Search Response
 *
 * Response from SOLR search via the Maven Central search API.
 */
export type SearchResponse = {
  numFound: number
  start: number
  docs: MavenSearchResult[]
}

/**
 * Maven Search Result
 *
 * SOLR search document result from the Maven Central search API.
 */
export type MavenSearchResult = {
  id: string
  g: string
  a: string
  latestVersion: string
  repositoryId: RepositoryID
  p: string
  timestamp: number
  versionCount: number
  text: string[]
  ec: string[]
}

/**
 * Repository ID
 *
 * Well-known repository IDs which are emitted by Maven Central search.
 */
export enum RepositoryID {
  Central = 'central'
}

/**
 * Response Header
 *
 * Metadata about a search response, as emitted by the Maven Central search API.
 */
export type ResponseHeader = {
  status: number
  QTime: number
  params: Params
}

/**
 * Search Parameters
 *
 * Reflected search parameters emitted with results from the Maven Central search API.
 */
export type Params = {
  q: string
  core: string
  defType: string
  qf: string
  indent: string
  spellcheck: string
  fl: string
  start: string
  'spellcheck.count': string
  sort: string
  rows: string
  wt: string
  version: string
}

/**
 * Spellcheck
 *
 * Spellcheck suggestions emitted by the Maven Central search API.
 */
export type Spellcheck = {
  suggestions: string[]
}
