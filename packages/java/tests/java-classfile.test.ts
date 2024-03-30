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

import { expect, test } from '@jest/globals'
import { JavaClassFile } from '../java-classfile'
import { compileJava } from './testutil'
import { existsSync, readFileSync } from 'fs'
import { JavaToolchain } from '../java-home'
import { jvmLevelForTarget, jvmTargetForVersion } from '../java-model'
import { BuiltinModule } from '../javamodules/jdk-modules'

test('can parse a simple java class', async () => {
  const result = await compileJava(['Hello.java'])
  expect(result.classes).toHaveLength(1)
  const compiledClassfile = result.classes[0]
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.raw()).toBeDefined()
})

/// ----- Bytecode Targeting

test('can determine the bytecode target for a java class', async () => {
  // setup expectations
  const toolchain = JavaToolchain.current()
  const jdkVersion = toolchain.semver().major
  const jvmTargetExpected = jvmTargetForVersion(jdkVersion)
  const bytecodeTargetExpected = jvmLevelForTarget(jvmTargetExpected)

  // compile
  const result = await compileJava(['Hello.java'])
  expect(result.classes).toHaveLength(1)
  const compiledClassfile = result.classes[0]
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  const target = parsed.bytecodeTarget()
  expect(target).toBeDefined()
  expect(parsed.raw().major_version).toBe(bytecodeTargetExpected)
  expect(target).toBe(jvmTargetExpected)
})

test('can determine the bytecode target for java class data', async () => {
  // setup expectations
  const toolchain = JavaToolchain.current()
  const jdkVersion = toolchain.semver().major
  const jvmTargetExpected = jvmTargetForVersion(jdkVersion)
  const bytecodeTargetExpected = jvmLevelForTarget(jvmTargetExpected)

  // compile
  const result = await compileJava(['Hello.java'])
  expect(result.classes).toHaveLength(1)
  const compiledClassfile = result.classes[0]
  expect(existsSync(compiledClassfile)).toBe(true)
  const compiledClassfileData = readFileSync(compiledClassfile)
  const parsed = JavaClassFile.fromData(compiledClassfileData)
  expect(parsed).toBeDefined()
  const target = parsed.bytecodeTarget()
  expect(target).toBeDefined()
  expect(parsed.raw().major_version).toBe(bytecodeTargetExpected)
  expect(target).toBe(jvmTargetExpected)
})

/// ----- Class Naming

test('can determine the qualified class name for a java class', async () => {
  const result = await compileJava(['Hello.java'])
  expect(result.classes).toHaveLength(1)
  const compiledClassfile = result.classes[0]
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.qualifiedName()).toBe('hello.Hello')
})

test('can determine the simple class name for a java class', async () => {
  const result = await compileJava(['Hello.java'])
  expect(result.classes).toHaveLength(1)
  const compiledClassfile = result.classes[0]
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.simpleName()).toBe('Hello')
})

test('can determine the package name for a java class', async () => {
  const result = await compileJava(['Hello.java'])
  expect(result.classes).toHaveLength(1)
  const compiledClassfile = result.classes[0]
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.packageName()).toBe('hello')
})

/// ----- Modules

test('can identify a non-module compiled class', async () => {
  const result = await compileJava(['Hello.java'])
  expect(result.classes).toHaveLength(1)
  const compiledClassfile = result.classes[0]
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.isModule()).toBe(false)
})

test('can identify a compiled module definition (simple)', async () => {
  const result = await compileJava(['Hello.java', 'module-info.java'])
  expect(result.classes).toHaveLength(2)
  const compiledClassfile = result.classes.find(f => f.endsWith('module-info.class')) as string
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.isModule()).toBe(true)
  expect(parsed.moduleInfo()).toBeDefined()
  const info = parsed.moduleInfo()
  expect(info.name).toBe('sample')
  expect(info.version).not.toBeDefined()
  expect(info.flags.open).toBe(false)
  expect(info.requires).toHaveLength(2)
  expect(info.requires[0].module).toBe(BuiltinModule.JAVA_BASE)
  expect(info.requires[0].static).toBe(false)
  expect(info.requires[0].transitive).toBe(false)
  expect(info.requires[1].module).toBe(BuiltinModule.JAVA_LOGGING)
  expect(info.requires[1].static).toBe(false)
  expect(info.requires[1].transitive).toBe(false)
  expect(info.exports).toHaveLength(1)
  expect(info.exports[0].package).toBe('hello')
  expect(info.exports[0].to).toBeDefined()
  expect(info.exports[0].to).toHaveLength(0)
  expect(info.opens).toHaveLength(0)
  expect(info.provides).toHaveLength(0)
  expect(info.uses).toHaveLength(0)
})

