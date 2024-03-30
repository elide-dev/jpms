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

import { describe, expect, test } from '@jest/globals'
import { globSync } from 'glob'
import { existsSync } from 'node:fs'
import { repoJar, repoPath, repoJarByPath } from './testutil'
import { manifestPath } from '../java-manifest'

import JarFile, {
  JarBuilder,
  JarCompression,
  JarEntryType,
  ZipFileMetadata,
  JarPredicate,
  jarMatcher,
  jarClass,
  jarResource,
  jarService
} from '../java-jar'

async function inflateGuavaJar(): Promise<JarFile> {
  const { relative, resolved } = repoJar('com.google.guava', 'guava', '33.0.0-jre-jpms')
  expect(relative).toBeDefined()
  expect(resolved).toBeDefined()
  expect(relative).toBe('com/google/guava/guava/33.0.0-jre-jpms/guava-33.0.0-jre-jpms.jar')
  expect(resolved.endsWith('com/google/guava/guava/33.0.0-jre-jpms/guava-33.0.0-jre-jpms.jar')).toBeTruthy()
  return await JarFile.fromFile(resolved)
}

const rootRepoPath = repoPath('.')

const allJars = globSync(`${rootRepoPath}/**/*.jar`)
const guavaJar = inflateGuavaJar()

const jarEntryTypes = [
  JarEntryType.MANIFEST,
  JarEntryType.MODULE,
  JarEntryType.CLASS,
  JarEntryType.RESOURCE,
  JarEntryType.SERVICE
]

const samplesByType = {
  [`${JarEntryType.MANIFEST}`]: ['META-INF/MANIFEST.MF', 'META-INF/versions/9/MANIFEST.MF'],
  [`${JarEntryType.MODULE}`]: ['module-info.class', 'META-INF/versions/9/module-info.class'],
  [`${JarEntryType.CLASS}`]: [
    'com/google/common/hash/Hasher.class',
    'module-info.class',
    'META-INF/versions/9/com/google/common/hash/Hasher.class'
  ],
  [`${JarEntryType.SERVICE}`]: [
    'META-INF/services/com.google.common.hash.HashFunction',
    'META-INF/services/com.google.common.hash.Hasher'
  ],
  [`${JarEntryType.RESOURCE}`]: [
    'META-INF/LICENSE.txt',
    'META-INF/NOTICE.txt',
    'META-INF/some/other/thingy.png',
    'some/other/thingy.json'
  ]
}

function matchPredicateTest(
  predicate: JarPredicate,
  subject: string,
  expected: boolean,
  props?: Partial<ZipFileMetadata>
) {
  expect(
    predicate({
      name: subject,
      compression: JarCompression.IDENTITY,
      ...(props || {})
    })
  ).toBe(expected)
}

function shouldMatch(predicate: JarPredicate, path: string, props?: Partial<ZipFileMetadata>) {
  matchPredicateTest(predicate, path, true, props)
}

function shouldMatchNone(predicate: JarPredicate, ...cases: JarEntryType[]) {
  cases.forEach(type => {
    samplesByType[type].forEach(path => {
      shouldNotMatch(predicate, path)
    })
  })
}

function jarPathToFilename(path: string): string {
  const relative = path.slice(rootRepoPath.length + 1)
  const parts = relative.split('/')
  return parts.at(-1) as string
}

function shouldNotMatch(predicate: JarPredicate, path: string, props?: Partial<ZipFileMetadata>) {
  matchPredicateTest(predicate, path, false, props)
}

function shouldMatchAll(predicate: JarPredicate, ...cases: JarEntryType[]) {
  cases.forEach(type => {
    samplesByType[type].forEach(path => {
      shouldMatch(predicate, path)
    })
  })
}

