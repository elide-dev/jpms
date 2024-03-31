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
 * Source Control Type
 *
 * The type of source control system used by a software project.
 */
export enum SourceControlType {
  GIT = 'git',
  SVN = 'svn',
  MERCURIAL = 'mercurial'
}

/**
 * Source Control Platform
 *
 * The platform that hosts the source control system used by a software project.
 */
export enum SourceControlPlatform {
  GITHUB = 'github',
  GITLAB = 'gitlab',
  BITBUCKET = 'bitbucket',
  AZURE = 'azure'
}

/**
 * Project Source Control
 *
 * Information about the source control system used by a software project.
 */
export type ProjectSourceControl = {
  type: SourceControlType
  platform?: SourceControlPlatform
  httpsUrl?: string
  scmUrl?: string
}

/**
 * Security Scorecard Info
 *
 * Information about this project's qualifications for Security Scorecard.
 */
export type SecurityScorecardInfo = {
  score: number
  projectId: string
}

/**
 * OSSF Tier
 *
 * Describes tiers of OSSF Best Practices compliance.
 */
export enum OSSFTier {
  PASSING = 'passing',
  SILVER = 'silver',
  GOLD = 'gold'
}

/**
 * OSSF Best Practices Info
 *
 * Describes information about this project's compliance with OSSF Best Practices.
 */
export type OSSFBestPracticesInfo = {
  projectId: string
  tier: OSSFTier
  percentage: number
}

/**
 * Known Vulnerability Stats
 *
 * Describes basic statistics about known vulnerabilities in a project.
 */
export type KnownVulnerabilityStats = {
  critical: number
  high: number
  medium: number
  low: number
}

/**
 * Known Vulnerabilities Info
 *
 * Describes information about this project's known vulnerabilities.
 */
export type KnownVulnerabilitiesInfo = {
  ghsaCount: number
  nvdCount: number
  vulnStats: KnownVulnerabilityStats
}

/**
 * Sigstore Provenance Info
 *
 * Describes Sigstore publishing status and information about a project.
 */
export type SigstoreProvenanceInfo = {
  sigstoreReleasesProvided: boolean
}

/**
 * SLSA Provenance Info
 *
 * Describes SLSA-compliant publishing status and information about a project.
 */
export type SLSAProvenanceInfo = {
  slsaMaterialProvided: boolean
}

/**
 * GPG Signing Info
 *
 * Describes regular Maven GPG signing information about a project.
 */
export type GPGSigningInfo = {
  gpgSignaturesProvided: boolean
}

/**
 * Checksum Info
 *
 * Describes available checksums for a given project.
 */
export type ChecksumProvenanceInfo = {
  checksumsProvided: boolean
}

/**
 * Project Provenance Info
 *
 * Describes provenance and assurance information about a project.
 */
export type ProjectProvenanceInfo = {
  sigstore?: SigstoreProvenanceInfo
  slsa?: SLSAProvenanceInfo
  gpg?: GPGSigningInfo
  checksums?: ChecksumProvenanceInfo
}

/**
 * Project Security Metrics
 *
 * Metrics from various measurements relating to project security.
 */
export type ProjectSecurityMetrics = {
  scorecards?: SecurityScorecardInfo
  ossf?: OSSFBestPracticesInfo
  vulns?: KnownVulnerabilitiesInfo
  provenance?: ProjectProvenanceInfo
}

/**
 * Project Flaw Metrics
 *
 * Metrics from various measurements relating to project flaws, bugs, issues, etc.
 */
export type ProjectFlawMetrics = {
  issueCount?: number
}

/**
 * Project Freshness Metrics
 *
 * Metrics from various measurements relating to project recency, maintained-ness, and freshness.
 */
export type ProjectFreshnessMetrics = {
  lastRelease?: Date
  lastCommit?: Date
}

/**
 * Project Quality Metrics
 *
 * Combined quality metrics across many categories for a given project.
 */
export type ProjectQualityMetrics = ProjectSecurityMetrics & ProjectFlawMetrics & ProjectFreshnessMetrics

/**
 * Well-known License
 *
 * Maps well-known licenses to their SPDX identifiers.
 */
export enum WellKnownLicense {
  MIT = 'MIT',
  APACHE_2_0 = 'Apache-2.0',
  GPL_2_0 = 'GPL-2.0',
  GPL_3_0 = 'GPL-3.0',
  BSD_2_CLAUSE = 'BSD-2-Clause',
  BSD_3_CLAUSE = 'BSD-3-Clause',
  LGPL_2_1 = 'LGPL-2.1',
  LGPL_3_0 = 'LGPL-3.0',
  AGPL_3_0 = 'AGPL-3.0',
  MPL_2_0 = 'MPL-2.0',
  EPL_2_0 = 'EPL-2.0',
  CC_BY_4_0 = 'CC-BY-4.0',
  CC_BY_SA_4_0 = 'CC-BY-SA-4.0',
  UNLICENSE = 'Unlicense',
  WTFPL = 'WTFPL',
  ISC = 'ISC',
  ZLIB = 'Zlib',
  BSL_1_0 = 'BSL-1.0',
  APACHE_1_1 = 'Apache-1.1'
}

/**
 * Project License
 *
 * Describes a single mapped license for a project.
 */
export type ProjectLicense = {
  wellKnown?: WellKnownLicense
  custom?: string
  spdx?: string
  url?: string
}

/**
 * Project License Capability State
 *
 * Describes the state of a capabilitiy with regard to licensing.
 */
export enum LicenseCapabilityState {
  GRANTED = 'granted',
  FORBIDDEN = 'forbidden',
  COMPLICATED = 'complicated'
}

/**
 * Project License Stats
 *
 * Describes information derived from project licensing info.
 */
export type ProjectLicenseStats = {
  forking?: LicenseCapabilityState
  redistribution?: LicenseCapabilityState
  commercial?: LicenseCapabilityState
  modification?: LicenseCapabilityState
  privateUse?: LicenseCapabilityState
  sublicensing?: LicenseCapabilityState
}
