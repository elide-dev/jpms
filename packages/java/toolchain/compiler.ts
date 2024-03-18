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

import { JavaTool } from "./abstract"
import type { JavaToolchain } from "../javahome"

/**
 * Java Compiler
 */
export class JavaCompiler extends JavaTool {
  private constructor (toolchain: JavaToolchain) {
    super(toolchain)
  }

  /**
   * Wrap the provided toolchain for Java compiler use
   *
   * @param toolchain Toolchain to wrap
   * @return Java Compiler wrapper
   */
  // @ts-ignore
  static forToolchain(toolchain: JavaToolchain): JavaCompiler {
    throw new Error('not yet implemented')
  }
}

export default JavaCompiler
