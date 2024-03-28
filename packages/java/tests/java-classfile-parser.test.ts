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

import assert from 'node:assert'
import fs from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import ByteBuffer from 'bytebuffer'
import CPUtil from '../javaclasses/constant-pool'
import { describe, expect, it } from '@jest/globals'
import { InstructionParser } from '../javaclasses/instruction-parser'
import Modifier from '../javaclasses/modifier'
import { ClassFile } from '../javaclasses/java-class-reader'
import { ConstantType } from '../javaclasses/constant-type'
import { compileJava } from './testutil'
import { JavaToolchain } from '../java-home'
import { JavaClassFile } from '../java-classfile'

const TMP_DIR_PREFIX = '/tmp/java-classfile-parser-test-'

describe('instruction parser', () => {
  it('fromBytecode() === toBytecode()', async () => {
    const code = `
    public class Foo {
  
      public void foo() {
        int val = 23;
  
        switch (val) {
          case 22:
            break;
          case 21:
            break;
          default:
            break;
        }
  
        int val2 = Integer.MAX_VALUE;
  
        switch (val2) {
          case Integer.MAX_VALUE:
            break;
          case Integer.MIN_VALUE:
            break;
        }
  
        String x = "asdasdsad";
  
        switch (x) {
          case "asdasdsad": return;
          case "asdasdasd": break;
        }
      }
  
    }
  `

    const classFile = await compileAndRead('Foo', code)
    const method0 = classFile.methods[0]

    const codeAttr = getAttribute(method0, 'Code', classFile)
    const originalBytecode = codeAttr.code

    const parsedInstructions = InstructionParser.fromBytecode(originalBytecode)
    const rewrittenBytecode = InstructionParser.toBytecode(parsedInstructions)
    parsedInstructions.forEach(inst => {
      expect(inst.toString()).toBeDefined()
    })

    assert.deepEqual(originalBytecode, rewrittenBytecode)
  })
})

