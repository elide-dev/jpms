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

import cp from 'node:child_process'
import { resolve, join } from 'node:path'
import { env } from 'node:process'
import semver, { SemVer } from 'semver'

import { JavaToolchainVendor } from './java-model'
import { JavaCompiler, JavaLauncher, JdkTool } from './toolchain'

// Version block regex.
//
// Parses blocks like:
// openjdk version "21.0.2" 2024-01-16
// OpenJDK Runtime Environment GraalVM CE 21.0.2+13.1 (build 21.0.2+13-jvmci-23.1-b30)
// OpenJDK 64-Bit Server VM GraalVM CE 21.0.2+13.1 (build 21.0.2+13-jvmci-23.1-b30, mixed mode, sharing)
//
// Into capture groups:
// {
//   "version": "21.0.2",
//   "releaseDate": "2024-02-16",
//   "lts": "LTS",
//   "vendor": "GraalVM",
//   "patch": "13.1",
//   "bitness": "64",
//   "vmType": "Server",
//   "vmFlags": "mixed mode, sharing"
// }
//
// Tests and explanation here:
// https://regex101.com/r/ktTvDu/2
// prettier-ignore
const javaVersionBlockRegex = /openjdk.* \"{0,1}(?<version>[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2})\"{0,1} (?<releaseDate>[0-9]{4}-[0-9]{2}-[0-9]{2})\ {0,1}(?<lts>LTS){0,1}\nOpenJDK Runtime Environment\ (?<vendor>GraalVM CE|Oracle GraalVM|Zulu){0,1}.*\ {0,1}[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}(\+(?<patch>[0-9]{1,2}(\.[0-9]{0,2}){0,1})){0,1}.*\nOpenJDK\ (?<bitness>64|32)-Bit\ (?<vmType>Client|Server)\ VM.*(\,\ (?<flags>mixed mode\, sharing|mixed mode),{0,1})\){0,1}/gm

/**
 * Java Version Info
 */
export type JavaVersionInfo = {
  version: string
  lts: boolean
  major: number
  minor: number
  micro: number
  bitness: number
  releaseDate: string
  patch?: string
  vmType?: string
  vmFlags?: string
  vendor?: JavaToolchainVendor | string
}

enum VersionStringMatchGroup {
  VERSION = 1,
  RELEASE_DATE = 2,
  LTS = 3,
  VENDOR = 4,
  PATCH = 6,
  BITNESS = 8,
  VM_TYPE = 9,
  VM_FLAGS = 11
}

function buildMatchGroups(regex: RegExp, str: string): any {
  const matches: { [key: number]: string } = {}
  let m
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      switch (groupIndex) {
        case VersionStringMatchGroup.VERSION:
          matches[VersionStringMatchGroup.VERSION] = match
          break
        case VersionStringMatchGroup.RELEASE_DATE:
          matches[VersionStringMatchGroup.RELEASE_DATE] = match
          break
        case VersionStringMatchGroup.LTS:
          matches[VersionStringMatchGroup.LTS] = match
          break
        case VersionStringMatchGroup.VENDOR:
          matches[VersionStringMatchGroup.VENDOR] = match
          break
        case VersionStringMatchGroup.PATCH:
          matches[VersionStringMatchGroup.PATCH] = match
          break
        case VersionStringMatchGroup.BITNESS:
          matches[VersionStringMatchGroup.BITNESS] = match
          break
        case VersionStringMatchGroup.VM_TYPE:
          matches[VersionStringMatchGroup.VM_TYPE] = match
          break
        case VersionStringMatchGroup.VM_FLAGS:
          matches[VersionStringMatchGroup.VM_FLAGS] = match
          break
        default:
          break
      }
    })
  }
  return {
    version: matches[VersionStringMatchGroup.VERSION],
    releaseDate: matches[VersionStringMatchGroup.RELEASE_DATE],
    lts: matches[VersionStringMatchGroup.LTS],
    patch: matches[VersionStringMatchGroup.PATCH],
    vendor: matches[VersionStringMatchGroup.VENDOR],
    bitness: matches[VersionStringMatchGroup.BITNESS],
    vmType: matches[VersionStringMatchGroup.VM_TYPE],
    vmFlags: matches[VersionStringMatchGroup.VM_FLAGS]
  }
}

/**
 * Parse the output of `java --version`
 *
 * @param text Output of `java --version`
 * @return Structured information detected from provided output
 */
export function parseJavaVersionBlock(text: string): JavaVersionInfo {
  const groups = buildMatchGroups(javaVersionBlockRegex, text.trim())
  const { version, releaseDate, lts, patch, vendor, bitness, vmType, vmFlags } = groups

  if (!version)
    throw new Error(
      'Failed to parse VM version from text: \n' + text + '\n' + 'Groups: ' + JSON.stringify(groups, null, '  ')
    )
  const vmVersion = semver.parse(version)
  if (!vmVersion) throw new Error('Failed to parse VM version as semantic version')

  return {
    version: version as string,
    releaseDate: releaseDate as string,
    lts: lts != '',
    bitness: parseInt(bitness || '64'),
    vendor: (vendor as string) || undefined,
    major: vmVersion.major,
    minor: vmVersion.minor,
    micro: vmVersion.patch,
    patch: patch,
    vmType: (vmType as string) || undefined,
    vmFlags: (vmFlags as string) || undefined
  }
}

/**
 * Java Toolchain
 */
export class JavaToolchain {
  private constructor(
    private readonly _path: string,
    private readonly _version: JavaVersionInfo
  ) {}

  /**
   * Mark a path as a Java Toolchain
   *
   * @param path Path to the toolchain root; the JAVA_HOME path.
   * @param version Parsed or declared version info.
   */
  static forPath(path: string, version?: JavaVersionInfo): JavaToolchain {
    return new JavaToolchain(path, version || this.parseVersion(join(path, 'bin', 'java')))
  }

  /**
   * Run `java --version` to determine the active version
   *
   * @param path Absolute path to the `java` binary
   */
  static parseVersion(path: string): JavaVersionInfo {
    return parseJavaVersionBlock(cp.execSync(`${path} --version`).toString())
  }

  /**
   * Resolve the active Java version from the JAVA_HOME variable
   *
   * @param path Path to the toolchain root; the JAVA_HOME path.
   * @param version Parsed version or declared version; like `21.0.2`.
   */
  static current(): JavaToolchain {
    const home = env['JAVA_HOME']
    if (!home) throw new Error('No JAVA_HOME set; please set it to detect Java')
    const base = resolve(home)
    return this.forPath(base, this.parseVersion(join(base, 'bin', 'java')))
  }

  /**
   * @return Resolved absolute path to this toolchain.
   */
  path(): string {
    return this._path
  }

  /**
   * @return Resolved Java version info for this toolchain.
   */
  versionInfo(): JavaVersionInfo {
    return this._version
  }

  /**
   * @return Resolved version string for this toolchain.
   */
  version(): string {
    return this._version.version
  }

  /**
   * @return Parsed semantic version for this toolchain.
   */
  semver(): SemVer {
    return semver.parse(this.version()) as SemVer
  }

  /**
   * @return Java launcher wrapper for this toolchain.
   */
  launcher(): JavaLauncher {
    return JavaLauncher.forToolchain(this)
  }

  /**
   * @return Java compiler wrapper for this toolchain.
   */
  compiler(): JavaCompiler {
    return JavaCompiler.forToolchain(this)
  }

  /**
   * @return Java tool wrapper for this toolchain.
   */
  tool(name: string): JdkTool {
    return JdkTool.forToolchain(this, name)
  }
}
