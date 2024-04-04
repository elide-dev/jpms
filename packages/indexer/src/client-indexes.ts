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
  RepositoryIndexMetadata,
  RepositoryModulesIndexEntry,
  RepositoryPublicationIndexEntry
} from './indexer-model.js'

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
  data: V
  metadata: RepositoryIndexMetadata
}

/**
 * Build a final index fetch response.
 *
 * @param response Data to enclose within the indexes response
 * @return Wrapped response
 */
function buildResponse<V>(response: V, metadata: RepositoryIndexMetadata): IndexesResponse<V> {
  return {
    data: response,
    metadata
  }
}

function endpointForFile(host: JavaModulesEndpoint, file: string): URL {
  const resolvedHost = {
    [JavaModulesEndpoint.GITHUB]: githubRepoEndpoint,
    [JavaModulesEndpoint.PAGES]: githubPagesEndpoint,
    [JavaModulesEndpoint.PRODUCTION]: productionEndpoint
  }[host]

  if (!host) throw new Error(`Unknown endpoint: ${host}`)
  return new URL(`${resolvedHost}/${file}`)
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
  const indexFile = {
    [JavaModulesIndex.MODULES]: repoIndexModules,
    [JavaModulesIndex.PACKAGES]: repoIndexPackages,
    [JavaModulesIndex.GRADLE]: repoIndexGradle
  }[index]

  if (!index) throw new Error(`Unknown index: ${index}`)
  return endpointForFile(host, indexFile)
}

/**
 * Metadata Endpoint
 *
 * Calculate the URL where an index metadata file can be downloaded from.
 *
 * @param host Host to use for the URL
 * @param index Index requested
 * @returns URL to download the index
 */
export function metadata(index: JavaModulesIndex, host: JavaModulesEndpoint = defaultHost): URL {
  const indexFile = {
    [JavaModulesIndex.MODULES]: repoIndexModules,
    [JavaModulesIndex.PACKAGES]: repoIndexPackages,
    [JavaModulesIndex.GRADLE]: repoIndexGradle
  }[index]

  if (!index) throw new Error(`Unknown index: ${index}`)
  return endpointForFile(host, `${indexFile.split('.').at(0) as string}.metadata.json`)
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
  host: JavaModulesEndpoint = defaultHost
): Promise<IndexesResponse<V>> {
  const target = endpoint(index, host)
  const meta = metadata(index, host)
  try {
    const response = fetch(target.toString())
    const metadataOp = fetch(meta.toString())
    return new Promise(async (resolve, reject) => {
      try {
        const [res, metaRes] = await Promise.all([response, metadataOp])
        const data = await res.json()
        const metadata = await metaRes.json()
        resolve(buildResponse(data, metadata))
      } catch (err) {
        reject(err)
      }
    })
  } catch (err) {
    throw new Error(`Failed to fetch index from ${target}: ${err}`)
  }
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
  host: JavaModulesEndpoint = defaultHost
): Promise<IndexesResponse<RepositoryModulesIndexEntry>> {
  return await fetchIndex<RepositoryModulesIndexEntry>(JavaModulesIndex.MODULES, host)
}

/**
 * Index: Publications
 *
 * Fetch the latest copy of the "publications" index, which maps JARs to project summaries. Optionally, a host
 * override may be provided.
 *
 * @param host Endpoint host override
 * @returns Fetched index data
 */
export async function publications(
  host: JavaModulesEndpoint = defaultHost
): Promise<IndexesResponse<RepositoryPublicationIndexEntry>> {
  return await fetchIndex<RepositoryPublicationIndexEntry>(JavaModulesIndex.PACKAGES, host)
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
  host: JavaModulesEndpoint = defaultHost
): Promise<IndexesResponse<RepositoryGradleModulesIndexEntry>> {
  return await fetchIndex<RepositoryGradleModulesIndexEntry>(JavaModulesIndex.GRADLE, host)
}
