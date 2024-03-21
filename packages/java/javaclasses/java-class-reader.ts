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

/*!
 * https://github.com/leonardosnt/java-class-tools
 *
 * Copyright (C) 2017 leonardosnt
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

import ByteBuffer from "bytebuffer";
import { ConstantType } from "./constant-type";
import { AttributeInfo, MemberInfo, TypeInfo } from "./java-class-types";

/**
 * Magic value used to identify class files.
 */
export const MAGIC = 0xCAFEBABE

/**
 * Parsed Class File
 */
export class ClassFile {
  readonly minor_version: number;
  readonly major_version: number;
  readonly constant_pool_count: number;
  readonly constant_pool: any[];
  readonly access_flags: number;
  readonly this_class: number;
  readonly super_class: number;
  readonly interfaces_count: number;
  readonly interfaces: any[];
  readonly fields_count: number;
  readonly fields: any[];
  readonly methods_count: number;
  readonly methods: any[];
  readonly attributes_count: number;
  readonly attributes: any[];

  // nothing yet
  private constructor(buf: ByteBuffer) {
    if (buf.readUint32() !== MAGIC) throw Error("Invalid MAGIC value");

    this.minor_version = buf.readUint16();
    this.major_version = buf.readUint16();
    this.constant_pool_count = buf.readUint16();
    this.constant_pool = ClassFile._readConstantPool(buf, this.constant_pool_count - 1);
    this.access_flags = buf.readUint16();
    this.this_class = buf.readUint16();
    this.super_class = buf.readUint16();
    this.interfaces_count = buf.readUint16();
    this.interfaces = ClassFile._readInterfaces(buf, this.interfaces_count);
    this.fields_count = buf.readUint16();
    this.fields = ClassFile._readMemberInfoArray(buf, this.fields_count, this.constant_pool);
    this.methods_count = buf.readUint16();
    this.methods = ClassFile._readMemberInfoArray(buf, this.methods_count, this.constant_pool);
    this.attributes_count = buf.readUint16();
    this.attributes = ClassFile._readAttributeInfoArray(buf, this.attributes_count, this.constant_pool);
  }

  /**
   * Parse data representing a compiler Java class
   *
   * @param buf Byte buffer of data to parse the class from
   * @returns Parsed class information
   */
  static fromData(buf: ByteBuffer): ClassFile {
    return new ClassFile(buf);
  }

  /**
   * Read an array of field_info or method_info structures.
   *
   * https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.6
   * https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.5
   */
  static _readMemberInfoArray(buf: ByteBuffer, count: number, constantPool: any[]) {
    const members = new Array(count);
    for (let i = 0; i < count; i++) {
      const memberInfo: Partial<MemberInfo> = {
        access_flags: buf.readUint16(),
        name_index: buf.readUint16(),
        descriptor_index: buf.readUint16(),
        attributes_count: buf.readUint16(),
      };
      memberInfo.attributes = this._readAttributeInfoArray(
        buf,
        memberInfo.attributes_count as number,
        constantPool,
      );
      members[i] = memberInfo;
    }
    return members;
  }

  static _readAttributeInfoArray(buf: ByteBuffer, attributes_count: number, constantPool: any[]) {
    const attributes = new Array(attributes_count);
    for (let i = 0; i < attributes_count; i++) {
      attributes[i] = this._readAttributeInfo(buf, constantPool);
    }
    return attributes;
  }

  /**
   * Reads the "verification_type_info" structure.
   * https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.7.4
   */
  static _readVerificationTypeInfo(buf: ByteBuffer) {
    const type_info: Partial<TypeInfo> = {
      tag: buf.readUint8(),
    };
    if (type_info.tag === 7) {
      type_info.cpool_index = buf.readUint16();
    } else if (type_info.tag === 8) {
      type_info.offset = buf.readUint16();
    }
    return type_info;
  }

