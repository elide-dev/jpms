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

export type MemberInfo = {
  access_flags: number;
  name_index: number;
  descriptor_index: number;
  attributes_count: number;
  attributes: any[];
};

export type TypeInfo = {
  tag: number;
  cpool_index?: number;
  offset?: number;
};

export type ConstantInfo = {
  tag: number;
  length: number;
  bytes: number[];
}

export type AttributeInfoBase = {
  attribute_name_index: number,
  attribute_length: number,
}

export type AttributeInfo = AttributeInfoBase & {
  [key: string]: any
}

// Class info record shape.
export type ClassInfo = {
  tag: 7,
  name_index: number,
}

// Generic attributes.
export type GenericInfo = {
  [key: string]: any,
}

// Java Module `requires` block (low-level).
export type ModuleRequiresInfo = GenericInfo & {
  requires_index: number,
  requires_flags: number,
  requires_version_index: number,
}

// Java Module `exports` block (low-level).
export type ModuleExportsInfo = GenericInfo & {
  exports_index: number,
  exports_flags: number,
  exports_to_count: number,
  exports_to_index: number[],
}

// Java Module `opens` block (low-level).
export type ModuleOpensInfo = GenericInfo & {
  opens_index: number,
  opens_flags: number,
  opens_to_count: number,
  opens_to_index: number[],
}

// Java Module `uses` block (low-level).
export type ModuleUsesInfo = number

// Java Module `provides` block (low-level).
export type ModuleProvidesInfo = GenericInfo & {
  provides_index: number,
  provides_with_count: number,
  provides_with_index: number[],
}

// Java Module attributes.
export type ModuleInfoAttributes = AttributeInfo & {
  module_name_index: number,
  module_flags: number,
  module_version_index: number,
  requires_count: number,
  requires: ModuleRequiresInfo[],
  exports_count: number,
  exports: ModuleExportsInfo[],
  opens_count: number,
  opens: ModuleOpensInfo[],
  uses_count: number,
  uses_index: ModuleUsesInfo[],
  provides_count: number,
  provides: ModuleProvidesInfo[],
}