describe('ReadMethodsTest_0', () => {
  const code = `
  public class ReadMethodsTest_0 {

    @Deprecated
    static int x = 1;

    public ReadMethodsTest_0() throws java.io.IOException {
      // Used to test verification_type_info
      int i = 25;
      double j = 76;
      ReadMethodsTest_0 xx = null;

      System.out.println("Hello World");
      System.out.println(xx + " " + i + " " + j);
      try {
        System.out.println();
      } catch (Exception ex) {
        ex.printStackTrace();
      }

      try {
        System.out.println();
      } catch (Exception ex) {
        ex.printStackTrace();
      }
    }

    public int add(int a, int b) {
      return a + b;
    }

  }
`

  describe('the "SourceFile" attribute', () => {
    it('should exist', async () => {
      const classFile = await compileAndRead('ReadMethodsTest_0', code, {
        javac_flags: '-parameters'
      })
      const srcFileAttr = classFile.attributes.filter(attr => {
        const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
        return attrName === 'SourceFile'
      })[0]
      assert.notEqual(srcFileAttr, undefined)
    })

    it('should be equal to "ReadMethodsTest_0.java"', async () => {
      const classFile = await compileAndRead('ReadMethodsTest_0', code, {
        javac_flags: '-parameters'
      })
      const srcFileAttr = classFile.attributes.filter(attr => {
        const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
        return attrName === 'SourceFile'
      })[0]
      assert.equal(CPUtil.getString(classFile, srcFileAttr.sourcefile_index), 'ReadMethodsTest_0.java')
    })
  })

  describe('the constructor', () => {
    it('name should be equal to "<init>"', async () => {
      const classFile = await compileAndRead('ReadMethodsTest_0', code, {
        javac_flags: '-parameters'
      })
      const method = classFile.methods[0]

      const name = CPUtil.getString(classFile, method.name_index)
      assert.equal(name, '<init>')
    })

    it('descriptor should be equal to "()V"', async () => {
      const classFile = await compileAndRead('ReadMethodsTest_0', code, {
        javac_flags: '-parameters'
      })
      const method = classFile.methods[0]

      const descriptor = CPUtil.getString(classFile, method.descriptor_index)
      assert.equal(descriptor, '()V')
    })

    describe('the Code attribute', () => {
      it('should exist', async () => {
        const classFile = await compileAndRead('ReadMethodsTest_0', code, {
          javac_flags: '-parameters'
        })
        const method = classFile.methods[0]
        const codeAttr = getAttribute(method, 'Code', classFile)
        assert.notEqual(codeAttr, undefined)
      })

      it('the exception_table_length should be equal to 2', async () => {
        const classFile = await compileAndRead('ReadMethodsTest_0', code, {
          javac_flags: '-parameters'
        })
        const method = classFile.methods[0]
        const codeAttr = getAttribute(method, 'Code', classFile)
        const table_len = codeAttr.exception_table_length
        assert.equal(table_len, 2)
        assert.equal(codeAttr.exception_table.length, table_len)
      })
    })
  })

  describe('the "add" method', () => {
    it('name should be equal to "add"', async () => {
      const classFile = await compileAndRead('ReadMethodsTest_0', code, {
        javac_flags: '-parameters'
      })
      const method = classFile.methods[1]
      const name = CPUtil.getString(classFile, method.name_index)
      assert.equal(name, 'add')
    })

    it('descriptor should be equal to "(II)I"', async () => {
      const classFile = await compileAndRead('ReadMethodsTest_0', code, {
        javac_flags: '-parameters'
      })
      const method = classFile.methods[1]
      const descriptor = CPUtil.getString(classFile, method.descriptor_index)
      assert.equal(descriptor, '(II)I')
    })

    describe('the Code attribute', () => {
      it('should exist', async () => {
        const classFile = await compileAndRead('ReadMethodsTest_0', code, {
          javac_flags: '-parameters'
        })
        const method = classFile.methods[1]
        const codeAttr = getAttribute(method, 'Code', classFile)
        assert.notEqual(codeAttr, undefined)
      })

      it('the bytecode should be equals to [iload_1, iload_2, iadd, ireturn]', async () => {
        const classFile = await compileAndRead('ReadMethodsTest_0', code, {
          javac_flags: '-parameters'
        })
        const method = classFile.methods[1]
        const codeAttr = getAttribute(method, 'Code', classFile)
        assert.deepEqual(codeAttr.code, [
          0x1b, // iload_1
          0x1c, // iload_2
          0x60, // iadd
          0xac // ireturn
        ])
      })
    })

    describe('the "MethodParameters" attribute', () => {
      it('should exist', async () => {
        const classFile = await compileAndRead('ReadMethodsTest_0', code, {
          javac_flags: '-parameters'
        })
        const method = classFile.methods[1]
        const mpAttr = method.attributes.filter(attr => {
          const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
          return attrName === 'MethodParameters'
        })[0]
        assert.notEqual(mpAttr, undefined)
      })

      it('parameters_count should be equal to 2', async () => {
        const classFile = await compileAndRead('ReadMethodsTest_0', code, {
          javac_flags: '-parameters'
        })
        const method = classFile.methods[1]
        const mpAttr = method.attributes.filter(attr => {
          const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
          return attrName === 'MethodParameters'
        })[0]
        assert.equal(mpAttr.parameters_count, 2)
      })

      it('parameters names should be equal to [a, b]', async () => {
        const classFile = await compileAndRead('ReadMethodsTest_0', code, {
          javac_flags: '-parameters'
        })
        const method = classFile.methods[1]
        const mpAttr = method.attributes.filter(attr => {
          const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
          return attrName === 'MethodParameters'
        })[0]
        const params = mpAttr.parameters
        assert.equal(CPUtil.getString(classFile, params[0].name_index), 'a')
        assert.equal(CPUtil.getString(classFile, params[1].name_index), 'b')
      })
    })
  })
})

