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
 * JVM Target
 *
 * Enumerates JVM bytecode targets that are supported by this indexer tool
 */
export enum JvmTarget {
  JDK_5 = "1.5",
  JDK_6 = "1.6",
  JDK_7 = "1.7",
  JDK_8 = "1.8",
  JDK_9 = "9",
  JDK_10 = "10",
  JDK_11 = "11",
  JDK_12 = "12",
  JDK_13 = "13",
  JDK_14 = "14",
  JDK_15 = "15",
  JDK_16 = "16",
  JDK_17 = "17",
  JDK_18 = "18",
  JDK_19 = "19",
  JDK_20 = "20",
  JDK_21 = "21",
  JDK_22 = "22",
  JDK_23 = "23",
}

/**
 *
 */
export type JavaModuleExport = {
  package: string;
  to?: string[];
};

/**
 *
 */
export type JavaModuleRequires = {
  module: string;
  static?: boolean;
  transitive?: boolean;
};

/**
 *
 */
export type JavaModuleOpens = {
  package: string;
  to?: string[];
};

/**
 *
 */
export type JavaModuleInfo = {
  name: string;
  open: boolean;
  requires: JavaModuleRequires[];
  exports: JavaModuleExport[];
  opens: JavaModuleOpens[];
};

/**
 *
 */
export type ReleaseFeatures = {
  minimumTarget?: JvmTarget;
  definedTargets?: JvmTarget[];
  module?: JavaModuleInfo;
  multiRelease?: boolean;
};