  /**
   * Reads the "type_annotation" structure
   * https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.7.20
   */
  static _readTypeAnnotation(buf: ByteBuffer) {
    const type_annotation: any = {
      target_type: buf.readUint8(),
      target_info: {},
    };

    // Reads the "target_info" union.
    // https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.7.20-400
    switch (type_annotation.target_type) {
      // type_parameter_target
      case 0x00:
      case 0x01:
        type_annotation.target_info.type_parameter_index = buf.readUint8();
        break;

      // supertype_target
      case 0x10:
        type_annotation.target_info.supertype_index = buf.readUint16();
        break;

      // type_parameter_bound_target
      case 0x11:
      case 0x12:
        type_annotation.target_info.type_parameter_index = buf.readUint8();
        type_annotation.target_info.bound_index = buf.readUint8();
        break;

      // empty_target
      case 0x13:
      case 0x14:
      case 0x15:
        // empty
        break;

      // formal_parameter_target
      case 0x16:
        type_annotation.target_info.formal_parameter_index = buf.readUint8();
        break;

      // throws_target
      case 0x17:
        type_annotation.target_info.throws_type_index = buf.readUint16();
        break;

      // localvar_target
      case 0x40:
      case 0x41: {
        type_annotation.target_info.table_length = buf.readUint16();
        type_annotation.target_info.table = new Array(type_annotation.target_info.table_length);

        for (let i = 0; i < type_annotation.target_info.table_length; i++) {
          const table_entry = {
            start_pc: buf.readUint16(),
            length: buf.readUint16(),
            index: buf.readUint16(),
          };
          type_annotation.target_info.table[i] = table_entry;
        }
        break;
      }

      // catch_target
      case 0x42:
        type_annotation.target_info.exception_table_index = buf.readUint16();
        break;

      // offset_target
      case 0x43:
      case 0x44:
      case 0x45:
      case 0x46:
        type_annotation.target_info.offset = buf.readUint16();
        break;

      // type_argument_target
      case 0x47:
      case 0x48:
      case 0x49:
      case 0x4a:
      case 0x4b:
        type_annotation.target_info.offset = buf.readUint16();
        type_annotation.target_info.type_argument_index = buf.readUint8();
        break;

      default:
        throw Error(`Unexpected target_type: ${type_annotation.target_type}`);
    }

    // Reads "type_path" structure
    type_annotation.type_path = { path_length: buf.readUint8() };
    type_annotation.type_path.path = new Array(type_annotation.type_path.path_length);

    for (let i = 0; i < type_annotation.type_path.path_length; i++) {
      type_annotation.type_path.path[i] = {
        type_path_kind: buf.readUint8(),
        type_argument_index: buf.readUint8(),
      };
    }

    type_annotation.type_index = buf.readUint16();
    type_annotation.num_element_value_pairs = buf.readUint16();
    type_annotation.element_value_pairs = new Array(type_annotation.num_element_value_pairs);

    for (let i = 0; i < type_annotation.num_element_value_pairs; i++) {
      type_annotation.element_value_pairs[i] = {
        element_name_index: buf.readUint16(),
        element_value: this._readElementValue(buf),
      };
    }
    return type_annotation;
  }

