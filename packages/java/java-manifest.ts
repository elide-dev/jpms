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

import { QualifiedClassName } from './java-model.js'

/**
 * Vendor string for this tool.
 */
export const vendorStamp = 'Elide Technologies, Inc.'

/**
 * `Created-By` JAR manifest value.
 */
export const createdByStamp = 'javatools/dev'

/**
 * Current version expected for JAR manifests, and used by this tool when generating manifests.
 */
export const currentManifestVersion = '1.0'

/**
 * Expected path within JARs where the manifest should be located
 */
export const manifestPath = 'META-INF/MANIFEST.MF'

/**
 * JAR Manifest Key
 *
 * Well-known JAR manifest keys.
 */
export enum JarManifestKey {
  /**
   * The `Manifest-Version` for a JAR.
   */
  MANIFEST_VERSION = 'Manifest-Version',

  /**
   * The `Automatic-Module-Name` assignment for a JAR.
   */
  AUTOMATIC_MODULE_NAME = 'Automatic-Module-Name',

  /**
   * The `Main-Class` for a JAR.
   */
  MAIN_CLASS = 'Main-Class',

  /**
   * The `Multi-Release` flag for MRJARs.
   */
  MULTI_RELEASE = 'Multi-Release',

  /**
   * The `Signature-Version` entry for a JAR.
   */
  SIGNATURE_VERSION = 'Signature-Version',

  /**
   * Embedded `Class-Path` for a JAR.
   */
  CLASS_PATH = 'Class-Path',

  /**
   * Refers to a "sealed" JAR; see below for more information:
   * https://docs.oracle.com/en/java/javase/21/docs/specs/jar/jar.html#package-sealing
   */
  SEALED = 'Sealed',

  /**
   * Indicates what tool created the JAR.
   */
  CREATED_BY = 'Created-By',

  /**
   * Specifies a Java agent class to mount and use.
   */
  LAUNCHER_AGENT_CLASS = 'Launcher-Agent-Class',

  /**
   * Title of an extension implementation.
   */
  IMPLEMENTATION_TITLE = 'Implementation-Title',

  /**
   * Version of an extension implementation.
   */
  IMPLEMENTATION_VERSION = 'Implementation-Version',

  /**
   * Vendor of an extension implementation.
   */
  IMPLEMENTATION_VENDOR = 'Implementation-Vendor',

  /**
   * Title of a specification that the extension implements.
   */
  SPECIFICATION_TITLE = 'Specification-Title',

  /**
   * Version of a specification that the extension implements.
   */
  SPECIFICATION_VERSION = 'Specification-Version',

  /**
   * Vendor of a specification that the extension implements.
   */
  SPECIFICATION_VENDOR = 'Specification-Vendor',

  /**
   * SHA-1 digest provided for a JAR entry.
   */
  SHA1_DIGEST = 'SHA1-Digest',

  /**
   * SHA-256 digest provided for a JAR entry.
   */
  SHA256_DIGEST = 'SHA256-Digest',

  /**
   * "Magic" attribute for certain key-value pairs in JAR entries.
   */
  MAGIC = 'Magic'
}

/**
 * JAR Manifest Key Type: Known or String
 *
 * Maps either pure strings or known keys to JAR manifest keys.
 */
export type JarManifestKeyString = typeof JarManifestKey | string

/**
 * JAR Manifest Data
 *
 * Describes the shape of raw JAR manifest data.
 */
export type JarManifestData = {
  [Property in keyof JarManifestKey | string]: string | undefined
}

/**
 * JAR Manifest: Qualified Data
 *
 * Describes data that can occur in a JAR manifest section, qualified by a class name.
 */
export type JarManifestQualifiedData = JarManifestData & {
  /**
   * Package path or class name.
   */
  qualifierName: string
}

/**
 * JAR Manifest: Raw Shape
 *
 * Describes the top-level raw shape of a JAR manifest, with its JAR-level clause and sections.
 */
