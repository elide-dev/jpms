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

import { dirname, isAbsolute, join, normalize, resolve } from 'node:path'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { test, expect } from '@jest/globals'

import { JavaToolchain } from '../java-home'
import { mkdir, mkdtemp } from 'node:fs/promises'
import { CompileResult } from '../toolchain/compiler'
import { glob } from 'glob'

const compileDebugLogs = false

const manifestDefaultLines = ['Manifest-Version: 1.0', 'Created-By: 1.0.0 (Elide Technologies, Inc.)']

export function mockPath(path: string) {
  return resolve(normalize(join(__dirname, path)))
}

export function repoPath(path: string) {
  return resolve(normalize(join(__dirname, '..', '..', '..', 'repository', path)))
}

export function repoJar(group: string, artifact: string, version: string): { relative: string, resolved: string } {
  const pathSegments: string[] = []
  const groupSegments = group.split('.')
  pathSegments.push(...groupSegments)
  pathSegments.push(artifact)
  pathSegments.push(version)
  pathSegments.push(`${artifact}-${version}.jar`)
  return repoJarByPath(join(...pathSegments))
}

export function repoJarByPath(path: string): { relative: string, resolved: string } {
  return {
    resolved: repoPath(path),
    relative: path,
  }
}
export async function testTmpdir(): Promise<string> {
  return await mkdtemp('/tmp/java-toolchain-test-')
}

export function tmpdirPath(dir: string, path: string) {
  return normalize(join(dir, path))
}

export function currentToolchain(): JavaToolchain {
  return JavaToolchain.current()
}

export function classpathForSourcePath(path: string): string {
  return path.replace(/\.java$/, '.class')
}

function compileDebug(...args: any[]) {
  if (compileDebugLogs) {
    console.log(...args)
  }
}

export type CompileJavaOptions = {
  args?: string[]
  trimPath?: string
  preserveArgPaths?: boolean
  modular?: boolean
}

export type CompilePackageJarOptions = CompileJavaOptions & {
  jarName?: string
  moduleVersion?: string
  modulePath?: string
  hashModules?: string
  jarArgs?: string[]
  mainClass?: string
}

function maybeTrimSourcePath(prefix: string, path: string): string {
  if (prefix) {
    const rewrite = path.replace(prefix, '')
    compileDebug(`replacing prefix: ${path} → ${rewrite}`)
    return rewrite
  }
  return path
}

/**
 * Find the longest common substring within the array of strings
 */
function longestCommonSubstring(entries: string[]): string | null {
  if (entries.length < 2) {
    return entries[0] || null
  }

  const sorted = entries.sort()
  const second = entries[1]
  let previous = second
  return (
    sorted.reduce((acc, value) => {
      const a = value
      const b = acc || previous
      let i = 0
      while (i < a.length && a.charAt(i) === b.charAt(i)) {
        i++
      }
      return a.substring(0, i)
    }) || null
  )
}

export type JavaCompileResultBase = {
  buildroot: string
  result: CompileResult
  classes: string[]
  resources: string[]
  outputs: string[]
}

export type JavaCompileResult =
  | (JavaCompileResultBase & {
      isMultiModular: true
      module: string
    })
  | (JavaCompileResultBase & {
      isMultiModular: false
    })

export type CompilePackageResult = JavaCompileResult & {
  jar: string
}

function replaceInArg(tmpdir: string, arg: string): string {
  return arg.replaceAll('$(tmpdir)', tmpdir)
}

function maybeTrimCwd(options: CompileJavaOptions | null, cwd: string, arg: string): string {
  if (options?.preserveArgPaths === true) {
    return arg
  }
  if (arg.startsWith(cwd)) {
    return arg.substring(cwd.length + 1)
  }
  if (arg.includes(`=${cwd}`)) {
    return arg.replace(`=${cwd}`, '=').replace('=/', '=')
  }
  return arg
}

