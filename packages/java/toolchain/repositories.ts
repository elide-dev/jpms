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

import { JvmPlatform, JvmTarget, JavaToolchainVendor } from '../java-model'

type LatestVersionTag = {
  latest: string
}

type ToolchainTargetInfo = LatestVersionTag & {
  platforms: {
    [platform in JvmPlatform]: URL
  }
}

type ToolchainData = {
  [key: string]: {
    [key: string]: ToolchainTargetInfo
  }
}

function url(s: string): URL {
  return new URL(s)
}

/**
 * Toolchain Repositories
 *
 * Mapping of Java toolchain downloads by vendor, version, and platform.
 */
export const ToolchainRepositories: ToolchainData = {
  [`${JavaToolchainVendor.GRAALVM}`]: {
    [`${JvmTarget.JDK_22}`]: {
      latest: '22.0.0',
      platforms: {
        [`${JvmPlatform.LINUX_AMD64}`]: url(
          'https://download.oracle.com/graalvm/22/latest/graalvm-jdk-22_linux-x64_bin.tar.gz'
        ),
        [`${JvmPlatform.LINUX_AARCH64}`]: url(
          'https://download.oracle.com/graalvm/22/latest/graalvm-jdk-22_linux-aarch64_bin.tar.gz'
        ),
        [`${JvmPlatform.DARWIN_AMD64}`]: url(
          'https://download.oracle.com/graalvm/22/latest/graalvm-jdk-22_macos-x64_bin.tar.gz'
        ),
        [`${JvmPlatform.DARWIN_AARCH64}`]: url(
          'https://download.oracle.com/graalvm/22/latest/graalvm-jdk-22_macos-aarch64_bin.tar.gz'
        ),
        [`${JvmPlatform.WINDOWS_AMD64}`]: url(
          'https://download.oracle.com/graalvm/22/latest/graalvm-jdk-22_windows-x64_bin.zip'
        )
      }
    },
    [`${JvmTarget.JDK_21}`]: {
      latest: '21.0.2',
      platforms: {
        [`${JvmPlatform.LINUX_AMD64}`]: url(
          'https://download.oracle.com/graalvm/21/latest/graalvm-jdk-21_linux-x64_bin.tar.gz'
        ),
        [`${JvmPlatform.LINUX_AARCH64}`]: url(
          'https://download.oracle.com/graalvm/21/latest/graalvm-jdk-21_linux-aarch64_bin.tar.gz'
        ),
        [`${JvmPlatform.DARWIN_AMD64}`]: url(
          'https://download.oracle.com/graalvm/21/latest/graalvm-jdk-21_macos-x64_bin.tar.gz'
        ),
        [`${JvmPlatform.DARWIN_AARCH64}`]: url(
          'https://download.oracle.com/graalvm/21/latest/graalvm-jdk-21_macos-aarch64_bin.tar.gz'
        ),
        [`${JvmPlatform.WINDOWS_AMD64}`]: url(
          'https://download.oracle.com/graalvm/21/latest/graalvm-jdk-21_windows-x64_bin.zip'
        )
      }
    },
    [`${JvmTarget.JDK_17}`]: {
      latest: '17.0.10',
      platforms: {
        [`${JvmPlatform.LINUX_AMD64}`]: url(
          'https://download.oracle.com/graalvm/17/latest/graalvm-jdk-17_linux-x64_bin.tar.gz'
        ),
        [`${JvmPlatform.LINUX_AARCH64}`]: url(
          'https://download.oracle.com/graalvm/17/latest/graalvm-jdk-17_linux-aarch64_bin.tar.gz'
        ),
        [`${JvmPlatform.DARWIN_AMD64}`]: url(
          'https://download.oracle.com/graalvm/17/latest/graalvm-jdk-17_macos-x64_bin.tar.gz'
        ),
        [`${JvmPlatform.DARWIN_AARCH64}`]: url(
          'https://download.oracle.com/graalvm/17/latest/graalvm-jdk-17_macos-aarch64_bin.tar.gz'
        ),
        [`${JvmPlatform.WINDOWS_AMD64}`]: url(
          'https://download.oracle.com/graalvm/17/latest/graalvm-jdk-17_windows-x64_bin.zip'
        )
      }
    }
  }
}

/**
 * Get the repository for a given toolchain
 *
 * @param vendor Toolchain vendor
 * @param version Toolchain version
 * @param platform Toolchain platform
 * @returns The repository for the given toolchain
 * @throws If the vendor, version, or platform is unknown to the toolchain manager
 */
export function repositoryForToolchain(vendor: JavaToolchainVendor, version: JvmTarget, platform: JvmPlatform): URL {
  const targetVendor = ToolchainRepositories[vendor]
  if (!targetVendor) throw new Error(`Unknown vendor: ${vendor}`)
  const targetVersion = targetVendor[version]
  if (!targetVersion) throw new Error(`Unknown version: ${version}`)
  const targetPlatform = targetVersion.platforms[platform]
  if (!targetPlatform) throw new Error(`Unknown platform: ${platform}`)
  return targetPlatform
}
