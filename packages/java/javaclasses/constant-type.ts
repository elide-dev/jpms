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
 * Constant Type
 *
 * Types of constants enumerated as integers.
 */
export enum ConstantType {
  UTF8 = 1,
  INTEGER = 3,
  FLOAT = 4,
  LONG = 5,
  DOUBLE = 6,
  CLASS = 7,
  STRING = 8,
  FIELDREF = 9,
  METHODREF = 10,
  INTERFACE_METHODREF = 11,
  NAME_AND_TYPE = 12,
  METHOD_HANDLE = 15,
  METHOD_TYPE = 16,
  DYNAMIC = 17,
  INVOKE_DYNAMIC = 18,
  MODULE = 19,
  PACKAGE = 20,
}
