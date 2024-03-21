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
 * Module Flags: Base Values
 *
 * See: https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html#jvms-4.7.25
 */
export const ModularFlags = {
  SYNTHETIC: 0x1000,
  MANDATED: 0x8000,
}

/**
 * Module Flags: Modules
 *
 * See: https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html#jvms-4.7.25
 */
export const ModuleFlags = {
  ...ModularFlags,
  OPEN: 0x0020,
}

/**
 * Module Flags: Requires Statements
 *
 * See: https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html#jvms-4.7.25
 */
export const RequiresFlags = {
  ...ModularFlags,
  TRANSITIVE: 0x0020,
  STATIC: 0x0040,
}

/**
 * Module Flags: Exports Statements
 *
 * See: https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html#jvms-4.7.25
 */
export const ExportsFlags = ModularFlags

/**
 * Module Flags: Opens Statements
 *
 * See: https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html#jvms-4.7.25
 */
export const OpensFlags = ModularFlags
