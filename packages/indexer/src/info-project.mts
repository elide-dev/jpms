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

import { ProjectLicense, ProjectLicenseStats, ProjectQualityMetrics, ProjectSourceControl } from './info-model.mjs'

/**
 * Project Licensing Info
 *
 * Information about the licensing of a software project.
 */
export type ProjectLicensingInfo = ProjectLicenseStats & {
  open: boolean
  licenses: ProjectLicense[]
  stats: ProjectLicenseStats
}

/**
 * Project Media
 *
 * Refers to some media like an image, video, or other content.
 */
export type ProjectMedia = {
  url: string
}

/**
 * Project Profile Info
 *
 * Generic project information, including the project's name, description, homepage, icon, and so on.
 */
export type ProjectProfileInfo = {
  name?: string
  description?: string
  url?: string
  icon?: ProjectMedia
  logo?: ProjectMedia
}

/**
 * Project Info
 *
 * Top-level information about a software project.
 */
export type ProjectInfo = {
  // The remote repository URL for this project, as a canonicalized HTTPS URL.
  objectID?: string
  profile: ProjectProfileInfo
  source?: ProjectSourceControl
  metrics?: ProjectQualityMetrics
  licensing?: ProjectLicensingInfo
}