  /**
   * Reads the "attribute_info" structure
   * https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.7
   */
  static _readAttributeInfo(buf: ByteBuffer, constantPool: any[]) {
    const attribute: AttributeInfo = {
      attribute_name_index: buf.readUint16(),
      attribute_length: buf.readUint32(),
    };

    const attributeNameBytes = constantPool[attribute.attribute_name_index].bytes;
    const attributeName = String.fromCharCode.apply(null, attributeNameBytes);

    switch (attributeName) {
      case "Deprecated":
      case "Synthetic":
        break;

      case "RuntimeInvisibleAnnotations":
      case "RuntimeVisibleAnnotations": {
        attribute.num_annotations = buf.readUint16();
        attribute.annotations = new Array(attribute.num_annotations);

        for (let i = 0; i < attribute.num_annotations; i++) {
          attribute.annotations[i] = this._readAttributeAnnotation(buf);
        }
        break;
      }

      case "InnerClasses": {
        attribute.number_of_classes = buf.readUint16();
        attribute.classes = new Array(attribute.number_of_classes);

        for (let i = 0; i < attribute.number_of_classes; i++) {
          attribute.classes[i] = {
            inner_class_info_index: buf.readUint16(),
            outer_class_info_index: buf.readUint16(),
            inner_name_index: buf.readUint16(),
            inner_class_access_flags: buf.readUint16(),
          };
        }
        break;
      }

      case "LocalVariableTable": {
        attribute.local_variable_table_length = buf.readUint16();
        attribute.local_variable_table = new Array(attribute.local_variable_table_length);

        for (let i = 0; i < attribute.local_variable_table_length; i++) {
          attribute.local_variable_table[i] = {
            start_pc: buf.readUint16(),
            length: buf.readUint16(),
            name_index: buf.readUint16(),
            descriptor_index: buf.readUint16(),
            index: buf.readUint16(),
          };
        }
        break;
      }

      case "LocalVariableTypeTable": {
        attribute.local_variable_type_table_length = buf.readUint16();
        attribute.local_variable_type_table = new Array(attribute.local_variable_type_table_length);

        for (let i = 0; i < attribute.local_variable_type_table_length; i++) {
          attribute.local_variable_type_table[i] = {
            start_pc: buf.readUint16(),
            length: buf.readUint16(),
            name_index: buf.readUint16(),
            signature_index: buf.readUint16(),
            index: buf.readUint16(),
          };
        }
        break;
      }

      case "RuntimeInvisibleParameterAnnotations":
      case "RuntimeVisibleParameterAnnotations": {
        attribute.num_parameters = buf.readUint8();
        attribute.parameter_annotations = new Array(attribute.num_parameters);
        for (let parameterIndex = 0; parameterIndex < attribute.num_parameters; parameterIndex++) {
          const parameter_annotation: any = { num_annotations: buf.readUint16() };
          parameter_annotation.annotations = new Array(parameter_annotation.num_annotations);

          for (let annotationIndex = 0; annotationIndex < parameter_annotation.num_annotations; annotationIndex++) {
            parameter_annotation.annotations[annotationIndex] = this._readAttributeAnnotation(buf);
          }

          attribute.parameter_annotations[parameterIndex] = parameter_annotation;
        }
        break;
      }

      case "BootstrapMethods": {
        attribute.num_bootstrap_methods = buf.readUint16();
        attribute.bootstrap_methods = new Array(attribute.num_bootstrap_methods);

        for (
          let bootstrapMethodIndex = 0;
          bootstrapMethodIndex < attribute.num_bootstrap_methods;
          bootstrapMethodIndex++
        ) {
          const bootstrap_method: any = {
            bootstrap_method_ref: buf.readUint16(),
            num_bootstrap_arguments: buf.readUint16(),
          };
          bootstrap_method.bootstrap_arguments = new Array(bootstrap_method.num_bootstrap_arguments);

          for (
            let bootstrapArgumentIndex = 0;
            bootstrapArgumentIndex < bootstrap_method.num_bootstrap_arguments;
            bootstrapArgumentIndex++
          ) {
            bootstrap_method.bootstrap_arguments[bootstrapArgumentIndex] = buf.readUint16();
          }
          attribute.bootstrap_methods[bootstrapMethodIndex] = bootstrap_method;
        }
        break;
      }

      case "RuntimeInvisibleTypeAnnotations":
      case "RuntimeVisibleTypeAnnotations": {
        attribute.num_annotations = buf.readUint16();
        attribute.annotations = new Array(attribute.num_annotations);

        for (let i = 0; i < attribute.num_annotations; i++) {
          attribute.annotations[i] = this._readTypeAnnotation(buf);
        }
        break;
      }

      case "SourceDebugExtension": {
        attribute.debug_extension = new Array(attribute.attribute_length);

        for (let i = 0; i < attribute.attribute_length; i++) {
          attribute.debug_extension[i] = buf.readUint8();
        }
        break;
      }

      case "SourceFile":
        attribute.sourcefile_index = buf.readUint16();
        break;

      case "EnclosingMethod":
        attribute.class_index = buf.readUint16();
        attribute.method_index = buf.readUint16();
        break;

      case "AnnotationDefault":
        attribute.default_value = this._readElementValue(buf);
        break;

      case "MethodParameters": {
        attribute.parameters_count = buf.readUint8();
        attribute.parameters = new Array(attribute.parameters_count);

        for (let i = 0; i < attribute.parameters_count; i++) {
          attribute.parameters[i] = {
            name_index: buf.readUint16(),
            access_flags: buf.readUint16(),
          };
        }
        break;
      }

      case "ConstantValue":
        attribute.constantvalue_index = buf.readUint16();
        break;

      case "Signature":
        attribute.signature_index = buf.readUint16();
        break;

      case "StackMap":
        /* c8 ignore next */
        throw new Error("StackMap attribute is not supported")
      case "Exceptions":
        return this._readExceptionsAttribute(buf, attribute);
      case "StackMapTable":
        return this._readStackMapTableAttribute(buf, attribute);
      case "Code":
        return this._readCodeAttribute(buf, attribute, constantPool);
      case "LineNumberTable":
        return this._readLineNumberTableAttribute(buf, attribute);
      case "Module":
        return this._readModuleAttribute(buf, attribute);
      case "ModulePackages":
        return this._readModulePackagesAttribute(buf, attribute);

      case "ModuleMainClass":
        attribute.main_class_index = buf.readUint16();
        break;

      case "NestHost":
        attribute.host_class_index = buf.readUint16();
        break;

      case "NestMembers":
        attribute.number_of_classes = buf.readUint16();
        attribute.classes = new Array(attribute.number_of_classes);
        for (let i = 0; i < attribute.number_of_classes; i++) {
          attribute.classes[i] = buf.readUint16();
        }
        break;

      // Unknown attributes
      // See: https://docs.oracle.com/javase/specs/jvms/se9/html/jvms-4.html#jvms-4.7.1
      default: {
        attribute.info = new Array(attribute.attribute_length);
        for (let i = 0; i < attribute.attribute_length; i++) {
          attribute.info[i] = buf.readUint8();
        }
      }
    }
    return attribute;
  }

