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

/*!
 * https://github.com/leonardosnt/java-class-tools
 *
 * Copyright (C) 2017 leonardosnt
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

/**
 * Modifier
 *
 * Enumerates all recognized modifier values
 */
export enum Modifier {
  PUBLIC = 0x0001,
  PRIVATE = 0x0002,
  PROTECTED = 0x0004,
  STATIC = 0x0008,
  FINAL = 0x0010,
  SYNCHRONIZED = 0x0020,
  VOLATILE = 0x0040,
  BRIDGE = 0x0040,
  TRANSIENT = 0x0080,
  VARARGS = 0x0080,
  NATIVE = 0x0100,
  ABSTRACT = 0x0400,
  STRICT = 0x0800,
  SYNTHETIC = 0x1000,

  // Class only
  INTERFACE = 0x0200,
  SUPER = 0x0020,
  ANNOTATION = 0x2000,
  ENUM = 0x4000,

  // Java SE 9
  MODULE = 0x8000
}

export default Modifier
