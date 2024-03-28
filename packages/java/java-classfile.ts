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

import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'

import { TextDecoder } from 'util'
import { JavaClassFileReader, ClassFile } from './javaclasses/java-class-reader'
import {
  JavaModuleExport,
  JavaModuleInfo,
  JavaModuleProvides,
  JavaModuleRequires,
  JavaModuleUses,
  JvmTarget,
  jvmTargetForLevel
} from './java-model'

import Modifier from './javaclasses/modifier'
import { AttributeName } from './javaclasses/attribute'
import { ModuleFlags, RequiresFlags } from './javamodules/module-flags'

import { AttributeInfoBase, ClassInfo, ConstantInfo, ModuleInfoAttributes } from './javaclasses/java-class-types'

// Raw underlying class data.
type RawClassData = ClassFile

// Read class data from a file, then parse it.
async function readClassfile(path: string): Promise<RawClassData> {
  // need to do this to avoid a static import for environments like cloudflare workers
  const { existsSync } = require('fs')
  const classfilePath = resolve(path)
  if (!existsSync(classfilePath)) throw new Error(`Class file does not exist: ${classfilePath}`)
  return readClassfileData(await readFile(classfilePath))
}

// Parse the provided classfile data.
function readClassfileData(data: Buffer): RawClassData {
  const classFile = JavaClassFileReader.readData(data)
  // @ts-ignore
  const textDecoder = new TextDecoder()
  return classFile
}

// Decode the raw bytes of a constant-pool value into a string.
function decodeConstantToString(constant: ConstantInfo): string {
  return String.fromCharCode.apply(null, constant.bytes)
}

