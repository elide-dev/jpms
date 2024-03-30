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
import JarManifest, { JarManifestBuilder, JarManifestKey } from '../java-manifest'

describe('jar manifests', () => {
  test('should be constructable in empty form', () => {
    expect(JarManifest.builder()).toBeDefined()
    expect(JarManifest.builder()).toBeInstanceOf(JarManifestBuilder)
  })

  test('should be constructable from scratch', () => {
    const builder = JarManifest.builder()
    builder.add(JarManifestKey.MAIN_CLASS, 'com.example.Main')
    builder.add(JarManifestKey.IMPLEMENTATION_TITLE, 'Example')
    const manifest = builder.build()
    expect(manifest).toBeDefined()
    expect(manifest).toBeInstanceOf(JarManifest)
    expect(manifest.get(JarManifestKey.MAIN_CLASS)).toEqual('com.example.Main')
  })

  test('should be serializable into a string jar manifest', () => {
    const builder = JarManifest.builder()
    builder.add(JarManifestKey.MAIN_CLASS, 'com.example.Main')
    builder.add(JarManifestKey.IMPLEMENTATION_TITLE, 'Example')
    const manifest = builder.build()
    expect(manifest).toBeDefined()
    expect(manifest).toBeInstanceOf(JarManifest)
    expect(manifest.get(JarManifestKey.MAIN_CLASS)).toEqual('com.example.Main')
    const serialized = manifest.serializeManifest()
    expect(serialized).toBeDefined()
    expect(typeof serialized).toBe('string')
    expect(serialized).toContain('Main-Class: com.example.Main')
    expect(serialized).toContain('Implementation-Title: Example')
    // prettier-ignore
    expect(serialized).toEqual(`Manifest-Version: 1.0
Created-By: javatools/dev
Main-Class: com.example.Main
Implementation-Title: Example
`)
  })

  test('should be parseable from raw data', async () => {
    const builder = JarManifest.builder()
    builder.add(JarManifestKey.MAIN_CLASS, 'com.example.Main')
    builder.add(JarManifestKey.IMPLEMENTATION_TITLE, 'Example')
    const manifest = builder.build()
    expect(manifest).toBeDefined()
    expect(manifest).toBeInstanceOf(JarManifest)
    expect(manifest.get(JarManifestKey.MAIN_CLASS)).toEqual('com.example.Main')
    const serialized = manifest.serializeManifest()
    expect(serialized).toBeDefined()
    expect(typeof serialized).toBe('string')
    expect(serialized).toContain('Main-Class: com.example.Main')
    expect(serialized).toContain('Implementation-Title: Example')
    // prettier-ignore
    expect(serialized).toEqual(`Manifest-Version: 1.0
Created-By: javatools/dev
Main-Class: com.example.Main
Implementation-Title: Example
`)
    // try parsing from the serialized data
    const parsed = await JarManifest.fromData(Buffer.from(serialized))
    expect(parsed).toBeDefined()
    expect(parsed).toBeInstanceOf(JarManifest)
    expect(parsed.get(JarManifestKey.MAIN_CLASS)).toEqual('com.example.Main')
    expect(parsed.get(JarManifestKey.IMPLEMENTATION_TITLE)).toEqual('Example')
  })

  test('should be interrogable for well-known top-level values', async () => {
    const builder = JarManifest.builder()
    builder.add(JarManifestKey.MAIN_CLASS, 'com.example.Main')
    builder.add(JarManifestKey.IMPLEMENTATION_TITLE, 'Example')
    const manifest = builder.build()
    expect(manifest).toBeDefined()
    expect(manifest).toBeInstanceOf(JarManifest)
    expect(manifest.get(JarManifestKey.MAIN_CLASS)).toEqual('com.example.Main')
    const serialized = manifest.serializeManifest()
    expect(serialized).toBeDefined()
    expect(typeof serialized).toBe('string')
    expect(serialized).toContain('Main-Class: com.example.Main')
    expect(serialized).toContain('Implementation-Title: Example')
    // prettier-ignore
    expect(serialized).toEqual(`Manifest-Version: 1.0
Created-By: javatools/dev
Main-Class: com.example.Main
Implementation-Title: Example
`)
    // try parsing from the serialized data
    const parsed = await JarManifest.fromData(Buffer.from(serialized))
    expect(parsed).toBeDefined()
    expect(parsed).toBeInstanceOf(JarManifest)
    expect(parsed.mainClass).toEqual('com.example.Main')
    expect(parsed.createdBy).toBe('javatools/dev')
    expect(parsed.get(JarManifestKey.IMPLEMENTATION_TITLE)).toEqual('Example')
  })

  test('should be buildable with sectional values', () => {
    const builder = JarManifest.builder()
    builder.add(JarManifestKey.MAIN_CLASS, 'com.example.Main')
    builder.add(JarManifestKey.IMPLEMENTATION_TITLE, 'Example')
    builder.addQualified('something', JarManifestKey.SEALED, 'true')
    const manifest = builder.build()
    expect(manifest).toBeDefined()
    expect(manifest).toBeInstanceOf(JarManifest)
    expect(manifest.get(JarManifestKey.MAIN_CLASS)).toEqual('com.example.Main')
    expect(manifest.getQualified('something', JarManifestKey.SEALED)).toEqual('true')
  })

  test('should properly serialize sectional values', () => {
    const builder = JarManifest.builder()
    builder.add(JarManifestKey.MAIN_CLASS, 'com.example.Main')
    builder.add(JarManifestKey.IMPLEMENTATION_TITLE, 'Example')
    builder.addQualified('something', JarManifestKey.SEALED, 'true')
    const manifest = builder.build()
    expect(manifest).toBeDefined()
    expect(manifest).toBeInstanceOf(JarManifest)
    expect(manifest.get(JarManifestKey.MAIN_CLASS)).toEqual('com.example.Main')
    expect(manifest.getQualified('something', JarManifestKey.SEALED)).toEqual('true')

    const serialized = manifest.serializeManifest()
    expect(serialized).toBeDefined()
    expect(typeof serialized).toBe('string')
    expect(serialized).toContain('Main-Class: com.example.Main')
    expect(serialized).toContain('Implementation-Title: Example')
    expect(serialized).toContain('Name: something')
    expect(serialized).toContain('Sealed: true')
    // prettier-ignore
    expect(serialized).toEqual(`Manifest-Version: 1.0
Created-By: javatools/dev
Main-Class: com.example.Main
Implementation-Title: Example
Name: something
Sealed: true
`)
  })

  test('should be interrogable for sectional values', () => {
    const builder = JarManifest.builder()
    builder.add(JarManifestKey.MAIN_CLASS, 'com.example.Main')
    builder.add(JarManifestKey.IMPLEMENTATION_TITLE, 'Example')
    builder.addQualified('something', JarManifestKey.SEALED, 'true')
    const manifest = builder.build()
    expect(manifest).toBeDefined()
    expect(manifest).toBeInstanceOf(JarManifest)
    expect(manifest.get(JarManifestKey.MAIN_CLASS)).toEqual('com.example.Main')
    expect(manifest.getQualified('something', JarManifestKey.SEALED)).toEqual('true')

    const serialized = manifest.serializeManifest()
    expect(serialized).toBeDefined()
    expect(typeof serialized).toBe('string')
    expect(serialized).toContain('Main-Class: com.example.Main')
    expect(serialized).toContain('Implementation-Title: Example')
    expect(serialized).toContain('Name: something')
    expect(serialized).toContain('Sealed: true')
    // prettier-ignore
    expect(serialized).toEqual(`Manifest-Version: 1.0
Created-By: javatools/dev
Main-Class: com.example.Main
Implementation-Title: Example
Name: something
Sealed: true
`)
    // interrogate the manifest for the values
    expect(manifest.mainClass).toEqual('com.example.Main')
    expect(manifest.get(JarManifestKey.IMPLEMENTATION_TITLE)).toEqual('Example')
    expect(manifest.getQualified('something', JarManifestKey.SEALED)).toEqual('true')
    expect(manifest.getQualified('another', JarManifestKey.SEALED)).toBe(null)
    expect(manifest.multiRelease).toBe(false)
  })

  test('should properly detect multi-release jars', () => {
    const builder = JarManifest.builder()
    builder.add(JarManifestKey.MAIN_CLASS, 'com.example.Main')
    builder.add(JarManifestKey.IMPLEMENTATION_TITLE, 'Example')
    builder.add(JarManifestKey.MULTI_RELEASE, true)
    builder.addQualified('something', JarManifestKey.SEALED, 'true')
    const manifest = builder.build()
    expect(manifest).toBeDefined()
    expect(manifest).toBeInstanceOf(JarManifest)
    expect(manifest.get(JarManifestKey.MAIN_CLASS)).toEqual('com.example.Main')
    expect(manifest.getQualified('something', JarManifestKey.SEALED)).toEqual('true')

    const serialized = manifest.serializeManifest()
    expect(serialized).toBeDefined()
    expect(typeof serialized).toBe('string')
    expect(serialized).toContain('Main-Class: com.example.Main')
    expect(serialized).toContain('Multi-Release: true')
    expect(serialized).toContain('Implementation-Title: Example')
    expect(serialized).toContain('Name: something')
    expect(serialized).toContain('Sealed: true')
    // prettier-ignore
    expect(serialized).toEqual(`Manifest-Version: 1.0
Created-By: javatools/dev
Main-Class: com.example.Main
Implementation-Title: Example
Multi-Release: true
Name: something
Sealed: true
`)
    // interrogate the manifest for the values
    expect(manifest.mainClass).toEqual('com.example.Main')
    expect(manifest.get(JarManifestKey.IMPLEMENTATION_TITLE)).toEqual('Example')
    expect(manifest.getQualified('something', JarManifestKey.SEALED)).toEqual('true')
    expect(manifest.getQualified('another', JarManifestKey.SEALED)).toBe(null)
    expect(manifest.multiRelease).toBe(true)
  })

  test('should properly detect automatic module name', () => {
    const builder = JarManifest.builder()
    builder.add(JarManifestKey.MAIN_CLASS, 'com.example.Main')
    builder.add(JarManifestKey.IMPLEMENTATION_TITLE, 'Example')
    builder.add(JarManifestKey.MULTI_RELEASE, true)
    builder.add(JarManifestKey.AUTOMATIC_MODULE_NAME, 'example')
    builder.addQualified('something', JarManifestKey.SEALED, 'true')
    const manifest = builder.build()
    expect(manifest).toBeDefined()
    expect(manifest).toBeInstanceOf(JarManifest)
    expect(manifest.get(JarManifestKey.MAIN_CLASS)).toEqual('com.example.Main')
    expect(manifest.getQualified('something', JarManifestKey.SEALED)).toEqual('true')

    const serialized = manifest.serializeManifest()
    expect(serialized).toBeDefined()
    expect(typeof serialized).toBe('string')
    expect(serialized).toContain('Main-Class: com.example.Main')
    expect(serialized).toContain('Multi-Release: true')
    expect(serialized).toContain('Automatic-Module-Name: example')
    expect(serialized).toContain('Implementation-Title: Example')
    expect(serialized).toContain('Name: something')
    expect(serialized).toContain('Sealed: true')
    // prettier-ignore
    expect(serialized).toEqual(`Manifest-Version: 1.0
Created-By: javatools/dev
Main-Class: com.example.Main
Implementation-Title: Example
Multi-Release: true
Automatic-Module-Name: example
Name: something
Sealed: true
`)
    // interrogate the manifest for the values
    expect(manifest.mainClass).toEqual('com.example.Main')
    expect(manifest.get(JarManifestKey.IMPLEMENTATION_TITLE)).toEqual('Example')
    expect(manifest.getQualified('something', JarManifestKey.SEALED)).toEqual('true')
    expect(manifest.getQualified('another', JarManifestKey.SEALED)).toBe(null)
    expect(manifest.multiRelease).toBe(true)
    expect(manifest.automaticModuleName).toBe('example')
  })

  test('should set manifest version to latest by default', () => {
    const builder = JarManifest.builder()
    builder.add(JarManifestKey.MAIN_CLASS, 'com.example.Main')
    builder.add(JarManifestKey.IMPLEMENTATION_TITLE, 'Example')
    const manifest = builder.build()
    expect(manifest).toBeDefined()
    expect(manifest).toBeInstanceOf(JarManifest)
    expect(manifest.get(JarManifestKey.MAIN_CLASS)).toEqual('com.example.Main')
    expect(manifest.get(JarManifestKey.MANIFEST_VERSION)).toEqual('1.0')
    expect(manifest.manifestVersion).toBe('1.0')
  })

  test('should be able to check for value membership', () => {
    const builder = JarManifest.builder()
    builder.add(JarManifestKey.MAIN_CLASS, 'com.example.Main')
    builder.add(JarManifestKey.IMPLEMENTATION_TITLE, 'Example')
    const manifest = builder.build()
    expect(manifest).toBeDefined()
    expect(manifest).toBeInstanceOf(JarManifest)
    expect(manifest.has(JarManifestKey.MAIN_CLASS)).toBe(true)
    expect(manifest.has(JarManifestKey.IMPLEMENTATION_TITLE)).toBe(true)
    expect(manifest.has(JarManifestKey.MANIFEST_VERSION)).toBe(true)
    expect(manifest.has(JarManifestKey.MULTI_RELEASE)).toBe(false)
  })

  test('should be able to obtain raw manifest data', () => {
    const builder = JarManifest.builder()
    builder.add(JarManifestKey.MAIN_CLASS, 'com.example.Main')
    builder.add(JarManifestKey.IMPLEMENTATION_TITLE, 'Example')
    const manifest = builder.build()
    expect(manifest).toBeDefined()
    expect(manifest).toBeInstanceOf(JarManifest)
    expect(manifest.get(JarManifestKey.MAIN_CLASS)).toEqual('com.example.Main')
    expect(manifest.get(JarManifestKey.MANIFEST_VERSION)).toEqual('1.0')
    expect(manifest.manifestVersion).toBe('1.0')
    expect(manifest.rawManifest).toBeDefined()
  })
})