describe('ReadMethodsTest_1', () => {
  const code = `
  import java.lang.annotation.*;
  import java.util.*;

  public class ReadMethodsTest_1 {

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE_PARAMETER)
    public @interface TypeAnnotation_1 {
      int value() default 0;
    }

    <@TypeAnnotation_1 T> T generic() {
      return null;
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.TYPE_PARAMETER, ElementType.TYPE_USE, ElementType.TYPE })
    public @interface A { }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.TYPE_PARAMETER, ElementType.TYPE_USE, ElementType.TYPE })
    public @interface B { }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.TYPE_PARAMETER, ElementType.TYPE_USE, ElementType.TYPE })
    public @interface C { }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.TYPE_PARAMETER, ElementType.TYPE_USE, ElementType.TYPE })
    public @interface D { }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.TYPE_PARAMETER, ElementType.TYPE_USE, ElementType.TYPE })
    public @interface E { }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.TYPE_PARAMETER, ElementType.TYPE_USE, ElementType.TYPE })
    public @interface F { }

    void generic2(@A List<@B Comparable<@F Object @C [] @D [] @E []>> list) {
    }

  }
`

  describe('#generic()', () => {
    describe('attribute: RuntimeVisibleTypeAnnotations', () => {
      it('!== undefined', async () => {
        const classFile = await compileAndRead('ReadMethodsTest_1', code, {
          javac_flags: '-parameters'
        })
        const method = classFile.methods[1]
        const rvtAttr = method.attributes.filter(attr => {
          const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
          return attrName === 'RuntimeVisibleTypeAnnotations'
        })[0]

        assert.notEqual(rvtAttr, undefined)
      })

      it('.num_annotations should be equal to 1', async () => {
        const classFile = await compileAndRead('ReadMethodsTest_1', code, {
          javac_flags: '-parameters'
        })
        const method = classFile.methods[1]
        const rvtAttr = method.attributes.filter(attr => {
          const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
          return attrName === 'RuntimeVisibleTypeAnnotations'
        })[0]

        assert.equal(rvtAttr.num_annotations, 1)
        assert.equal(rvtAttr.annotations.length, 1)
      })

      it('.annotations[0] type should be equals to "TypeAnnotation_1"', async () => {
        const classFile = await compileAndRead('ReadMethodsTest_1', code, {
          javac_flags: '-parameters'
        })
        const method = classFile.methods[1]
        const rvtAttr = method.attributes.filter(attr => {
          const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
          return attrName === 'RuntimeVisibleTypeAnnotations'
        })[0]

        const type = CPUtil.getString(classFile, rvtAttr.annotations[0].type_index)
        assert.equal(type, 'LReadMethodsTest_1$TypeAnnotation_1;')
      })
    })
  })

  /**
   * https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.7.20.2
   * See Table 4.7.20.2-D.
   */
  describe('#generic2()', () => {
    describe('attribute: RuntimeVisibleTypeAnnotations', () => {
      it('should exist', async () => {
        const classFile = await compileAndRead('ReadMethodsTest_1', code, {
          javac_flags: '-parameters'
        })
        const method = classFile.methods[2]
        const rvtAttr = method.attributes.filter(attr => {
          const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
          return attrName === 'RuntimeVisibleTypeAnnotations'
        })[0]

        assert.notEqual(rvtAttr, undefined)
      })

      it('property: num_annotations should be equal to 6', async () => {
        const classFile = await compileAndRead('ReadMethodsTest_1', code, {
          javac_flags: '-parameters'
        })
        const method = classFile.methods[2]
        const rvtAttr = method.attributes.filter(attr => {
          const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
          return attrName === 'RuntimeVisibleTypeAnnotations'
        })[0]

        assert.equal(rvtAttr.num_annotations, 6)
        assert.equal(rvtAttr.annotations.length, 6)
      })

      /**
       * Get annotation by type from 'rvtAttr.annotations'
       */
      function getAnnotationByType(classFile, rvtAttr, type) {
        return rvtAttr.annotations.filter(ann => {
          const annType = CPUtil.getString(classFile, ann.type_index)
          return annType === type
        })[0]
      }

      describe('the @A annotation', () => {
        it('should exist', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$A;')

          assert.notEqual(annotation, undefined)
        })

        it('type_path.path_length should be equal to 0', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$A;')

          assert.equal(annotation.type_path.path_length, 0)
        })

        it('type_path.path should be equal to []', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$A;')

          assert.deepEqual(annotation.type_path.path, [])
        })
      })

      describe('the @B annotation', () => {
        it('should exist', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$B;')

          assert.notEqual(annotation, undefined)
        })

        it('type_path.path_length should be equal to 1', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$B;')

          assert.equal(annotation.type_path.path_length, 1)
        })

        it('type_path.path should be equal to [{type_path_kind: 3, type_argument_index: 0}]', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$B;')

          assert.deepEqual(annotation.type_path.path, [{ type_path_kind: 3, type_argument_index: 0 }])
        })
      })

      describe('the @C annotation', () => {
        it('should exist', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$C;')

          assert.notEqual(annotation, undefined)
        })

        it('type_path.path_length should be equal to 2', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$C;')

          assert.equal(annotation.type_path.path_length, 2)
        })

        it('type_path.path should be equal to ', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$C;')

          assert.deepEqual(annotation.type_path.path, [
            { type_path_kind: 3, type_argument_index: 0 },
            { type_path_kind: 3, type_argument_index: 0 }
          ])
        })
      })

      describe('the @D annotation', () => {
        it('should exist', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$D;')

          assert.notEqual(annotation, undefined)
        })

        it('type_path.path_length should be equal to 3', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$D;')

          assert.equal(annotation.type_path.path_length, 3)
        })

        it('type_path.path should be equal to [{type_path_kind: 3, type_argument_index: 0}, {type_path_kind: 3, type_argument_index: 0}]', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$D;')

          assert.deepEqual(annotation.type_path.path, [
            { type_path_kind: 3, type_argument_index: 0 },
            { type_path_kind: 3, type_argument_index: 0 },
            { type_path_kind: 0, type_argument_index: 0 }
          ])
        })
      })

      describe('the @E annotation', () => {
        it('should exist', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$E;')
          assert.notEqual(annotation, undefined)
        })

        it('type_path.path_length should be equal to 4', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$E;')
          assert.equal(annotation.type_path.path_length, 4)
        })

        it('type_path.path should be equal to [{type_path_kind: 3, type_argument_index: 0}, {type_path_kind: 3, type_argument_index: 0}, {type_path_kind: 0, type_argument_index: 0}, {type_path_kind: 0, type_argument_index: 0}]', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$E;')
          assert.deepEqual(annotation.type_path.path, [
            { type_path_kind: 3, type_argument_index: 0 },
            { type_path_kind: 3, type_argument_index: 0 },
            { type_path_kind: 0, type_argument_index: 0 },
            { type_path_kind: 0, type_argument_index: 0 }
          ])
        })
      })

      describe('the @F annotation', () => {
        it('should exist', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$F;')

          assert.notEqual(annotation, undefined)
        })

        it('type_path.path_length should be equal to 5', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$F;')

          assert.equal(annotation.type_path.path_length, 5)
        })

        it('type_path.path should be equal to [{type_path_kind: 3, type_argument_index: 0}, {type_path_kind: 3, type_argument_index: 0}, {type_path_kind: 0, type_argument_index: 0}, {type_path_kind: 0, type_argument_index: 0}, {type_path_kind: 0, type_argument_index: 0}]', async () => {
          const classFile = await compileAndRead('ReadMethodsTest_1', code, {
            javac_flags: '-parameters'
          })
          const method = classFile.methods[2]
          const rvtAttr = method.attributes.filter(attr => {
            const attrName = CPUtil.getString(classFile, attr.attribute_name_index)
            return attrName === 'RuntimeVisibleTypeAnnotations'
          })[0]
          const annotation = getAnnotationByType(classFile, rvtAttr, 'LReadMethodsTest_1$F;')

          assert.deepEqual(annotation.type_path.path, [
            { type_path_kind: 3, type_argument_index: 0 },
            { type_path_kind: 3, type_argument_index: 0 },
            { type_path_kind: 0, type_argument_index: 0 },
            { type_path_kind: 0, type_argument_index: 0 },
            { type_path_kind: 0, type_argument_index: 0 }
          ])
        })
      })
    })
  })
})