export async function compileJava(
  sources: (string | { from: string; to: string })[],
  options?: CompileJavaOptions
): Promise<JavaCompileResult> {
  // create temporary directory where the compile will be run
  const tmpdir = await testTmpdir()

  // detect a multi-module-capable modular build, which will need the module name
  const args = options?.args || []
  const isMultiModular: boolean = !!args.find(arg => {
    return arg.startsWith('--module') || arg.startsWith('--module-source-path')
  })
  let argI = 0
  let moduleName: string | null = null
  for (const arg of args) {
    if (arg.startsWith('--module=')) {
      moduleName = arg.split('=')[1]
      break
    } else if (arg === '--module') {
      // get the next arg
      moduleName = args[argI + 1]
      break
    }
    argI++
  }

  // if we're in a multi-modular build, and we have the module name, setup the source path to use it
  let srcroot = tmpdirPath(tmpdir, 'src')
  if (isMultiModular && moduleName) {
    compileDebug(`multi-modular build detected, setting srcroot to: ${srcroot}`)
    srcroot = tmpdirPath(tmpdir, join('src', moduleName))
  } else {
    compileDebug(`using srcroot: ${srcroot}`)
  }

  // if no explicit prefix is set, try to identify one from the sources, by looking for a common maximum
  // substring shared by all entries.
  const sourcefiles = sources.map(s => (typeof s === 'string' ? s : s.from)).filter(s => s.endsWith('.java'))
  compileDebug(`gathered source files: ${sourcefiles.length} java`)
  const commonPrefix = sourcefiles.length > 1 ? options?.trimPath || longestCommonSubstring(sourcefiles) || '' : ''

  // copy source files
  const buildroot = tmpdirPath(tmpdir, 'build')
  compileDebug(`making buildroot: ${buildroot}`)
  await mkdir(buildroot)
  compileDebug(`making srcroot: ${srcroot}`)
  await mkdir(srcroot, { recursive: true })
  const javaSources: string[] = []

  // process sources into source root, filter resources as we go
  for (const source of sources) {
    const srcpathRelative = typeof source === 'string' ? source : source.from
    const topathRelative = maybeTrimSourcePath(
      commonPrefix,
      typeof source === 'string' ? source : source.to || source.from
    )
    const isResource = !srcpathRelative.endsWith('.java')

    const srcpath = tmpdirPath(srcroot, srcpathRelative)
    const topath = isAbsolute(topathRelative) ? topathRelative : tmpdirPath(srcroot, topathRelative)
    compileDebug(`copying src: ${srcpathRelative} → ${topathRelative}`)

    const readPath = isAbsolute(srcpathRelative) ? srcpathRelative : mockPath(`compiler/${srcpathRelative}`)
    const src = readFileSync(readPath, 'utf-8')
    const srcparent = dirname(topath)
    if (!existsSync(srcparent)) {
      compileDebug(`making src parent: ${srcparent}`)
      await mkdir(srcparent, { recursive: true })
    }

    writeFileSync(topath, src)
    expect(existsSync(topath)).toBe(true)
    const classpath = classpathForSourcePath(srcpath)
    expect(existsSync(classpath)).toBe(false)

    if (isResource) {
      // copy the resource to the build path proactively so it can be seen by tools like `jar`
      const buildResource = tmpdirPath(buildroot, topathRelative)
      compileDebug(`copying resource to build: ${buildResource}`)
      const parent = dirname(buildResource)
      if (!existsSync(parent)) {
        compileDebug(`making build parent: ${parent}`)
        await mkdir(parent, { recursive: true })
      }
      writeFileSync(buildResource, src)
      expect(existsSync(buildResource)).toBe(true)
    } else {
      javaSources.push(topathRelative)
    }
  }

  // run the compile
  compileDebug(`obtaining compiler`)
  const javac = currentToolchain().compiler()
  javac.logs(false).cwd(tmpdir)

  const effectiveArgs = [
    ...javaSources.map(s => (isAbsolute(s) ? s : tmpdirPath(srcroot, s))),
    '-d',
    buildroot,
    ...(options?.args ?? [])
  ].map(arg => maybeTrimCwd(options || null, tmpdir, replaceInArg(tmpdir, arg)))

  compileDebug(`compiling: ${effectiveArgs.join(' ')}`)
  const result = await javac.compile(effectiveArgs)
  compileDebug(`compile result: ${JSON.stringify(result, null, '  ')}`)

  // collect the class files and return
  const classes = glob.sync(tmpdirPath(buildroot, '**/*.class'))
  const resources = glob.sync(tmpdirPath(buildroot, '**/*'), { nodir: true, ignore: '**/*.class' })

  // combine and sort to provide all outputs
  const outputs = [...classes, ...resources].sort()

  const out = {
    buildroot,
    result,
    classes,
    resources,
    outputs,
    isMultiModular,
    module: isMultiModular ? moduleName : undefined
  }
  expect(out).toBeDefined()
  expect(out.buildroot).toBeDefined()
  expect(out.classes).toBeDefined()
  expect(out.resources).toBeDefined()
  expect(out.outputs).toBeDefined()
  expect(out.result).toBeDefined()
  expect(out.result.run.exitCode).toBe(0)
  return out as JavaCompileResult
}