export type RawJarManifest = JarManifestData & {
  /**
   * JAR manifest sections, if any.
   */
  sections: JarManifestQualifiedData[]
}

/**
 * JAR Manifest Baseline
 *
 * Base API interface for JAR manifest data, shared with other classes which provide proxied access to JAR manifest
 * information (for instance, JAR file instances).
 */
export interface JarManifestBaseline {
  /**
   * Return the `Manifest-Version` specified for a JAR, or `null` if no version is defined.
   */
  manifestVersion: string | null

  /**
   * Return the `Main-Class` specified for a JAR, or `null` if no main class is defined.
   */
  mainClass: QualifiedClassName | null

  /**
   * Return the `Automatic-Module-Name` specified for a JAR, or `null` if no module name is defined.
   */
  automaticModuleName: string | null

  /**
   * Return the `Multi-Release` flag specified for a JAR, or `null` if no flag is defined.
   */
  multiRelease: boolean
}

/**
 * JAR Manifest
 *
 * Describes the API provided for interpreted JAR manifests. Once a JAR manifest has been parsed and interpreted,
 * it can be interrogated via the methods and getters provided by this interface.
 */
export interface JarManifest extends JarManifestBaseline {
  /**
   * Return the `Created-By` stamp present in the JAR manifest, if any, or `null`.
   */
  createdBy: string | null

  /**
   * Return a raw JSON-style primitive representation of the JAR manifest.
   */
  rawManifest: RawJarManifest

  /**
   * Serialize into a raw string representation, suitable to write to disk.
   *
   * @return Rendered string representation of the manifest.
   */
  serializeManifest(): string

  /**
   * Retrieve the value of a top-level JAR manifest key, or return `null`.
   *
   * @param key Key to retrieve (top-level) from the JAR manifest
   * @return Value of the key, or `null` if not present
   */
  get(key: JarManifestKeyString): string | null

  /**
   * Retrieve the value of a qualified JAR manifest key, or return `null`.
   *
   * @param qualifierName Qualified name to retrieve from the JAR manifest
   * @param key Key to retrieve from the qualified section
   * @return Value of the key, or `null` if not present
   */
  getQualified(qualifierName: string, key: JarManifestKeyString): string | null

  /**
   * Check if a top-level key is present in the JAR manifest.
   *
   * @param key Key to check for membership in the JAR manifest
   */
  has(key: JarManifestKeyString): boolean

  /**
   * Check if a qualified key is present in the JAR manifest.
   *
   * @param qualifierName Qualified name to check for membership in the JAR manifest
   * @param key Key to check for membership in the qualified section
   */
  hasQualified(qualifierName: string, key: JarManifestKeyString): boolean
}

/**
 * JAR Manifest Builder
 *
 * Implements a basic builder interface which can buffer and construct JAR manifest data into an immutable data
 * structure, which can be serialized if needed.
 *
 * Parsing of JAR manifests happens via builders. All interpreted JAR manifest objects are immutable.
 */
export class JarManifestBuilder {
  // Top-level JAR manifest keys.
  private readonly topKeys: Map<JarManifestKeyString, string> = new Map()

  // Qualified JAR manifest keys.
  private readonly qualifiedKeys: Map<string, Map<JarManifestKeyString, string>> = new Map()

  /**
   * Construct a new JAR manifest builder.
   */
  public constructor() {
    this.topKeys.set(JarManifestKey.MANIFEST_VERSION, currentManifestVersion)
    this.topKeys.set(JarManifestKey.CREATED_BY, createdByStamp)
  }

  /**
   * Add a top-level key-value pair to the JAR manifest.
   *
   * @param key Key to add
   * @param value Value to add
   * @return Builder instance
   */
  public add(key: JarManifestKeyString, value: string | boolean): this {
    this.topKeys.set(key, value.toString())
    return this
  }