describe('test fields', () => {
  const code = `
import java.lang.annotation.*;

public class ReadFieldTest_0 {

  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.FIELD)
  @interface Bar {
    boolean _boolean();
    String _string();
    int _integer();
    double _double();
    String[] _strArray();
    Nested _nested();
  }

  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.ANNOTATION_TYPE)
  @interface Nested {
    String value();
  }

  @Deprecated
  @Bar(
    _boolean = true,
    _string = "quux",
    _integer = 4444,
    _double = 4433.22,
    _strArray = { "foo", "bar" },
    _nested = @Nested("string")
  )
  protected static int someValue = 333333;
}
  `

  describe('fields[0]', () => {
    it('should be "protected" and "static"', async () => {
      let classFile = await compileAndRead('ReadFieldTest_0', code)
      let field = classFile.fields[0]
      assert((field.access_flags & Modifier.PROTECTED) === Modifier.PROTECTED)
      assert((field.access_flags & Modifier.STATIC) === Modifier.STATIC)
    })

    it('should have "Deprecated" attribute.', async () => {
      let classFile = await compileAndRead('ReadFieldTest_0', code)
      let field = classFile.fields[0]
      field.attributes.some(attr => {
        return CPUtil.getString(classFile, attr.attribute_name_index) === 'Deprecated'
      })
    })

    it('the name should be equals to "someValue"', async () => {
      let classFile = await compileAndRead('ReadFieldTest_0', code)
      let field = classFile.fields[0]
      assert.equal(CPUtil.getString(classFile, field.name_index), 'someValue')
    })

    it('the descriptor should be equals to "I"', async () => {
      let classFile = await compileAndRead('ReadFieldTest_0', code)
      let field = classFile.fields[0]
      assert.equal(CPUtil.getString(classFile, field.descriptor_index), 'I')
    })
  })
})