export async function compileAndPackageJar(
  sources: (string | { from: string; to: string })[],
  manifest: string[] = [],
  options?: CompilePackageJarOptions
): Promise<CompilePackageResult> {
  // compile the sources; this also copies resources
  const result = await compileJava(sources, options)

  // obtain the build path so we can write the manifest
  const buildroot = result.buildroot
  const manifestPath = join(dirname(result.buildroot), 'MANIFEST.MF')

  // account for main class in manifest
  if (options?.mainClass && !manifest.find(m => m.startsWith('Main-Class'))) {
    manifest.push(`Main-Class: ${options.mainClass}`)
  }

  // render and write the manifest
  const renderedManifest = manifestDefaultLines.concat(manifest).concat(['']).join('\n')
  const jarName = options?.jarName ?? 'out.jar'
  compileDebug(`writing jar manifest → ${manifestPath}`)
  writeFileSync(manifestPath, renderedManifest)

  // obtain the jar tool to use
  const jar = currentToolchain().tool('jar')
  jar.logs(false).cwd(buildroot)

  const jarArgs = ['--create', `--file=${jarName}`, `--manifest=${manifestPath}`]

  if (options?.modulePath) {
    jarArgs.push(`--module-path=${options.modulePath}`)
  }
  if (options?.moduleVersion) {
    jarArgs.push(`--module-version=${options.moduleVersion}`)
  }
  if (options?.hashModules) {
    jarArgs.push(`--hash-modules=${options.hashModules}`)
  }
  if (options?.mainClass) {
    jarArgs.push(`--main-class=${options.mainClass}`)
  }
  if (options?.jarArgs) {
    jarArgs.push(...options.jarArgs)
  }
  jarArgs.push('.')

  compileDebug(`running jar: ${jarArgs.join(' ')}`)
  const callResult = await jar.run(jarArgs)
  expect(callResult).toBeDefined()
  expect(callResult.exitCode).toBe(0)

  // build the jar
  return {
    ...result,
    jar: join(buildroot, jarName)
  }
}

test('test util: should find a basic common substring', () => {
  const result = longestCommonSubstring(['abc', 'abd'])
  expect(result).toBe('ab')
})

test('test util: should find a basic path substring', () => {
  const result = longestCommonSubstring(['testing/hello/one/two/three.txt', 'testing/again.txt'])
  expect(result).toBe('testing/')
})

test('test util: should not die when there is no common substring', () => {
  const result = longestCommonSubstring(['hello/one/two/three.txt', 'testing/again.txt'])
  expect(result).toBe(null)
})