test('can identify a compiled module definition (complex)', async () => {
  const result = await compileJava([
    { from: 'complex/META-INF/services/hello.Service', to: 'META-INF/services/hello.Service' },
    { from: 'complex/module-info.java', to: 'module-info.java' },
    { from: 'complex/Another.java', to: 'Another.java' },
    { from: 'complex/Implementation.java', to: 'Implementation.java' },
    { from: 'complex/Service.java', to: 'Service.java' },
    { from: 'complex/Hello.java', to: 'Hello.java' }
  ])
  expect(result.classes).toHaveLength(5)
  expect(result.outputs).toHaveLength(6)
  expect(result.resources).toHaveLength(1)
  const compiledClassfile = result.classes.find(f => f.endsWith('module-info.class')) as string
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.isModule()).toBe(true)
  expect(parsed.moduleInfo()).toBeDefined()
  const info = parsed.moduleInfo()
  expect(info.name).toBe('complex')
  expect(info.version).not.toBeDefined()
  expect(info.flags.open).toBe(false)
  expect(info.requires).toHaveLength(4)

  // `requires java.base` (implied)
  expect(info.requires[0].module).toBe(BuiltinModule.JAVA_BASE)
  expect(info.requires[0].static).toBe(false)
  expect(info.requires[0].transitive).toBe(false)

  // `requires transitive java.compiler`
  expect(info.requires[1].module).toBe(BuiltinModule.JAVA_COMPILER)
  expect(info.requires[1].static).toBe(false)
  expect(info.requires[1].transitive).toBe(true)

  // `requires static java.compiler`
  expect(info.requires[2].module).toBe(BuiltinModule.JAVA_DESKTOP)
  expect(info.requires[2].static).toBe(true)
  expect(info.requires[2].transitive).toBe(false)

  // `requires java.logging`
  expect(info.requires[3].module).toBe(BuiltinModule.JAVA_LOGGING)
  expect(info.requires[3].static).toBe(false)
  expect(info.requires[3].transitive).toBe(false)

  expect(info.exports).toHaveLength(2)

  // `exports hello`
  expect(info.exports[0].package).toBe('hello')
  expect(info.exports[0].to).toBeDefined()
  expect(info.exports[0].to).toHaveLength(0)

  // `exports another to sample`
  expect(info.exports[1].package).toBe('another')
  expect(info.exports[1].to).toBeDefined()
  expect(info.exports[1].to).toHaveLength(1)
  expect(info.exports[1].to[0]).toBe('sample')

  expect(info.opens).toHaveLength(2)

  // `opens hello`
  expect(info.opens[0].package).toBe('hello')
  expect(info.opens[0].to).toBeDefined()
  expect(info.opens[0].to).toHaveLength(0)

  // `opens another to sample`
  expect(info.opens[1].package).toBe('another')
  expect(info.opens[1].to).toBeDefined()
  expect(info.opens[1].to).toHaveLength(1)
  expect(info.opens[1].to[0]).toBe('sample')

  expect(info.uses).toHaveLength(1)

  // `uses hello.Service`
  expect(info.uses[0].service).toBe('hello.Service')

  expect(info.provides).toHaveLength(1)

  // `provides hello.Service with hello.Implementation`
  expect(info.provides[0].service).toBeDefined()
  expect(info.provides[0].service).toBe('hello.Service')
  expect(info.provides[0].with).toBeDefined()
  expect(info.provides[0].with).toHaveLength(1)
  expect(info.provides[0].with[0]).toBe('hello.Implementation')
})

test('can identify top-level module info', async () => {
  const result = await compileJava([
    { from: 'complex/META-INF/services/hello.Service', to: 'META-INF/services/hello.Service' },
    { from: 'complex/module-info.java', to: 'module-info.java' },
    { from: 'complex/Another.java', to: 'Another.java' },
    { from: 'complex/Implementation.java', to: 'Implementation.java' },
    { from: 'complex/Service.java', to: 'Service.java' },
    { from: 'complex/Hello.java', to: 'Hello.java' }
  ])
  expect(result.classes).toHaveLength(5)
  expect(result.outputs).toHaveLength(6)
  expect(result.resources).toHaveLength(1)
  const compiledClassfile = result.classes.find(f => f.endsWith('module-info.class')) as string
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.isModule()).toBe(true)
  expect(parsed.moduleInfo()).toBeDefined()
  const info = parsed.moduleInfo()
  expect(info.name).toBe('complex')
  expect(info.version).not.toBeDefined()
  expect(info.flags.open).toBe(false)
  expect(info.requires).toHaveLength(4)
})

