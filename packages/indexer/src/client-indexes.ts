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

import {
  RepositoryGradleModulesIndexEntry,
  RepositoryModulesIndexEntry,
  RepositoryPackageIndexEntry,
} from "./indexer-model.js"

/**
 * Path where indexes are served from.
 */
export const repoIndexPath = '.well-known/maven-indexes'

/**
 * Java Modules Index
 *
 * Enumerates each type of index file generated for the Java Modules repository.
 */
export enum JavaModulesIndex {
  MODULES = 'modules',
  PACKAGES = 'packages',
  GRADLE = 'gradle'
}

/**
 * Java Modules Endpoint
 *
 * Endpoint selection where indexes are served from.
 */
export enum JavaModulesEndpoint {
  GITHUB = 'github',
  PAGES = 'pages',
  PRODUCTION = 'production'
}

/**
 * Index of JPMS modules to their artifacts.
 */
export const repoIndexModules = `${JavaModulesIndex.MODULES}.json`

/**
 * Index of all packages with their project summary.
 */
export const repoIndexPackages = `${JavaModulesIndex.PACKAGES}.json`

/**
 * Index of all Gradle Module variants.
 */
export const repoIndexGradle = `${JavaModulesIndex.GRADLE}.json`

/**
 * Endpoint prefix for fetching from GitHub.
 */
export const githubRepoEndpoint = `https://raw.githubusercontent.com/elide-dev/jpms/main/${repoIndexPath}`

/**
 * Endpoint prefix for fetching through GitHub Pages.
 */
export const githubPagesEndpoint = `https://jpms.pkg.st/${repoIndexPath}`

/**
 * Endpoint prefix for fetching from the production domain.
 */
export const productionEndpoint = `https://javamodules.dev/${repoIndexPath}`

// Default host to use.
export const defaultHost = JavaModulesEndpoint.GITHUB

export type IndexesResponse<V> = {
  data: V,
}

/**
 * Build a final index fetch response.
 *
 * @param response Data to enclose within the indexes response
 * @return Wrapped response
 */
function buildResponse<V>(response: V): IndexesResponse<V> {
  return {
    data: response,
  }
}

/**
 * Index Endpoint
 *
 * Calculate the URL where an index file can be downloaded from.
 *
 * @param host Host to use for the URL
 * @param index Index requested
 * @returns URL to download the index
 */
export function endpoint(index: JavaModulesIndex, host: JavaModulesEndpoint = defaultHost): URL {
  const resolvedHost = {
    [JavaModulesEndpoint.GITHUB]: githubRepoEndpoint,
    [JavaModulesEndpoint.PAGES]: githubPagesEndpoint,
    [JavaModulesEndpoint.PRODUCTION]: productionEndpoint
  }[host]

  const indexFile = {
    [JavaModulesIndex.MODULES]: repoIndexModules,
    [JavaModulesIndex.PACKAGES]: repoIndexPackages,
    [JavaModulesIndex.GRADLE]: repoIndexGradle
  }[index]

  if (!host) throw new Error(`Unknown endpoint: ${host}`)
  if (!index) throw new Error(`Unknown index: ${index}`)

  return new URL(`${resolvedHost}/${indexFile}`)
}

/**
 * Index Fetch
 *
 * Calculate the URL where an index file can be downloaded from, then download and decode it from JSON.
 * The index type should be provided as the generic type.
 *
 * @param host Host to use for the URL
 * @param index Index requested
 * @returns URL to download the index
 */
export async function fetchIndex<V>(
  index: JavaModulesIndex,
  host: JavaModulesEndpoint = defaultHost,
): Promise<V> {
  const target = endpoint(index, host)
  let idx: V
  try {
    const response = await fetch(target.toString())
    idx = await response.json()
  } catch (err) {
    throw new Error(`Failed to fetch index from ${target}: ${err}`)
  }
  return idx
}

/**
 * Index: Modules
 *
 * Fetch the latest copy of the "modules" index, which maps JPMS modules to their artifacts. Optionally, a host
 * override may be provided.
 *
 * @param host Endpoint host override
 * @returns Fetched index data
 */
export async function modules(
  host: JavaModulesEndpoint = defaultHost,
): Promise<IndexesResponse<RepositoryModulesIndexEntry>> {
  return buildResponse(
    await fetchIndex<RepositoryModulesIndexEntry>(JavaModulesIndex.MODULES, host)
  )
}

/**
 * Index: Packages
 *
 * Fetch the latest copy of the "packages" index, which maps packages to project summaries. Optionally, a host
 * override may be provided.
 *
 * @param host Endpoint host override
 * @returns Fetched index data
 */
export async function packages(
  host: JavaModulesEndpoint = defaultHost,
): Promise<IndexesResponse<RepositoryPackageIndexEntry>> {
  return buildResponse(
    await fetchIndex<RepositoryPackageIndexEntry>(JavaModulesIndex.PACKAGES, host)
  )
}

/**
 * Index: Gradle
 *
 * Fetch the latest copy of the "gradle" index, which maps artifacts to Gradle Variants. Optionally, a host
 * override may be provided.
 *
 * @param host Endpoint host override
 * @returns Fetched index data
 */
export async function gradle(
  host: JavaModulesEndpoint = defaultHost,
): Promise<IndexesResponse<RepositoryGradleModulesIndexEntry>> {
  return buildResponse(
    await fetchIndex<RepositoryGradleModulesIndexEntry>(JavaModulesIndex.GRADLE, host)
  )
}
