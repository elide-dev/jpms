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

import { expect, test } from "@jest/globals"
import { join, resolve } from "node:path"
import { existsSync } from "node:fs"
import { POM_CONTENT_PARENT } from "./maven-samples"
import { MavenProjectPackaging } from "../model"
import parser, { parseAsync, ParsedOutput } from "../parser"

test('parse basic pom content (callback)', async () => {
  // sanity: should have non-null string to parse
  expect(POM_CONTENT_PARENT).not.toBeNull();

  // parse it
  const parsed: Promise<ParsedOutput> = new Promise((accept, reject) => {
    parser({xmlContent: POM_CONTENT_PARENT}, (err: Error | null, result: ParsedOutput | null | undefined) => {
      // callback with parsed value
      if (err !== null) reject(err)
      else accept(result as ParsedOutput)
    })
  })
  const result: ParsedOutput = await parsed

  expect(result).not.toBeNull()
  expect(result.pomXml).toBeDefined()
  expect(result.pomObject).toBeDefined()
  expect(result.pomObject.project).toBeDefined()
  const project = result.pomObject.project
  expect(project.xmlns).toBe('http://maven.apache.org/POM/4.0.0')
  expect(project['xmlns:xsi']).toBe('http://www.w3.org/2001/XMLSchema-instance')
  expect(project['xsi:schemaLocation']).toBe('http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd')
  expect(project.parent).toBeDefined()
  const parent = project.parent

  const projectAssertions = (thing: any) => {
    expect(thing.artifactid).toBeDefined()
    expect(thing.groupid).toBeDefined()
    expect(thing.version).toBeDefined()
    expect(thing.artifactid).not.toBe('')
    expect(thing.groupid).not.toBe('')
    expect(thing.version).not.toBe('')
  }
  projectAssertions(project)
  projectAssertions(parent)

  expect(project.modelversion._).toBe('4.0.0')
  expect(project.packaging).toBe(MavenProjectPackaging.POM)
  expect(project.name).toBe('Some Example Library')
})

test('parse basic pom content (async)', async () => {
  // sanity: should have non-null string to parse
  expect(POM_CONTENT_PARENT).not.toBeNull();

  // parse it
  const result = await parseAsync({xmlContent: POM_CONTENT_PARENT})
  expect(result).not.toBeNull()
  expect(result.pomXml).toBeDefined()
  expect(result.pomObject).toBeDefined()
  expect(result.pomObject.project).toBeDefined()
  const project = result.pomObject.project
  expect(project.xmlns).toBe('http://maven.apache.org/POM/4.0.0')
  expect(project['xmlns:xsi']).toBe('http://www.w3.org/2001/XMLSchema-instance')
  expect(project['xsi:schemaLocation']).toBe('http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd')
  expect(project.parent).toBeDefined()
  const parent = project.parent

  const projectAssertions = (thing: any) => {
    expect(thing.artifactid).toBeDefined()
    expect(thing.groupid).toBeDefined()
    expect(thing.version).toBeDefined()
    expect(thing.artifactid).not.toBe('')
    expect(thing.groupid).not.toBe('')
    expect(thing.version).not.toBe('')
  }
  projectAssertions(project)
  projectAssertions(parent)

  expect(project.modelversion._).toBe('4.0.0')
  expect(project.packaging).toBe(MavenProjectPackaging.POM)
  expect(project.name).toBe('Some Example Library')
})

test('parse guava\'s pom file (callback)', async () => {
  const path = resolve(join(__dirname, 'guava.xml'))
  expect(existsSync(path)).toBeTruthy()
  const parsed = new Promise((accept, reject) => {
    parser({filePath: path}, (err: Error | null, result: ParsedOutput | null | undefined) => {
      // callback with parsed value
      if (err !== null) reject(err)
      else accept(result)
    })
  })
  const result = await parsed
  expect(result).toBeDefined()
})

test('parse guava\'s pom file (async)', async () => {
  const path = resolve(join(__dirname, 'guava.xml'))
  expect(existsSync(path)).toBeTruthy()
  const result = await parseAsync({filePath: path})
  expect(result).toBeDefined()
})

test('must provide content or a file to parse (callback)', () => {
  let caught = false
  try {
    parser({}, () => {})
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})

test('must provide content or a file to parse (async)', async () => {
  let caught = false
  try {
    await parseAsync({})
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})
  
test('must provide options to parser (callback)', () => {
  let caught = false
  try {
    parser(null, () => {})
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})

test('must provide options to parser (async)', async () => {
  let caught = false
  try {
    await parseAsync(null)
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})

test('requested pom file must exist (callback)', async () => {
  let caught = false
  try {
    await parseAsync({filePath: 'i/do/not/exist.pom'})
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})

test('requested pom file must exist (async)', async () => {
  let caught = false
  try {
    await (new Promise((accept, reject) => {
      parser({filePath: 'i/do/not/exist.pom'}, (err: Error | null, result: ParsedOutput | null | undefined) => {
        // callback with parsed value
        if (err !== null) reject(err)
        else accept(result)
      })
    }))
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})

test('requested pom file must not be empty (callback)', async () => {
  const path = resolve(join(__dirname, 'empty.xml'))
  let caught = false
  try {
    await parseAsync({filePath: path})
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})

test('requested pom file must not be empty (async)', async () => {
  const path = resolve(join(__dirname, 'empty.xml'))
  let caught = false
  try {
    await (new Promise((accept, reject) => {
      parser({filePath: path}, (err: Error | null, result: ParsedOutput | null | undefined) => {
        // callback with parsed value
        if (err !== null) reject(err)
        else accept(result)
      })
    }))
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})

test('requested pom file must be valid xml (callback)', async () => {
  const path = resolve(join(__dirname, 'not-valid-xml.xml'))
  let caught = false
  try {
    await parseAsync({filePath: path})
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})

test('requested pom file must be valid xml (async)', async () => {
  const path = resolve(join(__dirname, 'not-valid-xml.xml'))
  let caught = false
  try {
    await (new Promise((accept, reject) => {
      parser({filePath: path}, (err: Error | null, result: ParsedOutput | null | undefined) => {
        // callback with parsed value
        if (err !== null) reject(err)
        else accept(result)
      })
    }))
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})

test('requested pom content must be valid xml (callback)', async () => {
  let caught = false
  try {
    await parseAsync({xmlContent: '{}'})
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})

test('requested pom content must be valid xml (async)', async () => {
  let caught = false
  try {
    await (new Promise((accept, reject) => {
      parser({xmlContent: '{}'}, (err: Error | null, result: ParsedOutput | null | undefined) => {
        // callback with parsed value
        if (err !== null) reject(err)
        else accept(result)
      })
    }))
  } catch (err) {
    caught = true
  }
  expect(caught).toBeTruthy()
})