test('can identify top-level module info (open)', async () => {
  const result = await compileJava([
    { from: 'open/module-info.java', to: 'module-info.java' },
    { from: 'open/Hello.java', to: 'Hello.java' }
  ])
  expect(result.classes).toHaveLength(2)
  expect(result.outputs).toHaveLength(2)
  expect(result.resources).toHaveLength(0)
  const compiledClassfile = result.classes.find(f => f.endsWith('module-info.class')) as string
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.isModule()).toBe(true)
  expect(parsed.moduleInfo()).toBeDefined()
  const info = parsed.moduleInfo()
  expect(info.name).toBe('sample')
  expect(info.version).not.toBeDefined()
  expect(info.flags.open).toBe(true)
  expect(info.requires).toHaveLength(1)
})

test('can identify module `requires ...` statements', async () => {
  const result = await compileJava([
    { from: 'complex/META-INF/services/hello.Service', to: 'META-INF/services/hello.Service' },
    { from: 'complex/module-info.java', to: 'module-info.java' },
    { from: 'complex/Another.java', to: 'Another.java' },
    { from: 'complex/Implementation.java', to: 'Implementation.java' },
    { from: 'complex/Service.java', to: 'Service.java' },
    { from: 'complex/Hello.java', to: 'Hello.java' }
  ])
  expect(result.classes).toHaveLength(5)
  expect(result.outputs).toHaveLength(6)
  expect(result.resources).toHaveLength(1)
  const compiledClassfile = result.classes.find(f => f.endsWith('module-info.class')) as string
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.isModule()).toBe(true)
  expect(parsed.moduleInfo()).toBeDefined()
  const info = parsed.moduleInfo()
  expect(info.name).toBe('complex')
  expect(info.version).not.toBeDefined()
  expect(info.flags.open).toBe(false)
  expect(info.requires).toHaveLength(4)

  // `requires java.base` (implied)
  expect(info.requires[0].module).toBe(BuiltinModule.JAVA_BASE)
  expect(info.requires[0].static).toBe(false)
  expect(info.requires[0].transitive).toBe(false)

  // `requires transitive java.compiler`
  expect(info.requires[1].module).toBe(BuiltinModule.JAVA_COMPILER)
  expect(info.requires[1].static).toBe(false)
  expect(info.requires[1].transitive).toBe(true)

  // `requires static java.compiler`
  expect(info.requires[2].module).toBe(BuiltinModule.JAVA_DESKTOP)
  expect(info.requires[2].static).toBe(true)
  expect(info.requires[2].transitive).toBe(false)

  // `requires java.logging`
  expect(info.requires[3].module).toBe(BuiltinModule.JAVA_LOGGING)
  expect(info.requires[3].static).toBe(false)
  expect(info.requires[3].transitive).toBe(false)
})

test('can identify module `exports ...` statements', async () => {
  const result = await compileJava([
    { from: 'complex/META-INF/services/hello.Service', to: 'META-INF/services/hello.Service' },
    { from: 'complex/module-info.java', to: 'module-info.java' },
    { from: 'complex/Another.java', to: 'Another.java' },
    { from: 'complex/Implementation.java', to: 'Implementation.java' },
    { from: 'complex/Service.java', to: 'Service.java' },
    { from: 'complex/Hello.java', to: 'Hello.java' }
  ])
  expect(result.classes).toHaveLength(5)
  expect(result.outputs).toHaveLength(6)
  expect(result.resources).toHaveLength(1)
  const compiledClassfile = result.classes.find(f => f.endsWith('module-info.class')) as string
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.isModule()).toBe(true)
  expect(parsed.moduleInfo()).toBeDefined()
  const info = parsed.moduleInfo()
  expect(info.name).toBe('complex')
  expect(info.version).not.toBeDefined()
  expect(info.flags.open).toBe(false)
  expect(info.requires).toHaveLength(4)
  expect(info.exports).toHaveLength(2)

  // `exports hello`
  expect(info.exports[0].package).toBe('hello')
  expect(info.exports[0].to).toBeDefined()
  expect(info.exports[0].to).toHaveLength(0)
})

