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

import { resolve } from "node:path";
import { env } from "node:process";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { describe, expect, test, beforeEach, jest } from "@jest/globals";
import { mockPath, testTmpdir, tmpdirPath, compileJava, compileAndPackageJar } from "./testutil.test";
import { JvmTarget, JvmPlatform } from "../java-model";
import { JavaToolchain, JavaToolchainVendor } from "../java-home";
import { ToolError } from "../toolchain/abstract";
import { repositoryForToolchain } from "../toolchain/repositories";

let errorMock: jest.SpiedFunction<typeof console.error>;

describe('toolchain', () => {
  beforeEach(() => {
    errorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  })

  test("obtain a java compiler from the current toolchain", () => {
    expect(JavaToolchain.current()).toBeDefined();
    const toolchain = JavaToolchain.current();
    expect(toolchain.path()).toBeDefined();
    expect(toolchain.versionInfo()).toBeDefined();
    expect(toolchain.version()).toBeDefined();
    expect(toolchain.semver()).toBeDefined();
    expect(errorMock).not.toHaveBeenCalled();
  });

  test("obtain a java compiler from the current toolchain", () => {
    const toolchain = JavaToolchain.current();
    expect(toolchain.compiler()).toBeDefined();
    expect(errorMock).not.toHaveBeenCalled();
  });

  test("obtain a java launcher from the current toolchain", () => {
    const toolchain = JavaToolchain.current();
    expect(toolchain.launcher()).toBeDefined();
    expect(errorMock).not.toHaveBeenCalled();
  });

  test("obtain a java toolchain for a path", () => {
    expect(JavaToolchain.forPath(resolve(env["JAVA_HOME"] as string))).toBeDefined();
    expect(errorMock).not.toHaveBeenCalled();
  });

  test("can run `javac -version` without failing", async () => {
    const javac = JavaToolchain.current().compiler();
    const result = await javac.compile(['-version']);
    expect(result).toBeDefined();
    expect(result.run).toBeDefined();
    expect(result.run.exitCode).toBe(0);
    expect(errorMock).not.toHaveBeenCalled();
  });

  test("can run `java -version` without failing", async () => {
    const java = JavaToolchain.current().launcher();
    const result = await java.launch(['-version']);
    expect(result).toBeDefined();
    expect(result.run).toBeDefined();
    expect(result.run.exitCode).toBe(0);
    expect(errorMock).not.toHaveBeenCalled();
  });

  test("can run `jar -version` without failing", async () => {
    const jar = JavaToolchain.current().tool('jar');
    const result = await jar.run(['--version']);
    expect(result).toBeDefined();
    expect(result.exitCode).toBe(0);
    expect(errorMock).not.toHaveBeenCalled();
  });

  test("can run `javac` to compile some java", async () => {
    const tmpdir = await testTmpdir();
    const srcpath = tmpdirPath(tmpdir, 'Hello.java');
    const src = readFileSync(mockPath('compiler/Hello.java'), 'utf-8');
    writeFileSync(srcpath, src);
  
    // source file should exist
    expect(existsSync(srcpath)).toBe(true);
  
    // compiled class file should not exist
    const classpath = tmpdirPath(tmpdir, 'Hello.class');
    expect(existsSync(classpath)).toBe(false);
  
    // ok, run the compiler with the tmpdir as cwd
    const compiler = JavaToolchain.current().compiler();
    compiler.cwd(tmpdir);
    const result = await compiler.compile(['Hello.java']);
  
    // result should be successful
    expect(result).toBeDefined();
    expect(result.run).toBeDefined();
    expect(result.run.exitCode).toBe(0);

    // source file should still exist
    expect(existsSync(srcpath)).toBe(true);

    // compiled class should exist now
    expect(existsSync(classpath)).toBe(true);
    expect(errorMock).not.toHaveBeenCalled();
  });

  test("can run `javac` testutil to compile regular java", async () => {
    const result = await compileJava(
      ['Hello.java'],
    );
    expect(result.classes).toHaveLength(1);
    expect(errorMock).not.toHaveBeenCalled();
  });

  test("can run `javac` to compile modular java", async () => {
    const result = await compileJava(
      ['module-info.java', 'Hello.java'],
    );
    expect(result.classes).toHaveLength(2);
    expect(errorMock).not.toHaveBeenCalled();
  });

  test("can run `javac` to compile modular java with extended module attributes", async () => {
    const result = await compileJava(['module-info.java', 'Hello.java'], {
      args: [
        '--module-source-path=$(tmpdir)/src',
        '--module=sample',
      ],
    });
    expect(result.classes).toHaveLength(2);
    expect(errorMock).not.toHaveBeenCalled();
  });

  test("captures tool run failures", async () => {
    const tool = JavaToolchain.current().compiler();
    tool.logs(false);
    let caught = false
    let err: Error | ToolError | any | undefined;
  
    try {
      await tool.compile(['--some-non-existent-flag'])
    } catch (error) {
      caught = true
      err = error
    }
  
    expect(caught).toBe(true);
    expect(err).toBeDefined();
    expect(err instanceof ToolError).toBe(true);
    expect(err.run).toBeDefined();
    expect(err.run.exitCode).not.toBe(0);
    expect(err.explain()).toBeDefined();
    expect(err.explain()).toContain('javac');
    expect(err.explain()).toContain(`exit code ${err.run.exitCode}`);
    expect(errorMock).not.toHaveBeenCalled();
  });
  
  test("captures and logs tool run failures to `console.error` when instructed", async () => {
    const tool = JavaToolchain.current().compiler();
    tool.logs(true);
    let caught = false
    let err: Error | ToolError | any | undefined;
  
    try {
      await tool.compile(['--some-non-existent-flag'])
    } catch (error) {
      caught = true
      err = error
    }
  
    expect(caught).toBe(true);
    expect(err).toBeDefined();
    expect(err instanceof ToolError).toBe(true);
    expect(err.run).toBeDefined();
    expect(err.run.exitCode).not.toBe(0);
    expect(err.explain()).toBeDefined();
    expect(err.explain()).toContain('javac');
    expect(err.explain()).toContain(`exit code ${err.run.exitCode}`);
    expect(errorMock).toHaveBeenCalledTimes(1);
  });

  test("can run `javac` and `jar` to compile modular java (complex)", async () => {
    const result = await compileAndPackageJar([
      {from: 'complex/META-INF/services/hello.Service', to: 'META-INF/services/hello.Service'},
      {from: 'complex/module-info.java', to: 'module-info.java'},
      {from: 'complex/Another.java', to: 'Another.java'},
      {from: 'complex/Implementation.java', to: 'Implementation.java'},
      {from: 'complex/Service.java', to: 'Service.java'},
      {from: 'complex/Hello.java', to: 'Hello.java'},
    ]);
    expect(result.classes).toHaveLength(5);
    expect(result.resources).toHaveLength(1);
    expect(result.outputs).toHaveLength(6);
  });
});

describe('repositories', () => {
  test("can resolve a graalvm download URL", () => {
    const out = repositoryForToolchain(JavaToolchainVendor.GRAALVM, JvmTarget.JDK_22, JvmPlatform.LINUX_AMD64);
    expect(out.toString()).toBe('https://download.oracle.com/graalvm/22/latest/graalvm-jdk-22_linux-x64_bin.tar.gz');
  });

  test("throws if the vendor is not recognized", () => {
    expect(() => {
      repositoryForToolchain('not-a-vendor' as any, JvmTarget.JDK_22, JvmPlatform.LINUX_AMD64);
    }).toThrow();
  })

  test("throws if the version is not recognized", () => {
    expect(() => {
      repositoryForToolchain(JavaToolchainVendor.GRAALVM, '99' as JvmTarget, JvmPlatform.LINUX_AMD64);
    }).toThrow();
  })

  test("throws if the platform is not recognized", () => {
    expect(() => {
      repositoryForToolchain(JavaToolchainVendor.GRAALVM, JvmTarget.JDK_22, 'not-supported' as JvmPlatform);
    }).toThrow();
  })
})