describe('class Foo', () => {
  it('should be public', async () => {
    const classFile = await compileAndRead('Foo', `public class Foo {}`)
    assert(classFile.access_flags & Modifier.PUBLIC)
  })

  it('constant_pool should not be empty', async () => {
    const classFile = await compileAndRead('Foo', `public class Foo {}`)
    assert(classFile.constant_pool_count > 0)
  })
})

describe('_readConstantEntry()', () => {
  describe('ConstantType.INTEGER', () => {
    function testInteger(input: number) {
      let buf = new ByteBuffer(5)

      buf.writeUint8(ConstantType.INTEGER)
      buf.writeUint32(input)
      buf.flip()
      let cp_info = ClassFile._readConstantPoolEntry(buf)
      assert.equal(cp_info.tag, ConstantType.INTEGER)
      // @ts-expect-error
      cp_info.bytes |= 0 // cast to signed
      assert.equal(cp_info.bytes, input)
    }
    let integerTests = [2147483647, -2147483648, -333, 0, 150]

    integerTests.forEach(function (int) {
      it(`With args: (${int})`, () => {
        testInteger(int)
      })
    })
  })

  describe('ConstantType.FLOAT', () => {
    function testFloat(input: number, expected: number, writeInt?: boolean) {
      if (expected === undefined) expected = input
      let buf = new ByteBuffer(5)

      buf.writeUint8(ConstantType.FLOAT)
      if (writeInt) {
        buf.writeInt32(input)
      } else {
        buf.writeFloat32(input)
      }
      buf.flip()
      let cp_info = ClassFile._readConstantPoolEntry(buf)
      let floatValue = CPUtil.u32ToFloat(cp_info.bytes as any)
      assert.equal(cp_info.tag, ConstantType.FLOAT)
      assert(compareFloatBits(floatValue, expected), floatValue + ' != ' + expected)
    }
    let floatTestInputs = [
      [55.8734],
      [5124124125.939838383],
      [0x7f800000, Number.POSITIVE_INFINITY, true],
      [0xff800000, Number.NEGATIVE_INFINITY, true],
      [0x7f800001, Number.NaN, true],
      [0x7f800001 + 100, Number.NaN, true],
      [0x7fffffff, Number.NaN, true],
      [0xffffffff, Number.NaN, true]
    ]

    floatTestInputs.forEach(function (args) {
      it(`With args: (${args})`, function () {
        // @ts-expect-error
        testFloat.apply(null, args)
      })
    })
  })

  describe('ConstantType.LONG', () => {
    function testLong(hig, low) {
      let buf = new ByteBuffer(5)
      buf.writeUint8(ConstantType.LONG)
      buf.writeUint32(hig)
      buf.writeUint32(low)
      buf.flip()
      let cp_info = ClassFile._readConstantPoolEntry(buf)
      assert.equal(cp_info.tag, ConstantType.LONG)
      // @ts-expect-error
      assert.equal(cp_info.high_bytes, hig)
      // @ts-expect-error
      assert.equal(cp_info.low_bytes, low)
    }
    let longTests = [[0x7fffffff, 0xffffffff]]

    longTests.forEach(function (args) {
      it(`With args: (${args})`, () => {
        // @ts-expect-error
        testLong.apply(null, args)
      })
    })
  })
})