test('can identify module `exports ... to ...` statements', async () => {
  const result = await compileJava([
    { from: 'complex/META-INF/services/hello.Service', to: 'META-INF/services/hello.Service' },
    { from: 'complex/module-info.java', to: 'module-info.java' },
    { from: 'complex/Another.java', to: 'Another.java' },
    { from: 'complex/Implementation.java', to: 'Implementation.java' },
    { from: 'complex/Service.java', to: 'Service.java' },
    { from: 'complex/Hello.java', to: 'Hello.java' }
  ])
  expect(result.classes).toHaveLength(5)
  expect(result.outputs).toHaveLength(6)
  expect(result.resources).toHaveLength(1)
  const compiledClassfile = result.classes.find(f => f.endsWith('module-info.class')) as string
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.isModule()).toBe(true)
  expect(parsed.moduleInfo()).toBeDefined()
  const info = parsed.moduleInfo()
  expect(info.name).toBe('complex')
  expect(info.version).not.toBeDefined()
  expect(info.flags.open).toBe(false)
  expect(info.requires).toHaveLength(4)
  expect(info.exports).toHaveLength(2)

  // `exports another to sample`
  expect(info.exports[1].package).toBe('another')
  expect(info.exports[1].to).toBeDefined()
  expect(info.exports[1].to).toHaveLength(1)
  expect(info.exports[1].to[0]).toBe('sample')
})

test('can identify module `opens ...` statements', async () => {
  const result = await compileJava([
    { from: 'complex/META-INF/services/hello.Service', to: 'META-INF/services/hello.Service' },
    { from: 'complex/module-info.java', to: 'module-info.java' },
    { from: 'complex/Another.java', to: 'Another.java' },
    { from: 'complex/Implementation.java', to: 'Implementation.java' },
    { from: 'complex/Service.java', to: 'Service.java' },
    { from: 'complex/Hello.java', to: 'Hello.java' }
  ])
  expect(result.classes).toHaveLength(5)
  expect(result.outputs).toHaveLength(6)
  expect(result.resources).toHaveLength(1)
  const compiledClassfile = result.classes.find(f => f.endsWith('module-info.class')) as string
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.isModule()).toBe(true)
  expect(parsed.moduleInfo()).toBeDefined()
  const info = parsed.moduleInfo()
  expect(info.name).toBe('complex')
  expect(info.version).not.toBeDefined()
  expect(info.flags.open).toBe(false)
  expect(info.requires).toHaveLength(4)
  expect(info.opens).toHaveLength(2)

  // `opens hello`
  expect(info.opens[0].package).toBe('hello')
  expect(info.opens[0].to).toBeDefined()
  expect(info.opens[0].to).toHaveLength(0)
})

test('can identify module `opens ... to ...` statements', async () => {
  const result = await compileJava([
    { from: 'complex/META-INF/services/hello.Service', to: 'META-INF/services/hello.Service' },
    { from: 'complex/module-info.java', to: 'module-info.java' },
    { from: 'complex/Another.java', to: 'Another.java' },
    { from: 'complex/Implementation.java', to: 'Implementation.java' },
    { from: 'complex/Service.java', to: 'Service.java' },
    { from: 'complex/Hello.java', to: 'Hello.java' }
  ])
  expect(result.classes).toHaveLength(5)
  expect(result.outputs).toHaveLength(6)
  expect(result.resources).toHaveLength(1)
  const compiledClassfile = result.classes.find(f => f.endsWith('module-info.class')) as string
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.isModule()).toBe(true)
  expect(parsed.moduleInfo()).toBeDefined()
  const info = parsed.moduleInfo()
  expect(info.name).toBe('complex')
  expect(info.version).not.toBeDefined()
  expect(info.flags.open).toBe(false)
  expect(info.requires).toHaveLength(4)
  expect(info.opens).toHaveLength(2)

  // `opens another to sample`
  expect(info.opens[1].package).toBe('another')
  expect(info.opens[1].to).toBeDefined()
  expect(info.opens[1].to).toHaveLength(1)
  expect(info.opens[1].to[0]).toBe('sample')
})