  static _readCodeAttribute(buf: ByteBuffer, attribute, constantPool: any[]) {
    attribute.max_stack = buf.readUint16();
    attribute.max_locals = buf.readUint16();
    attribute.code_length = buf.readUint32();
    attribute.code = new Array(attribute.code_length);

    // Reads "code" array
    for (let i = 0; i < attribute.code_length; i++) {
      attribute.code[i] = buf.readUint8();
    }

    attribute.exception_table_length = buf.readUint16();
    attribute.exception_table = new Array(attribute.exception_table_length);

    // Reads exception_table
    for (let i = 0; i < attribute.exception_table_length; i++) {
      attribute.exception_table[i] = {
        start_pc: buf.readUint16(),
        end_pc: buf.readUint16(),
        handler_pc: buf.readUint16(),
        catch_type: buf.readUint16(),
      };
    }
    attribute.attributes_count = buf.readUint16();
    attribute.attributes = this._readAttributeInfoArray(buf, attribute.attributes_count, constantPool);
    return attribute;
  }

  static _readLineNumberTableAttribute(buf: ByteBuffer, attribute) {
    attribute.line_number_table_length = buf.readUint16();
    attribute.line_number_table = new Array(attribute.line_number_table_length);

    for (let i = 0; i < attribute.line_number_table_length; i++) {
      attribute.line_number_table[i] = {
        start_pc: buf.readUint16(),
        line_number: buf.readUint16(),
      };
    }
    return attribute;
  }