describe('jar', () => {
  test('symbols should be defined', () => {
    ;[JarFile, jarMatcher].forEach(value => {
      expect(value).toBeDefined()
    })
  })

  test('should be able to construct an empty jar builder', () => {
    expect(JarFile.builder()).toBeDefined()
    expect(JarFile.builder()).toBeInstanceOf(JarBuilder)
  })

  test('should be able to inflate a valid jar', async () => {
    expect(await guavaJar).toBeDefined()
  })

  test('should be able to interrogate an inflated jar file', async () => {
    const inflated = await guavaJar
    expect(inflated.mainClass).toBe(null)
    expect(inflated.automaticModuleName).toBe(null)
    expect(inflated.multiRelease).toBe(true)
    expect(inflated.classAtName('com.google.common.hash.Hasher')).toBeDefined()
  })

  describe('repository jars', () => {
    allJars.forEach(absolute => {
      // if (absolute != '') return  // STUBBED

      const relativePath = absolute.slice(rootRepoPath.length + 1)
      describe(jarPathToFilename(absolute), () => {
        test('jar exists', () => {
          expect(relativePath).toBeDefined()
          expect(absolute.endsWith(relativePath)).toBeTruthy()
          expect(existsSync(absolute)).toBe(true)
        })
        test('jar can be read', async () => {
          const { relative, resolved } = repoJarByPath(relativePath)
          expect(relative).toBeDefined()
          expect(resolved).toBeDefined()
          const jarFile = await JarFile.fromFile(resolved)
          expect(jarFile).toBeDefined()
        })
      })
    })
  })

  describe('entry factories', () => {
    test('should be able to create a class entry', () => {
      const entry = jarClass('com.google.hello.Hello', Buffer.from(''))
      expect(entry).toBeDefined()
      expect(entry.qualifiedName).toBe('com.google.hello.Hello')
      expect(entry.simpleName).toBe('Hello')
      expect(entry.classfile).toBeDefined()
      expect(entry.classfile).toBeInstanceOf(Function)
    })

    test('should be able to create a resource entry', () => {
      const entry = jarResource('META-INF/LICENSE.txt', Buffer.from('x'))
      expect(entry).toBeDefined()
      expect(entry.path).toBe('META-INF/LICENSE.txt')
      expect(entry.size).toBe(1)
      expect(entry.compression).toBe(JarCompression.IDENTITY)
    })

    test('should be able to create a service entry', async () => {
      const entry = jarService('com.google.hello.Hello', 'com.google.hello.HelloImpl')
      expect(entry).toBeDefined()
      expect(entry.service).toBe('com.google.hello.Hello')
      expect(entry.impls).toHaveLength(1)
      expect(entry.impls[0]).toBe('com.google.hello.HelloImpl')
      const producer = await entry.data()
      expect(producer).toBeDefined()
      expect(producer.name).toBe('META-INF/services/com.google.hello.Hello')
      const data = await producer.read()
      expect(data).toBeDefined()
      expect(data.toString('utf8')).toBe('com.google.hello.HelloImpl')
    })
  })

  describe('predicate matchers', () => {
    test('should be able to match nothing with `none()`', () => {
      jarEntryTypes.forEach(type => {
        shouldMatchNone(jarMatcher.none(), type)
      })
    })

    test('should be able to match everything with `all()`', () => {
      jarEntryTypes.forEach(type => {
        shouldMatchAll(jarMatcher.all(), type)
      })
    })

    // -- predicate: classes

    test('should be able to match classes with `classes()`', () => {
      shouldMatchAll(jarMatcher.classes(), JarEntryType.CLASS)
    })

    test('classes should match modules', () => {
      shouldMatchAll(jarMatcher.classes(), JarEntryType.MODULE)
    })

    test('classes should not match manifests', () => {
      shouldMatchNone(jarMatcher.classes(), JarEntryType.MANIFEST)
    })

    test('classes should not match services', () => {
      shouldMatchNone(jarMatcher.classes(), JarEntryType.SERVICE)
    })

    test('classes should not match resources', () => {
      shouldMatchNone(jarMatcher.classes(), JarEntryType.RESOURCE)
    })

    // -- predicate: services

    test('should be able to match services with `services()`', () => {
      shouldMatchAll(jarMatcher.services(), JarEntryType.SERVICE)
    })

    test('services should not match modules', () => {
      shouldMatchNone(jarMatcher.services(), JarEntryType.MODULE)
    })

    test('services should not match manifests', () => {
      shouldMatchNone(jarMatcher.services(), JarEntryType.MANIFEST)
    })

    test('services should not match classes', () => {
      shouldMatchNone(jarMatcher.services(), JarEntryType.CLASS)
    })

    test('services should not match resources', () => {
      shouldMatchNone(jarMatcher.services(), JarEntryType.RESOURCE)
    })

    // -- predicate: resources

    test('should be able to match resources with `resources()`', () => {
      shouldMatchAll(jarMatcher.resources(), JarEntryType.RESOURCE)
    })

    test('resources should match manifests', () => {
      shouldMatchAll(jarMatcher.resources(), JarEntryType.MANIFEST)
    })

    test('resources should match services', () => {
      shouldMatchAll(jarMatcher.resources(), JarEntryType.SERVICE)
    })

    test('resources should not match modules', () => {
      shouldMatchNone(jarMatcher.resources(), JarEntryType.MODULE)
    })

    test('resources should not match classes', () => {
      shouldMatchNone(jarMatcher.resources(), JarEntryType.CLASS)
    })

    // -- predicate: root manifest

    test('should be able to match manifest with `manifest()`', () => {
      shouldMatch(jarMatcher.manifest(), manifestPath)
    })

    test('manifest should not match resources', () => {
      shouldMatchNone(jarMatcher.manifest(), JarEntryType.RESOURCE)
    })

    test('manifest should not match services', () => {
      shouldMatchNone(jarMatcher.manifest(), JarEntryType.SERVICE)
    })

    test('manifest should not match modules', () => {
      shouldMatchNone(jarMatcher.manifest(), JarEntryType.MODULE)
    })

    test('manifest should not match classes', () => {
      shouldMatchNone(jarMatcher.manifest(), JarEntryType.CLASS)
    })

    test('manifest should not match non-main manifests', () => {
      shouldNotMatch(jarMatcher.manifest(), 'META-INF/versions/9/MANIFEST.MF')
    })

    // -- predicate: all manifests

    test('should be able to match all manifests with `allManifests()`', () => {
      shouldMatchAll(jarMatcher.allManifests(), JarEntryType.MANIFEST)
    })

    test('manifests should not match resources', () => {
      shouldMatchNone(jarMatcher.allManifests(), JarEntryType.RESOURCE)
    })

    test('manifests should not match services', () => {
      shouldMatchNone(jarMatcher.allManifests(), JarEntryType.SERVICE)
    })

    test('manifests should not match modules', () => {
      shouldMatchNone(jarMatcher.allManifests(), JarEntryType.MODULE)
    })

    test('manifests should not match classes', () => {
      shouldMatchNone(jarMatcher.allManifests(), JarEntryType.CLASS)
    })

    // -- predicate: module-info

    test('should be able to match module-info with `moduleInfo()`', () => {
      shouldMatch(jarMatcher.moduleInfo(), 'module-info.class')
    })

    test('module should not match versioned modules', () => {
      shouldNotMatch(jarMatcher.moduleInfo(), 'META-INF/versions/9/module-info.class')
    })

    test('module should not match manifests', () => {
      shouldMatchNone(jarMatcher.moduleInfo(), JarEntryType.MANIFEST)
    })

    test('module should not match services', () => {
      shouldMatchNone(jarMatcher.moduleInfo(), JarEntryType.SERVICE)
    })

    test('module should not match resources', () => {
      shouldMatchNone(jarMatcher.moduleInfo(), JarEntryType.RESOURCE)
    })

    test('module should not match classes', () => {
      shouldNotMatch(jarMatcher.moduleInfo(), 'com/google/common/hash/Hasher.class')
      shouldNotMatch(jarMatcher.moduleInfo(), 'META-INF/versions/9/com/google/common/hash/Hasher.class')
    })

    // -- predicate: all module-infos

    test('should be able to match all module-infos with `allModuleInfos()`', () => {
      shouldMatchAll(jarMatcher.allModuleInfos(), JarEntryType.MODULE)
    })

    test('modules should not match manifests', () => {
      shouldMatchNone(jarMatcher.allModuleInfos(), JarEntryType.MANIFEST)
    })

    test('modules should not match services', () => {
      shouldMatchNone(jarMatcher.allModuleInfos(), JarEntryType.SERVICE)
    })

    test('modules should not match resources', () => {
      shouldMatchNone(jarMatcher.allModuleInfos(), JarEntryType.RESOURCE)
    })

    test('modules should not match classes', () => {
      shouldNotMatch(jarMatcher.allModuleInfos(), 'com/google/common/hash/Hasher.class')
      shouldNotMatch(jarMatcher.allModuleInfos(), 'META-INF/versions/9/com/google/common/hash/Hasher.class')
    })
  })
})
