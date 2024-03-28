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

import { BinInfo, ExecSpec, JavaTool, ToolArgs, ToolRun } from './abstract'
import type { JavaToolchain } from '../java-home'

/**
 * Name of the Java launcher binary.
 */
const LAUNCHER_BINARY_NAME = 'java'

/**
 * Structure of a return result from a run of the Java launcher.
 */
export type LauncherResult = {
  run: ToolRun
}

/**
 * Java Launcher
 */
export class JavaLauncher extends JavaTool {
  private readonly _bin: BinInfo

  private constructor(toolchain: JavaToolchain) {
    super(toolchain)
    this._bin = this.bin(LAUNCHER_BINARY_NAME)
  }

  /**
   * Wrap the provided toolchain for Java compiler use
   *
   * @param toolchain Toolchain to wrap
   * @return Java Compiler wrapper
   */
  // @ts-ignore
  static forToolchain(toolchain: JavaToolchain): JavaLauncher {
    return new JavaLauncher(toolchain)
  }

  // Execute the Java launcher with the provided arguments.
  protected override exec(args: ToolArgs): ExecSpec {
    return {
      bin: this._bin,
      args
    }
  }

  /**
   * Run the compiler with the provided arguments, producing a structured result
   *
   * @param args Arguments to pass to the compiler
   */
  async launch(args: ToolArgs): Promise<LauncherResult> {
    const run = await this.invoke(args)
    return { run }
  }
}

export default JavaLauncher