  // TODO: this function is being deoptimized one time... Check why
  static _readStackMapTableAttribute(buf: ByteBuffer, attribute) {
    attribute.number_of_entries = buf.readUint16();
    attribute.entries = new Array(attribute.number_of_entries);

    for (let entryIndex = 0; entryIndex < attribute.number_of_entries; entryIndex++) {
      const stack_map_frame: any = {
        frame_type: buf.readUint8(),
      };

      // Shorthand
      const frame_type = stack_map_frame.frame_type;

      /**
       * offset_delta's that are "constant" are omitted.
       * E.g:
       *  The offset_delta for the "same_frame" is the value of the tag item (frame_type).
       *  The offset_delta for the "same_locals_1_stack_item_frame " is given by the formula frame_type - 64.
       *
       * See https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.7.4
       * for more information.
       */

      // SAME
      if (frame_type >= 0 && frame_type <= 63) {
        attribute.entries[entryIndex] = stack_map_frame;
        continue;
      }

      // SAME_LOCALS_1_STACK_ITEM
      if (frame_type >= 64 && frame_type <= 127) {
        stack_map_frame.stack = [this._readVerificationTypeInfo(buf)];
      }
      // SAME_LOCALS_1_STACK_ITEM_EXTENDED
      else if (stack_map_frame.frame_type === 247) {
        stack_map_frame.offset_delta = buf.readUint16();
        stack_map_frame.stack = [this._readVerificationTypeInfo(buf)];
      }
      // CHOP = 248-250, SAME_FRAME_EXTENDED = 251
      else if (frame_type >= 248 && frame_type <= 251) {
        stack_map_frame.offset_delta = buf.readUint16();
      }
      // APPEND
      else if (frame_type >= 252 && frame_type <= 254) {
        const numberOfLocals = frame_type - 251;

        stack_map_frame.offset_delta = buf.readUint16();
        stack_map_frame.locals = new Array(numberOfLocals);

        for (let i = 0; i < numberOfLocals; i++) {
          stack_map_frame.locals[i] = this._readVerificationTypeInfo(buf);
        }
      }
      // FULL_FRAME
      else if (frame_type === 255) {
        stack_map_frame.offset_delta = buf.readUint16();
        stack_map_frame.number_of_locals = buf.readUint16();
        stack_map_frame.locals = new Array(stack_map_frame.number_of_locals);

        for (let i = 0; i < stack_map_frame.number_of_locals; i++) {
          stack_map_frame.locals[i] = this._readVerificationTypeInfo(buf);
        }

        stack_map_frame.number_of_stack_items = buf.readUint16();
        stack_map_frame.stack = new Array(stack_map_frame.number_of_stack_items);
        for (let i = 0; i < stack_map_frame.number_of_stack_items; i++) {
          stack_map_frame.stack[i] = this._readVerificationTypeInfo(buf);
        }
      }
      attribute.entries[entryIndex] = stack_map_frame;
    }
    return attribute;
  }

  static _readExceptionsAttribute(buf: ByteBuffer, attribute) {
    attribute.number_of_exceptions = buf.readUint16();
    attribute.exception_index_table = new Array(attribute.number_of_exceptions);
    for (let i = 0; i < attribute.number_of_exceptions; i++) {
      attribute.exception_index_table[i] = buf.readUint16();
    }
    return attribute;
  }

