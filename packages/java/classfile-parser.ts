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
// @ts-ignore
import { existsSync } from "node:fs";
// @ts-ignore
import { readFile } from "node:fs/promises";

import { TextDecoder } from "util";
import { JavaClassFileReader, ClassFile } from "./javaclasses/java-class-reader";

type RawClassData = ClassFile;

// Read class data from a file, then parse it.
async function readClassfile(path: string): Promise<RawClassData> {
  const classfilePath = resolve(path);
  console.log(`would read from path ${classfilePath}`);
  if (!existsSync(classfilePath)) throw new Error(`Class file does not exist: ${classfilePath}`);
  return readClassfileData(await readFile(classfilePath));
}

// Parse the provided classfile data.
function readClassfileData(data: Buffer): RawClassData {
  console.log("would read data" + data);
  const classFile = JavaClassFileReader.readData(data);
  // @ts-ignore
  const textDecoder = new TextDecoder();
  return classFile;
}

/**
 * Java Class File
 */
export class JavaClassFile {
  /**
   * Primary constructor.
   *
   * @param _classdata Class data this class-file should wrap for access
   */
  private constructor(private readonly _classdata: RawClassData) {}

  /**
   * @return Raw parsed class data.
   */
  raw(): RawClassData {
    return this._classdata;
  }

  /**
   * Parse Java class information from the provided file
   *
   * @param file File to parse class info from
   * @return Parsed and validated class info
   */
  static async fromFile(file: string): Promise<JavaClassFile> {
    return new JavaClassFile(await readClassfile(file));
  }

  /**
   * Parse Java class information from the provided data
   *
   * @param data Raw data to parse class info from
   * @return Parsed and validated class info
   */
  static fromData(data: Buffer): JavaClassFile {
    return new JavaClassFile(readClassfileData(data));
  }
}
