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

import { BinInfo, ExecSpec, JavaTool, ToolArgs, ToolRun } from "./abstract";
import type { JavaToolchain } from "../java-home";

/**
 * Generic JDK Tool
 */
export class JdkTool extends JavaTool {
  private readonly _bin: BinInfo;

  private constructor(toolchain: JavaToolchain, tool: string) {
    super(toolchain);
    this._bin = this.bin(tool);
  }

  /**
   * Wrap the provided toolchain for use with an arbitrary binary
   *
   * @param toolchain Toolchain to wrap
   * @param tool Tool to wrap
   * @return Tool wrapper
   */
  // @ts-ignore
  static forToolchain(toolchain: JavaToolchain, tool: string): JdkTool {
    return new JdkTool(toolchain, tool);
  }

  // Execute the binary with the provided arguments.
  protected override exec(args: ToolArgs): ExecSpec {
    return {
      bin: this._bin,
      args,
    }
  }

  /**
   * Run the tool with the provided arguments, producing a structured result
   *
   * @param args Arguments to pass to the tool
   */
  async run(args: ToolArgs): Promise<ToolRun> {
    return await this.invoke(args);
  }
}

export default JdkTool;