test('can identify module `uses ...` statements', async () => {
  const result = await compileJava([
    { from: 'complex/META-INF/services/hello.Service', to: 'META-INF/services/hello.Service' },
    { from: 'complex/module-info.java', to: 'module-info.java' },
    { from: 'complex/Another.java', to: 'Another.java' },
    { from: 'complex/Implementation.java', to: 'Implementation.java' },
    { from: 'complex/Service.java', to: 'Service.java' },
    { from: 'complex/Hello.java', to: 'Hello.java' }
  ])
  expect(result.classes).toHaveLength(5)
  expect(result.outputs).toHaveLength(6)
  expect(result.resources).toHaveLength(1)
  const compiledClassfile = result.classes.find(f => f.endsWith('module-info.class')) as string
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.isModule()).toBe(true)
  expect(parsed.moduleInfo()).toBeDefined()
  const info = parsed.moduleInfo()
  expect(info.name).toBe('complex')
  expect(info.version).not.toBeDefined()
  expect(info.flags.open).toBe(false)
  expect(info.requires).toHaveLength(4)
  expect(info.uses).toHaveLength(1)

  // `uses hello.Service`
  expect(info.uses[0].service).toBe('hello.Service')
})

test('can identify module `provides ... with ...` statements', async () => {
  const result = await compileJava([
    { from: 'complex/META-INF/services/hello.Service', to: 'META-INF/services/hello.Service' },
    { from: 'complex/module-info.java', to: 'module-info.java' },
    { from: 'complex/Another.java', to: 'Another.java' },
    { from: 'complex/Implementation.java', to: 'Implementation.java' },
    { from: 'complex/Service.java', to: 'Service.java' },
    { from: 'complex/Hello.java', to: 'Hello.java' }
  ])
  expect(result.classes).toHaveLength(5)
  expect(result.outputs).toHaveLength(6)
  expect(result.resources).toHaveLength(1)
  const compiledClassfile = result.classes.find(f => f.endsWith('module-info.class')) as string
  expect(existsSync(compiledClassfile)).toBe(true)
  const parsed = await JavaClassFile.fromFile(compiledClassfile)
  expect(parsed).toBeDefined()
  expect(parsed.isModule()).toBe(true)
  expect(parsed.moduleInfo()).toBeDefined()
  const info = parsed.moduleInfo()
  expect(info.name).toBe('complex')
  expect(info.version).not.toBeDefined()
  expect(info.flags.open).toBe(false)
  expect(info.requires).toHaveLength(4)
  expect(info.provides).toHaveLength(1)

  // `provides hello.Service with hello.Implementation`
  expect(info.provides[0].service).toBeDefined()
  expect(info.provides[0].service).toBe('hello.Service')
  expect(info.provides[0].with).toBeDefined()
  expect(info.provides[0].with).toHaveLength(1)
  expect(info.provides[0].with[0]).toBe('hello.Implementation')
})

// test("can identify a module's version", async () => {
//   const result = await compileAndPackageJar([
//     {from: 'complex/META-INF/services/hello.Service', to: 'META-INF/services/hello.Service'},
//     {from: 'complex/module-info.java', to: 'module-info.java'},
//     {from: 'complex/Another.java', to: 'Another.java'},
//     {from: 'complex/Implementation.java', to: 'Implementation.java'},
//     {from: 'complex/Service.java', to: 'Service.java'},
//     {from: 'complex/Hello.java', to: 'Hello.java'},
//   ], [], {
//     moduleVersion: '1.2.3'
//   });
//   expect(result.classes).toHaveLength(5);
//   expect(result.resources).toHaveLength(1);
//   expect(result.outputs).toHaveLength(6);
//   expect(result.jar).toBeDefined();

//   // parse the built module
//   const compiledClassfile = result.classes.find((f) => f.endsWith('module-info.class')) as string;
//   expect(existsSync(compiledClassfile)).toBe(true);
//   const parsed = await JavaClassFile.fromFile(compiledClassfile);
//   expect(parsed).toBeDefined();
//   expect(parsed.isModule()).toBe(true);
//   expect(parsed.moduleInfo()).toBeDefined();
//   const info = parsed.moduleInfo();
//   expect(info.name).toBe('complex');
//   expect(info.version).not.toBeDefined();
//   expect(info.flags.open).toBe(false);
//   expect(info.requires).toHaveLength(4);
//   expect(info.provides).toHaveLength(1);
//   expect(info.version).toBe('1.2.3');
// });