  /**
   * Add a qualified key-value pair to the JAR manifest.
   *
   * @param qualifierName Qualifier name to add
   * @param key Key to add
   * @param value Value to add
   * @return Builder instance
   */
  public addQualified(qualifierName: string, key: JarManifestKeyString, value: string): this {
    if (!this.qualifiedKeys.has(qualifierName)) {
      this.qualifiedKeys.set(qualifierName, new Map())
    }

    this.qualifiedKeys.get(qualifierName)?.set(key, value)
    return this
  }

  /**
   * Serialize this builder into raw JAR manifest JSON data.
   *
   * @return Immutable JAR manifest data
   */
  public serialize(): RawJarManifest {
    return {
      ...Object.fromEntries(this.topKeys),
      sections: Array.from(this.qualifiedKeys).map(([qualifierName, data]) => ({
        qualifierName,
        ...Object.fromEntries(data)
      }))
    }
  }

  /**
   * Build the builder into a serialized JAR manifest, and then interpret it as a JAR manifest.
   *
   * @return Interpreted JAR manifest
   */
  public build(): JarManifest {
    return ParsedJarManifest.fromRaw(this.serialize())
  }

  /**
   * Build a JAR manifest builder from a raw JAR manifest structure.
   *
   * @param raw Raw JSON form of the manifest
   * @return JAR manifest builder pre-loaded with the input data
   */
  public static async fromRaw(raw: RawJarManifest): Promise<JarManifestBuilder> {
    const builder = new JarManifestBuilder()
    for (const [key, value] of Object.entries(raw)) {
      if (key === 'sections') {
        for (const section of raw.sections) {
          for (const [key, value] of Object.entries(section)) {
            if (value) builder.addQualified(section.qualifierName, key, value)
          }
        }
      } else if (value) {
        builder.add(key, value as string)
      }
    }
    return builder
  }

  /**
   * Parse JAR manifest information from the provided data.
   *
   * @param data Raw data to decode and parse as a JAR manifest
   * @return Parsed JAR manifest data
   * @throws If the provided data is not parseable as a JAR manifest
   */
  public static async fromData(data: Buffer): Promise<JarManifestBuilder> {
    const decodedutf8 = data.toString('utf8')
    const lines = decodedutf8.split(/\r?\n/)
    const props: Partial<RawJarManifest> = {}
    const sections: Map<string, JarManifestQualifiedData> = new Map()
    let currentSection: string | null = null
    let lineI = 0

    let line: string | undefined
    let lastSeenProperty: string | undefined
    while ((line = lines.shift())) {
      lineI++

      // if the line is empty or just a newline, skip it
      if (!line || line === '\r' || line === '\n') continue

      if (!line.startsWith(' ')) {
        if (line.startsWith('Name: ')) {
          currentSection = line.slice(6)
          sections[currentSection] = { qualifierName: currentSection }
        } else {
          const [key] = line.split(': ', 1)
          const value = line.slice(key.length + 2)

          if (currentSection) {
            sections[currentSection][key] = value.trim()
            lastSeenProperty = key
          } else {
            props[key] = value.trim()
            lastSeenProperty = key
          }
        }
      } else {
        // the line is indented, so we will need to append it to the last-seen property
        if (!lastSeenProperty) {
          throw new Error(`Unexpected indented line at line ${lineI}`)
        }
        if (!currentSection) {
          props[lastSeenProperty] += line.trim()
        } else {
          sections[currentSection][lastSeenProperty] += line.trim()
        }
      }
    }
    return this.fromRaw(props as RawJarManifest)
  }
}

// Check a string value from a manifest.
function checkStringValue(manifest: RawJarManifest, key: JarManifestKeyString): string | null {
  const value = manifest[key as string]
  if (value === null || value === undefined) {
    return null
  }
  if (!(typeof value === 'string') || value.length === 0) {
    throw new Error(`Invalid value for key '${key}': '${value}'`)
  }
  return value
}