  static _readModuleAttribute(buf: ByteBuffer, attribute) {
    attribute.module_name_index = buf.readUint16();
    attribute.module_flags = buf.readUint16();
    attribute.module_version_index = buf.readUint16();
    attribute.requires_count = buf.readUint16();
    attribute.requires = new Array(attribute.requires_count);

    for (let i = 0; i < attribute.requires_count; i++) {
      attribute.requires[i] = {
        requires_index: buf.readUint16(),
        requires_flags: buf.readUint16(),
        requires_version_index: buf.readUint16(),
      };
    }

    attribute.exports_count = buf.readUint16();
    attribute.exports = new Array(attribute.exports_count);

    for (let exportIndex = 0; exportIndex < attribute.exports_count; exportIndex++) {
      const exportEntry: any = {
        exports_index: buf.readUint16(),
        exports_flags: buf.readUint16(),
        exports_to_count: buf.readUint16(),
      };
      exportEntry.exports_to_index = new Array(exportEntry.exports_to_count);

      for (let exportsToIndex = 0; exportsToIndex < exportEntry.exports_to_count; exportsToIndex++) {
        exportEntry.exports_to_index[exportsToIndex] = buf.readUint16();
      }

      attribute.exports[exportIndex] = exportEntry;
    }

    attribute.opens_count = buf.readUint16();
    attribute.opens = new Array(attribute.opens_count);

    for (let openIndex = 0; openIndex < attribute.opens_count; openIndex++) {
      const openEntry: any = {
        opens_index: buf.readUint16(),
        opens_flags: buf.readUint16(),
        opens_to_count: buf.readUint16(),
      };
      openEntry.opens_to_index = new Array(openEntry.opens_to_count);

      for (let opensToIndex = 0; opensToIndex < openEntry.opens_to_count; opensToIndex++) {
        openEntry.opens_to_index[opensToIndex] = buf.readUint16();
      }
      attribute.opens[openIndex] = openEntry;
    }

    attribute.uses_count = buf.readUint16();
    attribute.uses_index = new Array(attribute.uses_count);

    for (let i = 0; i < attribute.uses_count; i++) {
      attribute.uses_index[i] = buf.readUint16();
    }

    attribute.provides_count = buf.readUint16();
    attribute.provides = new Array(attribute.provides_count);

    for (let providesIndex = 0; providesIndex < attribute.provides_count; providesIndex++) {
      const provideEntry: any = {
        provides_index: buf.readUint16(),
        provides_with_count: buf.readUint16(),
      };
      provideEntry.provides_with_index = new Array(provideEntry.provides_with_count);

      for (let providesWithIndex = 0; providesWithIndex < provideEntry.provides_with_count; providesWithIndex++) {
        provideEntry.provides_with_index[providesWithIndex] = buf.readUint16();
      }

      attribute.provides[providesIndex] = provideEntry;
    }
    return attribute;
  }

  static _readModulePackagesAttribute(buf: ByteBuffer, attribute) {
    attribute.package_count = buf.readUint16();
    attribute.package_index = new Array(attribute.package_count);
    for (let i = 0; i < attribute.package_count; i++) {
      attribute.package_index[i] = buf.readUint16();
    }
    return attribute;
  }

  /**
   * Reads the "annotation" structure
   * https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.7.16
   */
  static _readAttributeAnnotation(buf: ByteBuffer) {
    const annotation: any = {
      type_index: buf.readUint16(),
      num_element_value_pairs: buf.readUint16(),
    };
    annotation.element_value_pairs = new Array(annotation.num_element_value_pairs);

    for (let i = 0; i < annotation.num_element_value_pairs; i++) {
      annotation.element_value_pairs[i] = {
        element_name_index: buf.readUint16(),
        element_value: this._readElementValue(buf),
      };
    }
    return annotation;
  }

  /**
   * Reads the "element_value" structure
   * https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.7.16.1
   */
  static _readElementValue(buf: ByteBuffer) {
    const element_value: any = {
      tag: buf.readUint8(),
      value: {},
    };

    /**
     *  https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.7.16.1-130
     */
    switch (element_value.tag) {
      case 101: // e
        element_value.value.enum_const_value = {
          type_name_index: buf.readUint16(),
          const_name_index: buf.readUint16(),
        };
        break;

      case 99: // c
        element_value.value.class_info_index = buf.readUint16();
        break;

      case 91: {
        // [
        const num_values = buf.readUint16();
        const values = new Array(num_values);

        for (let i = 0; i < num_values; i++) {
          values[i] = this._readElementValue(buf);
        }

        element_value.value.array_value = {
          num_values,
          values,
        };
        break;
      }

      case 64: // @
        element_value.value.annotation = this._readAttributeAnnotation(buf);
        break;

      case 66: // B
      case 67: // C
      case 68: // D
      case 70: // F
      case 73: // I
      case 74: // J
      case 83: // S
      case 90: // Z
      case 115: // s
        element_value.value.const_value_index = buf.readUint16();
        break;

      default:
        throw Error(`Unexpected tag: ${element_value.tag}`);
    }

    return element_value;
  }

