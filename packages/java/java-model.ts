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
 * JVM Platform
 *
 * Enumerates JVM platforms (OS/arch pairs).
 */
export enum JvmPlatform {
  LINUX_AMD64 = 'linux-amd64',
  LINUX_AARCH64 = 'linux-aarch64',
  DARWIN_AMD64 = 'darwin-amd64',
  DARWIN_AARCH64 = 'darwin-aarch64',
  WINDOWS_AMD64 = 'windows-amd64'
}

/**
 * JVM Target
 *
 * Enumerates JVM bytecode targets that are supported by this indexer tool
 */
export enum JvmTarget {
  JDK_5 = '1.5',
  JDK_6 = '1.6',
  JDK_7 = '1.7',
  JDK_8 = '1.8',
  JDK_9 = '9',
  JDK_10 = '10',
  JDK_11 = '11',
  JDK_12 = '12',
  JDK_13 = '13',
  JDK_14 = '14',
  JDK_15 = '15',
  JDK_16 = '16',
  JDK_17 = '17',
  JDK_18 = '18',
  JDK_19 = '19',
  JDK_20 = '20',
  JDK_21 = '21',
  JDK_22 = '22',
  JDK_23 = '23'
}

const jvmTargetByVersion: Record<number, JvmTarget> = {
  5: JvmTarget.JDK_5,
  6: JvmTarget.JDK_6,
  7: JvmTarget.JDK_7,
  8: JvmTarget.JDK_8,
  9: JvmTarget.JDK_9,
  10: JvmTarget.JDK_10,
  11: JvmTarget.JDK_11,
  12: JvmTarget.JDK_12,
  13: JvmTarget.JDK_13,
  14: JvmTarget.JDK_14,
  15: JvmTarget.JDK_15,
  16: JvmTarget.JDK_16,
  17: JvmTarget.JDK_17,
  18: JvmTarget.JDK_18,
  19: JvmTarget.JDK_19,
  20: JvmTarget.JDK_20,
  21: JvmTarget.JDK_21,
  22: JvmTarget.JDK_22,
  23: JvmTarget.JDK_23
}

const jvmTargetByLevel: Record<number, JvmTarget> = {
  49: JvmTarget.JDK_5,
  50: JvmTarget.JDK_6,
  51: JvmTarget.JDK_7,
  52: JvmTarget.JDK_8,
  53: JvmTarget.JDK_9,
  54: JvmTarget.JDK_10,
  55: JvmTarget.JDK_11,
  56: JvmTarget.JDK_12,
  57: JvmTarget.JDK_13,
  58: JvmTarget.JDK_14,
  59: JvmTarget.JDK_15,
  60: JvmTarget.JDK_16,
  61: JvmTarget.JDK_17,
  62: JvmTarget.JDK_18,
  63: JvmTarget.JDK_19,
  64: JvmTarget.JDK_20,
  65: JvmTarget.JDK_21,
  66: JvmTarget.JDK_22,
  67: JvmTarget.JDK_23
}

/**
 * Obtain a `JvmTarget` for the provided JDK major version number
 *
 * @param version JDK major version number
 * @returns JVM target for the given JDK version
 */
export function jvmTargetForVersion(version: number): JvmTarget {
  const target = jvmTargetByVersion[version]
  if (!target) throw new Error(`Unsupported JDK version: ${version}`)
  return target
}

/**
 * Obtain a `JvmTarget` for the provided class bytecode version
 *
 * @param level Class bytecode level
 * @returns JVM target for the given bytecode level
 */
export function jvmTargetForLevel(level: number): JvmTarget {
  const target = jvmTargetByLevel[level]
  if (!target) throw new Error(`Unsupported bytecode level: ${level}`)
  return target
}

/**
 * Obtain a JVM class bytecode level for the provided JVM target
 *
 * @param target JVM target
 * @returns Bytecode level for the target
 */
export function jvmLevelForTarget(target: JvmTarget): number {
  return parseInt(target, 10) + 44
}

/**
 * Describes an `export` declared in a JPMS module.
 */
export type JavaModuleExport = {
  package: string
  to: string[]
}

/**
 * Describes a `requires` declaration in a JPMS module.
 */
export type JavaModuleRequires = {
  module: string
  static: boolean
  transitive: boolean
}

/**
 * Describes an `opens` declaration in a JPMS module.
 */
export type JavaModuleOpens = {
  package: string
  to: string[]
}

/**
 * Describes a `provides` declaration in a JPMS module.
 */
export type JavaModuleProvides = {
  service: string
  with: string[]
}

/**
 * Describes a `uses` declaration in a JPMS module.
 */
export type JavaModuleUses = {
  service: string
}

/**
 * Flags which can be set on a Java Module definition.
 */
export type JavaModuleFlags = {
  open: boolean
}

/**
 * Describes a JPMS module.
 */
export type JavaModuleInfo = {
  name: string
  version?: string
  main?: string
  flags: JavaModuleFlags
  requires: JavaModuleRequires[]
  exports: JavaModuleExport[]
  opens: JavaModuleOpens[]
  provides: JavaModuleProvides[]
  uses: JavaModuleUses[]
}

/**
 * Describes Java release feature attributes.
 */
export type ReleaseFeatures = {
  minimumTarget?: JvmTarget
  definedTargets?: JvmTarget[]
  module?: JavaModuleInfo
  multiRelease?: boolean
}