function compareFloatBits(f1, f2) {
  let buf1 = ByteBuffer.allocate(4),
    buf2 = ByteBuffer.allocate(4)
  buf1.writeFloat(f1).flip()
  buf2.writeFloat(f2).flip()
  return buf1.buffer.equals(buf2.buffer)
}

type CompileAndReadOptions = {
  javac_flags?: string
  printReadTime?: boolean
  printJavap?: boolean
}

const compileCache = {}

function compileCacheKey(fileName: string, code: string, options?: Partial<CompileAndReadOptions>): string {
  const preimage = `${fileName}:${code}:${JSON.stringify(options || {})}`
  return createHash('sha1').update(preimage).digest('hex')
}

async function compileAndRead(
  fileName: string,
  code: string,
  options?: Partial<CompileAndReadOptions>
): Promise<ClassFile> {
  if (typeof fileName !== 'string' || !fileName) throw 'Invalid fileName'
  if (typeof code !== 'string' || !code) throw 'Invalid code'

  const opts = options || {}
  if (!opts.javac_flags) opts.javac_flags = ''
  if (!opts.printReadTime) opts.printReadTime = false
  if (!opts.printJavap) opts.printJavap = false

  // don't recompile things
  const cacheKey = compileCacheKey(fileName, code, opts)
  const cached = compileCache[cacheKey]
  if (cached) return cached

  // grab a temp root to write the source
  const tmpRoot = fs.mkdtempSync(TMP_DIR_PREFIX)
  const filename = fileName.endsWith('.java') ? fileName : `${fileName}.java`
  const tmpSrc = join(tmpRoot, filename)
  fs.writeFileSync(tmpSrc, code, { encoding: 'utf8' })

  // compile the code
  const args = !!opts.javac_flags ? opts.javac_flags.split(' ') : []
  const result = await compileJava([tmpSrc], {
    args,
    preserveArgPaths: true
  })
  expect(result).toBeDefined()
  expect(result.result.run.exitCode).toBe(0)

  // grab the class output
  const out = result.classes.find(f => f.endsWith(`${fileName}.class`))
  if (!out) {
    throw new Error(`Failed to locate expected class in output: ${fileName}.class`)
  }

  if (opts.printJavap) {
    const javap = JavaToolchain.current().tool('javap')
    javap.cwd(result.buildroot)
    console.log(' ======= JAVAP ======= ')
    console.log((await javap.run(['-v', out])).result.stdout.toString())
    console.log(' ======= JAVAP ======= ')
  }

  const classfileResult = (await JavaClassFile.fromFile(out)).raw()
  compileCache[cacheKey] = classfileResult
  return classfileResult
}

function getAttribute(source: any, attrName: string, classFile: ClassFile) {
  return source.attributes.filter(attr => {
    return attrName === CPUtil.getString(classFile, attr.attribute_name_index)
  })[0]
}