  static _readInterfaces(buf: ByteBuffer, interfaceCount: number) {
    const interfaces = new Array(interfaceCount);
    for (let i = 0; i < interfaceCount; i++) {
      interfaces[i] = buf.readUint16();
    }
    return interfaces;
  }

  /**
   * https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.4
   */
  static _readConstantPool(buf: ByteBuffer, poolCount: number) {
    /**
     * https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.1
     * The constant_pool table is indexed from 1 to constant_pool_count-1.
     */
    const pool = new Array(poolCount);
    for (let i = 1; i <= poolCount; i++) {
      const entry = this._readConstantPoolEntry(buf);
      pool[i] = entry;

      /**
       * https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.4.5
       *
       * All 8-byte constants take up two entries in the constant_pool table of the class file.
       * If a CONSTANT_Long_info or CONSTANT_Double_info structure is the item in the constant_pool table at index n,
       * then the next usable item in the pool is located at index n+2.
       * The constant_pool index n+1 must be valid but is considered unusable.
       */
      if (entry.tag === ConstantType.LONG || entry.tag === ConstantType.DOUBLE) {
        pool[++i] = undefined;
      }
    }
    return pool;
  }

  static _readUtf8PoolEntry(buf: ByteBuffer, tag: number) {
    const length = buf.readUint16();
    const bytes = new Array(length);

    for (let i = 0; i < length; i++) {
      bytes[i] = buf.readUint8();
    }

    return { tag, length, bytes };
  }

  static _readConstantPoolEntry(buf: ByteBuffer) {
    const tag = buf.readUint8();

    switch (tag) {
      case ConstantType.UTF8:
        return this._readUtf8PoolEntry(buf, tag);

      case ConstantType.INTEGER:
      case ConstantType.FLOAT:
        return { tag, bytes: buf.readUint32() };

      case ConstantType.LONG:
      case ConstantType.DOUBLE:
        return { tag, high_bytes: buf.readUint32(), low_bytes: buf.readUint32() };

      case ConstantType.PACKAGE:
      case ConstantType.MODULE:
      case ConstantType.CLASS:
        return { tag, name_index: buf.readUint16() };

      case ConstantType.STRING:
        return { tag, string_index: buf.readUint16() };

      /**
       * Fields, methods, and interface methods are represented by similar structures
       * https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.4.2
       */
      case ConstantType.FIELDREF:
      case ConstantType.METHODREF:
      case ConstantType.INTERFACE_METHODREF:
        return { tag, class_index: buf.readUint16(), name_and_type_index: buf.readUint16() };

      case ConstantType.NAME_AND_TYPE:
        return { tag, name_index: buf.readUint16(), descriptor_index: buf.readUint16() };

      case ConstantType.METHOD_HANDLE:
        return { tag, reference_kind: buf.readUint8(), reference_index: buf.readUint16() };

      case ConstantType.METHOD_TYPE:
        return { tag, descriptor_index: buf.readUint16() };

      case ConstantType.DYNAMIC:
      case ConstantType.INVOKE_DYNAMIC:
        return { tag, bootstrap_method_attr_index: buf.readUint16(), name_and_type_index: buf.readUint16() };

      default:
        throw Error(`Unexpected tag: ${tag}`);
    }
  }
}

/**
 * All objects (structure) follow Jvm8 specification.
 *
 * @see https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html
 */
export class JavaClassFileReader {
  /**
   * Read and parse class file contents.
   *
   * @param {(Uint8Array|Buffer|ArrayBuffer)} source - Class file contents.
   * @return {ClassFile}
   * @see {@link https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.1}
   */
  static readData(source: Uint8Array | Buffer | ArrayBuffer): ClassFile {
    return ClassFile.fromData(ByteBuffer.wrap(source));
  }
}

export default JavaClassFileReader;
