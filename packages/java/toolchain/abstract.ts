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

import { spawn, SpawnOptions } from 'node:child_process'
import { join, normalize } from 'node:path'
import { JavaToolchain } from '../java-home.js'
import { Readable } from 'node:stream'

/**
 * Information about a resolved tool binary.
 */
export type BinInfo = {
  relative: string
  absolute: string
  name: string
}

/**
 * Arguments for a run of a toolchain tool.
 */
export type ToolArgs = string[]

/**
 * Environment for a run of a toolchain tool.
 */
export type ToolEnv = Record<string, string>

/**
 * Execution spec for running a tool.
 */
export type ExecSpec = {
  bin: BinInfo
  args: ToolArgs
  options?: SpawnOptions
}

/**
 * Result of the run of a toolchain tool.
 */
export type ToolRun = {
  start: number
  finish: number
  duration: number
  exitCode: number
  exec: ExecSpec
  env: ToolEnv
  cwd: string
  result: { stdout: string; stderr: string }
}

const defaultSpawnOptions: Partial<SpawnOptions> = {
  cwd: '.',
  stdio: 'pipe',
  detached: false,
  shell: false,
  windowsHide: true,
  timeout: 30_000,
  killSignal: 'SIGTERM'
}

// Buffer a stream into a string.
async function bufferStream(stream: Readable): Promise<string> {
  const chunks: Buffer[] = []
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)))
    stream.on('error', err => reject(err))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

/**
 * Tool Error
 *
 * Describes an error that occurred while running a tool; the exit code is used to generate a message, and the stdout
 * and stderr strings for the run are made available.
 *
 * Call the `explain` method to produce a string block about the error, suitable for printing via `console.error`.
 */
export class ToolError extends Error {
  private constructor(
    public readonly run: ToolRun,
    message?: string
  ) {
    super(message || ToolError.explainErr(run))
  }

  // Create a new error from a run.
  static fromRun(run: ToolRun, message?: string): ToolError {
    return new ToolError(run, message)
  }

  /**
   * Explain this error in a string block
   *
   * @returns A string block about the error, suitable for printing via `console.error`
   */
  explain(): string {
    return ToolError.explainErr(this.run)
  }

  private static explainErr(run: ToolRun): string {
    return [
      `${run.exec.bin.name} failed with exit code ${run.exitCode}
=================================================================================
Working Directory:
  ${run.cwd}

Command line:
  ${run.exec.bin.absolute} \\
${run.exec.args.map(it => `    ${it}`).join(' \\ \n')}

Environment:
---------------------------------------------------------------------------------
${Object.entries(run.env || {})
  .map(([k, v]) => `- ${k} = ${v}`)
  .join('\n')}
`,
      `
Standard Error:
---------------------------------------------------------------------------------
${run.result.stderr}
=================================================================================
`
    ]
      .map(msg => msg.trim())
      .join('\n\n')
  }
}

/**
 * Abstract Java Tool
 *
 * Provides shared baseline implmentation logic for a Java Toolchain-provided tool.
 */
export abstract class JavaTool {
  // Current working directory for this tool.
  private _cwd: string = process.cwd()

  // Whether logs should be emitted to the console.
  private _logs: boolean = true

  // All runs seen by this instance.
  private readonly runs: ToolRun[] = []

  // Abort controller for the current run.
  private readonly abortController = new AbortController()

  /**
   * Protected constructor.
   
   * @param toolchain Toolchain which supplies this tool
   */
  // @ts-ignore
  protected constructor(protected readonly toolchain: JavaToolchain) {}

  /**
   * Perform the underlying execution for a tool run
   *
   * @param spec Specification for the execution
   * @returns Return value of `spawnSync` with content as a buffer
   */
  private async execTool(spec: ExecSpec): Promise<ToolRun> {
    // initial pre-work
    await this.onPreExec(spec)
    const env = this.env(spec.args)
    const cwd = this._cwd
    const options = {
      ...defaultSpawnOptions,
      signal: this.abortController.signal,
      cwd,
      env,
      ...(spec.options || {})
    }
    const start = performance.now()

    // spawn and run
    const exec: Promise<ToolRun> = new Promise((accept, reject) => {
      const tool = spawn(spec.bin.absolute, spec.args, options)
      const { stdout, stderr } = tool
      if (!tool || !tool.pid || !stdout || !stderr) {
        reject(new Error('Failed to spawn tool'))
        return
      }

      const stdoutPromise: Promise<string> = bufferStream(stdout)
      const stderrPromise: Promise<string> = bufferStream(stderr)

      tool.on('close', async code => {
        const finish = performance.now()
        const run = {
          exitCode: code === 0 ? 0 : code || -1,
          exec: spec,
          env,
          cwd,
          start,
          finish,
          duration: finish - start,
          result: {
            stdout: await stdoutPromise,
            stderr: await stderrPromise
          }
        }
        if (code === 0) {
          accept(run)
        } else {
          // handle errors
          reject(ToolError.fromRun(run))
        }
      })
    })

    // cleanup and finish
    try {
      const result = await exec
      this.runs.push(result)
      return result
    } catch (err) {
      if (err instanceof ToolError) {
        this.runs.push(err.run)
        this.err(err)
      }
      throw err
    } finally {
      await this.onPostExec()
    }
  }

  /**
   * Resolve information about a named binary from the target toolchain.
   *
   * @param name Name of the binary to resolve info for (like `javac`)
   * @return Information about the binary
   */
  protected bin(name: string): BinInfo {
    const target = normalize(join(this.toolchain.path(), 'bin', name))
    return {
      name,
      relative: join('bin', name),
      absolute: target
    }
  }

  /**
   * Handle tooling execution errors by printing to the console (by default)
   *
   * @param err Error that was experienced when running the tool
   */
  protected err(err: ToolError) {
    if (this._logs) {
      console.error(err.explain())
    }
  }

  /**
   * Produce environment variables to use for a tool execution
   *
   * @param _args Arguments for this execution of the tool
   * @returns Environment to use for the execution
   */
  protected env(_args: ToolArgs): ToolEnv {
    return {
      PWD: process.env.PWD || process.cwd(),
      PATH: process.env.PATH || '',
      JAVA_HOME: this.toolchain.path()
    }
  }

  /**
   * Execute pre-run actions, like creating temporary directories or setting up configuration
   *
   * @param _spec Spec for the execution to be run
   */
  protected async onPreExec(_spec: ExecSpec) {
    // Nothing, by default.
  }

  /**
   * Execute post-run actions, like cleaning up or verifying results
   */
  protected async onPostExec() {
    // Nothing, by default.
  }

  /**
   * Produce an execution spec based on the current tool's usage.
   *
   * @param args Arguments passed for this execution
   */
  protected abstract exec(args: ToolArgs): ExecSpec

  /**
   * Run the underlying tool with the provided arguments
   *
   * @param args Arguments to run the tool with
   * @returns Result of the tool run
   */
  protected async invoke(args: ToolArgs): Promise<ToolRun> {
    return this.execTool(this.exec(args))
  }

  // --- Public API

  /**
   * Change the current-working-directory for this tool
   *
   * @param path Path to change the CWD to for this execution
   * @returns This tool, for chaining
   */
  cwd(path: string): JavaTool {
    this._cwd = path
    return this
  }

  /**
   * Enable or disable log messages
   *
   * @param enabled Whether to enable console log messages
   * @returns This tool, for chaining
   */
  logs(enabled: boolean): JavaTool {
    this._logs = enabled
    return this
  }
}