// Decode the internal class name form (`some/class/Name`) into a package-qualified class name (`some.class.Name`).
function internalClassNameToClassName(name: string): string {
  return name.replace(/\//g, '.')
}

// Determine whether a flag is set in a masked flag value.
function flag(value: number, flag: number): boolean {
  return (value & flag) !== 0
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
    return this._classdata
  }

  /**
   * Parse Java class information from the provided file
   *
   * @param file File to parse class info from
   * @return Parsed and validated class info
   */
  static async fromFile(file: string): Promise<JavaClassFile> {
    return new JavaClassFile(await readClassfile(file))
  }

  /**
   * Parse Java class information from the provided data
   *
   * @param data Raw data to parse class info from
   * @return Parsed and validated class info
   */
  static fromData(data: Buffer): JavaClassFile {
    return new JavaClassFile(readClassfileData(data))
  }

  // Decode a constant from the constant pool.
  private constantString(index: number): string {
    const constant = this._classdata.constant_pool[index]
    if (!constant) throw new Error(`Required constant not found in pool at index ${index}`)
    return decodeConstantToString(constant)
  }

  // Decode a constant from the constant pool, without failing if it is not found.
  private optionalConstantString(index?: number): string | null {
    if (!index || index === 0) return null
    return this.constantString(index)
  }

  // Find a class by matching against the attribute name.
  private classAttribute<X extends AttributeInfoBase>(name: string): X | undefined {
    return this._classdata.attributes.find(attr => {
      return name === this.constantString(attr.attribute_name_index)
    })
  }

  // Decode a module attribute block.
  private decodeModuleBlock(
    block: any[],
    nameAttr: string,
    flagsAttr?: string
  ): {
    [key: string]: any
    name: string
    flags: number
  }[] {
    return block.map(info => {
      return {
        name: this.decodeModuleNameAt(info[nameAttr]),
        flags: flagsAttr ? info[flagsAttr] : 0
      }
    })
  }

  // Decode a module attribute block.
  private decodeModuleBlockWithQualifier(
    block: any[],
    nameAttr: string,
    qualifierAttr: string,
    flagsAttr?: string
  ): {
    [key: string]: any
    name: string
    flags: number
    qualifiers: string[]
  }[] {
    return block.map(info => {
      const qualifierIndexes: number[] = info[qualifierAttr]
      const qualifiers: string[] = qualifierIndexes.map(index => {
        return this.decodeModuleNameAt(index)
      })

      return {
        name: this.decodeModuleNameAt(info[nameAttr]),
        flags: flagsAttr ? info[flagsAttr] : 0,
        qualifiers
      }
    })
  }

  // Decode an indirected module name at the specified constant pool index.
  private decodeModuleNameAt(index: number): string {
    const moduleInfo: ClassInfo = this._classdata.constant_pool[index]
    if (!moduleInfo) throw new Error(`Required stanza not found in constant pool at index ${index}`)
    const { name_index: nameIndex } = moduleInfo
    return this.constantString(nameIndex)
  }

  // Decode raw module attributes into a structured module info record.
  private decodeModuleInfo(attr: ModuleInfoAttributes): JavaModuleInfo {
    const {
      module_name_index,
      module_flags,
      module_version_index,
      requires: requiresStatements,
      exports: exportStatements,
      opens: opensStatements,
      uses_index: usesStatements,
      provides: providesStatements
    } = attr

    // top-level module info
    const name = this.decodeModuleNameAt(module_name_index)
    const version = this.optionalConstantString(module_version_index) || undefined
    const flags = {
      open: flag(module_flags, ModuleFlags.OPEN)
    }

    // `requires`
    const requires: JavaModuleRequires[] = this.decodeModuleBlock(
      requiresStatements,
      'requires_index',
      'requires_flags'
    ).map(requires => {
      return {
        module: requires.name,
        static: flag(requires.flags, RequiresFlags.STATIC),
        transitive: flag(requires.flags, RequiresFlags.TRANSITIVE)
      }
    })

    // `exports`
    const exports: JavaModuleExport[] = this.decodeModuleBlockWithQualifier(
      exportStatements,
      'exports_index',
      'exports_to_index',
      'exports_flags'
    ).map(exports => {
      return {
        package: exports.name,
        to: exports.qualifiers.length > 0 ? exports.qualifiers : []
      }
    })

    // `opens`
    const opens: JavaModuleExport[] = this.decodeModuleBlockWithQualifier(
      opensStatements,
      'opens_index',
      'opens_to_index',
      'opens_flags'
    ).map(exports => {
      return {
        package: exports.name,
        to: exports.qualifiers.length > 0 ? exports.qualifiers : []
      }
    })

    // `uses`
    const uses: JavaModuleUses[] = usesStatements.map(usesIndex => {
      return {
        service: internalClassNameToClassName(this.decodeModuleNameAt(usesIndex))
      }
    })

    // `provides`
    const provides: JavaModuleProvides[] = this.decodeModuleBlockWithQualifier(
      providesStatements,
      'provides_index',
      'provides_with_index'
    ).map(provides => {
      return {
        service: internalClassNameToClassName(provides.name),
        with: provides.qualifiers.map(className => internalClassNameToClassName(className))
      }
    })

    return {
      name,
      version,
      requires,
      exports,
      opens,
      uses,
      provides,
      flags
    }
  }

  /**
   * Determine the bytecode level for this class file
   *
   * @return JVM target version for this class file
   */
  bytecodeTarget(): JvmTarget {
    return jvmTargetForLevel(this._classdata.major_version)
  }

  /**
   * Determine the package-qualified class name for this class file
   *
   * @return Package-qualified class name
   */
  qualifiedName(): string {
    // https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.4.1
    const classInfo: ClassInfo = this._classdata.constant_pool[this._classdata.this_class]
    const { name_index: nameIndex } = classInfo
    const className = this.constantString(classInfo.name_index)
    if (!className) throw new Error(`Required class name not found in constant pool at declared index ${nameIndex}`)
    return internalClassNameToClassName(className)
  }

  /**
   * Determine the simple, unqualified class name for this class file
   *
   * @return Simple class name
   */
  simpleName(): string {
    const simple = this.qualifiedName().split('.').at(-1)
    if (!simple) throw new Error(`Failed to determine simple class name from qualified name: ${this.qualifiedName()}`)
    return simple
  }

  /**
   * Determine the package name declared for this class file
   *
   * @return Package name
   */
  packageName(): string {
    const qualified = this.qualifiedName()
    const parts = qualified.split('.')
    parts.pop()
    return parts.join('.')
  }

  /**
   * Determine whether this class-file represents a Java module
   *
   * @return Whether this class is a compiled module definition
   */
  isModule(): boolean {
    return flag(this._classdata.access_flags, Modifier.MODULE)
  }

  /**
   * Obtain information about this class as a Java module
   *
   * If this class does not represent a compiled module definition, an error is thrown. Please consult `isModule`
   * before calling this method.
   *
   * @return Compiled module info
   */
  moduleInfo(): JavaModuleInfo {
    const attr = this.classAttribute<ModuleInfoAttributes>(AttributeName.MODULE)
    if (!attr) throw new Error('This class is not a module')
    return this.decodeModuleInfo(attr)
  }
}