// Check and cast a boolean value from a manifest.
function checkBooleanValue(manifest: RawJarManifest, key: JarManifestKeyString): boolean {
  const value = manifest[key as string]
  if (typeof value === 'boolean') {
    return value
  } else if (typeof value === 'string') {
    if (value === 'true') return true
    if (value === 'false') return false
  } else if (value === null || value === undefined) {
    return false
  }
  throw new Error(`Invalid value for key '${key}': '${value}'`)
}

/**
 * Parsed JAR Manifest
 *
 * Implements the JAR Manifest API for parsed JAR manifest data.
 */
export default class ParsedJarManifest implements JarManifest {
  /**
   * Private primary constructor.
   *
   * @param _raw Raw JAR manifest data, after parsing and potentially after checks
   */
  private constructor(private readonly manifest: RawJarManifest) {}

  /** @inheritdoc */
  public get manifestVersion(): string | null {
    return checkStringValue(this.manifest, JarManifestKey.MANIFEST_VERSION)
  }

  /** @inheritdoc */
  public get mainClass(): QualifiedClassName | null {
    return checkStringValue(this.manifest, JarManifestKey.MAIN_CLASS)
  }

  /** @inheritdoc */
  public get createdBy(): string | null {
    return checkStringValue(this.manifest, JarManifestKey.CREATED_BY)
  }

  /** @inheritdoc */
  public get automaticModuleName(): string | null {
    return checkStringValue(this.manifest, JarManifestKey.AUTOMATIC_MODULE_NAME)
  }

  /** @inheritdoc */
  public get multiRelease(): boolean {
    return checkBooleanValue(this.manifest, JarManifestKey.MULTI_RELEASE)
  }

  /** @inheritdoc */
  public get rawManifest(): RawJarManifest {
    return this.manifest
  }

  /** @inheritdoc */
  public serializeManifest(): string {
    let rendered = ''
    for (const [key, value] of Object.entries(this.manifest)) {
      if (key === 'sections') continue
      rendered += `${key}: ${value}\n`
    }
    for (const data of Object.values(this.manifest.sections)) {
      rendered += `Name: ${data.qualifierName}\n`
      for (const [key, value] of Object.entries(data)) {
        if (key === 'qualifierName') continue
        rendered += `${key}: ${value}\n`
      }
    }
    return rendered
  }

  /** @inheritdoc */
  public get(key: JarManifestKeyString): string | null {
    return checkStringValue(this.manifest, key)
  }

  /** @inheritdoc */
  public getQualified(qualifierName: string, key: JarManifestKeyString): string | null {
    const section = this.manifest.sections.find(section => section.qualifierName === qualifierName)
    if (!section) {
      return null
    }
    const value = section[key as string]
    if (value === null || value === undefined) {
      return null
    }
    return value
  }

  /** @inheritdoc */
  public has(key: JarManifestKeyString): boolean {
    return this.manifest[key as string] !== undefined
  }

  /** @inheritdoc */
  public hasQualified(qualifierName: string, key: JarManifestKeyString): boolean {
    return this.manifest.sections.some(
      section => section.qualifierName === qualifierName && section[key as string] !== undefined
    )
  }

  /**
   * Build an interpreted JAR from raw JAR manifest data.
   *
   * @param data Raw JSON-style primitive JAR manifest data
   * @return Parsed JAR manifest data
   * @throws If the provided data is not parseable as a JAR manifest
   */
  public static fromRaw(data: RawJarManifest): JarManifest {
    return new ParsedJarManifest(data)
  }

  /**
   * Create an empty JAR manifest builder.
   *
   * @return Empty builder
   */
  public static builder(): JarManifestBuilder {
    return new JarManifestBuilder()
  }

  /**
   * Parse JAR manifest information from the provided data.
   *
   * @param data Raw data to decode and parse as a JAR manifest
   * @return Parsed JAR manifest data
   * @throws If the provided data is not parseable as a JAR manifest
   */
  public static async fromData(data: Buffer): Promise<JarManifest> {
    return (await JarManifestBuilder.fromData(data)).build()
  }
}
