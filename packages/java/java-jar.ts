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

import { FlateError, Unzip, UnzipFile, UnzipInflate } from 'fflate'
import ByteBuffer from 'bytebuffer'
import JarManifest, {
  JarManifest as JarManifestApi,
  JarManifestBaseline,
  JarManifestBuilder,
  JarManifestKeyString,
  manifestPath
} from './java-manifest.js'
import { JavaModuleInfo, QualifiedClassName, SimpleClassName } from './java-model.js'
import { JavaClassFile } from './java-classfile.js'

/**
 * Default size to use for chunks of Zip data
 */
const defaultZipChunkSize = 1024

/**
 * Utility that produces data for a named file from a zip
 */
interface FileContentProducer {
  name: string
  read(): Promise<Buffer>
}

/**
 * Describes a streamed/async unzip operation for reading a JAR
 */
type UnzipOperation = {
  op: Unzip
  files: Map<string, ZipFileMetadata>
  content: Map<string, () => Promise<FileContentProducer>>
}

/**
 * Chunk of zip data consumed as an async iterable
 */
type ZipChunk = {
  chunk: Uint8Array
  final?: boolean
}

/**
 * Limited metadata kept for all files.
 */
export type ZipFileMetadata = Omit<Omit<Omit<UnzipFile, 'start'>, 'ondata'>, 'terminate'>

/**
 * JAR Compression
 *
 * Describes compression modes which can be encountered while processing JAR files.
 */
export enum JarCompression {
  /** No compression is applied. */
  IDENTITY = 0,

  /** Deflate compression is applied */
  DEFLATE = 1
}

/**
 * JAR Entry Type
 *
 * Enumeration which describes the types of entries which may be present within a JAR.
 */
export enum JarEntryType {
  /**
   * JAR manifest file
   */
  MANIFEST = 'manifest',

  /**
   * Generic JAR resource file
   */
  RESOURCE = 'resource',

  /**
   * Compiled class file
   */
  CLASS = 'class',

  /**
   * Service mapping file
   */
  SERVICE = 'service',

  /**
   * Compiled module definition
   */
  MODULE = 'module'
}

/**
 * JAR Entry
 *
 * Represents a single entry in a JAR file; specialized by child interfaces for each type of object which can be
 * encountered in a JAR.
 */
export interface JarEntry {
  /**
   * Relative path to the entry within the JAR.
   */
  path: string

  /**
   * Whether the entry is compressed.
   */
  compression?: JarCompression

  /**
   * Deferred file content producer
   */
  data: () => Promise<FileContentProducer>
}

/**
 * JAR Resource
 *
 * Describes a generic resource file found within a JAR.
 */
export interface JarResource extends JarEntry {
  /**
   * Size of the resource as a count of bytes.
   */
  size: number
}

/**
 * JAR Manifest
 *
 * Describes a JAR manifest located within a JAR.
 */
export interface JarManifestEntry extends JarEntry {
  /**
   * Parsed manifest attributes.
   */
  manifest: JarManifest
}

/**
 * JAR Service Entry
 *
 * Describes a mapped service and implementation set within the JAR; these are spawned from/serialize to files within
 * the `META-INF/services` directory.
 */
export interface JarServiceEntry extends JarEntry {
  /**
   * Name of the service mapped by this entry
   */
  service: QualifiedClassName

  /**
   * Implementations mapped for this service entry
   */
  impls: QualifiedClassName[]
}

/**
 * JAR Class
 *
 * Describes a generic compiled Java class file found within a JAR.
 */
export interface JarClassEntry extends JarEntry {
  /**
   * Qualified name of the class.
   */
  qualifiedName: QualifiedClassName

  /**
   * Simple name of the class.
   */
  simpleName: SimpleClassName

  /**
   * Interpreted/loaded information about the class.
   */
  classfile: () => Promise<JavaClassFile>
}

/**
 * JAR Module
 *
 * Specializes the JAR class concept for compiled module descriptor classes.
 */
export interface JarModuleEntry extends JarClassEntry {
  /**
   * Parsed module information.
   */
  moduleInfo: () => Promise<JavaModuleInfo>
}

/**
 * Read the provided zip data chunk-by-chunk in-memory, grabbing files as we go.
 *
 * If no file filter is provided, all files are mounted. Files are consumed lazily; for each eligible file, a consumer
 * function is mounted on the resulting content map.
 *
 * @param chunkConsumer Consumer of zip chunks
 * @param files Files we are interested in
 * @paaram predicate Predicate for file inclusion
 * @returns Promise for an unzip operation result
 */
async function readZipInMemory(
  chunkConsumer: AsyncGenerator<ZipChunk, void, unknown>,
  predicate: JarPredicate
): Promise<UnzipOperation> {
  const unzipper = new Unzip()
  unzipper.register(UnzipInflate)
  const allFiles: Map<string, ZipFileMetadata> = new Map()
  const content: Map<string, () => Promise<FileContentProducer>> = new Map()

  unzipper.onfile = file => {
    // always keep the file metadata
    allFiles.set(file.name, {
      name: file.name,
      size: file.size,
      originalSize: file.originalSize,
      compression: file.compression
    })

    // if the file matches any predicate, include it
    if (predicate(file)) {
      content.set(
        file.name,
        () =>
          new Promise((accept, reject) => {
            const buf = new ByteBuffer(file.size)
            file.ondata = (err: FlateError | null, data: Uint8Array, final: boolean) => {
              if (err) {
                reject(err)
                return
              } else {
                // gather bytes
                buf.append(data)
                if (final) {
                  accept({
                    name: file.name,
                    read: async () => buf.buffer
                  })
                }
              }
            }

            // start the stream
            file.start()
          })
      )
    }
  }

  // consume zip data in chunks, passing to unzipper as we go
  let gotChunks = false
  for await (const chunk of chunkConsumer) {
    gotChunks = true
    unzipper.push(chunk.chunk, chunk.final === true)
  }
  if (!gotChunks) throw new Error('No zip chunks provided')

  return {
    op: unzipper,
    files: allFiles,
    content
  }
}

/**
 * Read a JAR file from the provided data buffer
 *
 * @param data Data buffer to stream from
 * @param predicate Filters for eligible JAR contents
 * @returns Unzip operation
 */
export async function readZipFromData(
  data: Buffer,
  predicate: JarPredicate,
  chunkSize: number = defaultZipChunkSize
): Promise<UnzipOperation> {
  if (typeof data.length !== 'number' || data.length < 1) {
    console.error('invalid buffer', data)
    throw new Error(
      `Invalid data buffer provided: empty or non-numeric (buffer type: ${typeof data}, length: ${data.length})`
    )
  }

  // slice buffer into ~1024 byte sections
  const chunks = Math.ceil(data.length / chunkSize)
  let offset = 0
  const chunker = async function* () {
    for (let i = 0; i < chunks; i++) {
      const chunk = data.subarray(offset, offset + chunkSize)
      offset += chunkSize
      yield { chunk, final: i === chunks - 1 }
    }
  }

  return readZipInMemory(chunker(), predicate)
}

/**
 * Identify the type of entry under examination within a JAR.
 *
 * @param path Path to the entry in question
 * @return Type of entry
 */
export function identifyEntry(path: string): JarEntryType {
  const match = [
    () => (path === manifestPath ? JarEntryType.MANIFEST : null),
    () => (path.endsWith('module-info.class') ? JarEntryType.MODULE : null),
    () => (path.endsWith('.class') ? JarEntryType.CLASS : null),
    () => (path.startsWith('META-INF/services/') ? JarEntryType.SERVICE : null)
  ]
  for (const matcher of match) {
    const result = matcher()
    if (result) return result
  }
  return JarEntryType.RESOURCE
}

/**
 * Inflate a JAR entry from raw data.
 *
 * @param type Type of JAR entry being inflated
 * @param path Path to the entry in question
 * @param content Raw content for the entry
 * @return Promise for an inflated JAR entry
 */
export async function inflateEntry(type: JarEntryType, path: string, content: FileContentProducer): Promise<JarEntry> {
  return new Promise(async (accept, reject) => {
    const classfileDecode: () => Promise<JavaClassFile> = () => {
      return new Promise(async (innerAccept, innerReject) => {
        try {
          innerAccept(JavaClassFile.fromData(await content.read()))
        } catch (err) {
          innerReject(err)
        }
      })
    }

    switch (type) {
      case JarEntryType.RESOURCE:
        accept({ path } as JarResource)
        break

      case JarEntryType.MANIFEST:
        const manifest = await JarManifest.fromData(await content.read())
        accept({ path, manifest } as JarManifestEntry)
        break

      case JarEntryType.SERVICE:
        const servicefile = await content.read()
        const service = servicefile.toString('utf-8').trim()
        const impls = service
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
        accept(jarService(path, service, ...impls))
        break

      case JarEntryType.MODULE:
        accept({
          path,
          qualifiedName: jarPathToQualifiedClass(path),
          simpleName: qualifiedNameToSimpleName(jarPathToQualifiedClass(path)),
          moduleInfo: async () => (await classfileDecode()).moduleInfo(),
          classfile: () => classfileDecode()
        } as JarModuleEntry)
        break

      case JarEntryType.CLASS:
        accept({
          qualifiedName: jarPathToQualifiedClass(path),
          simpleName: qualifiedNameToSimpleName(jarPathToQualifiedClass(path)),
          classfile: () => classfileDecode()
        } as JarClassEntry)
        break

      default:
        reject(new Error('not yet implemented: ' + type))
        break
    }
  })
}

/**
 * Low-level function to inflate raw JAR information from a Zip file.
 *
 * @param data Data buffer to stream from
 * @returns Promise for an interpreted manifest (if any) and an async iterable of JAR entries
 */
export async function inflateFromZip(op: Promise<UnzipOperation>): Promise<{
  manifest: JarManifestApi | null
  entries: Map<string, DeferredJarEntry>
  entryIndex: Map<JarEntryType, string[]>
}> {
  // wait for the unzip operation
  const unzip = await op

  // try to resolve manifest content
  const manifestContent = unzip.content.get(manifestPath)
  let foundManifest: Promise<JarManifestApi | null>
  if (manifestContent) {
    foundManifest = JarManifest.fromData(await (await manifestContent()).read())
  } else {
    foundManifest = Promise.resolve(null)
  }

  // convert all entries into jar entries
  const entries: Map<string, DeferredJarEntry> = new Map()
  const entryIndex: Map<JarEntryType, string[]> = new Map()

  for (const [path, content] of unzip.content) {
    if (path.endsWith('/')) continue // skip directories
    const entryType = identifyEntry(path)
    if (!entryIndex.has(entryType)) entryIndex.set(entryType, [])
    ;(entryIndex.get(entryType) as string[]).push(path)

    if (entries.has(path)) throw new Error(`duplicate path in jar: ${path}`)
    entries.set(path, {
      path,
      type: entryType,
      data: content,
      entry: async () => inflateEntry(entryType, path, await content())
    })
  }
  return {
    manifest: await foundManifest,
    entries,
    entryIndex
  }
}

/**
 * Convert a qualified class name to a path within a JAR file.
 *
 * @param name Qualified class name to build a JAR path for
 * @returns JAR path for the class (expected)
 */
export function qualifiedClassToJarPath(name: QualifiedClassName): string {
  return name.replace(/\./g, '/') + '.class'
}

/**
 * Convert a path within a JAR file (for a class) to a qualified class name.
 *
 * @param path Path to the class file within the JAR
 * @return Qualified class name
 */
export function jarPathToQualifiedClass(path: string): QualifiedClassName {
  return path.replace(/\.class$/, '').replace(/\//g, '.')
}

/**
 * Convert a qualified class name to a simple class name.
 *
 * @param name Qualified class name to convert
 * @returns Simple name for the class
 */
export function qualifiedNameToSimpleName(name: QualifiedClassName): SimpleClassName {
  return name.split('.').pop() as SimpleClassName
}

/**
 * JAR Predicate
 *
 * Predicate filter function for JAR files; returns true if the file should be included in the JAR reader operation.
 */
export type JarPredicate = ((name: ZipFileMetadata) => boolean) & {
  /** Invert the match: if `true` is returned, the file is not included. */
  invert?: boolean
}

/**
 * Base JAR Operation Options
 *
 * Options which are mixed in to all JAR operation options.
 */
export type BaseJarOperationOptions = {
  /** Predicate matchers for JAR contents; if any match, the file is included. */
  predicate: JarPredicate[]
}

/**
 * JAR Reader Options
 *
 * Specifies options that govern the JAR reader process, including file filters and other settings which avoid extra
 * work when decompressing and reading JARs.
 */
export type JarReaderOptions = BaseJarOperationOptions & {
  /** Read all file metadata in the JAR eagerly. */
  eager: boolean
}

/**
 * JAR Entry Iterable Options
 *
 * Specifies options for generating an efficient iterable over JAR entries.
 */
export type JarEntryIterableOptions = BaseJarOperationOptions & {}

/**
 * Default options to apply when iterating over JAR entries.
 */
const defaultEntryIterableOptions = {
  predicate: []
}

type JarPredicateFactory = () => JarPredicate & {
  invert: () => JarPredicate
}

function predicateFactory(factory: () => JarPredicate): JarPredicateFactory {
  // @ts-expect-error
  factory.invert = () => () => {
    const pred = factory()
    return (file: UnzipFile) => !pred(file)
  }
  return factory as JarPredicateFactory
}

/**
 * JAR Matcher
 *
 * Provides a set of pre-defined matcher factories for JAR file predicates.
 */
export const jarMatcher: { [key: string]: JarPredicateFactory } = {
  /** Match all entries. */
  all: predicateFactory(() => () => true),

  /** Match no entries. */
  none: predicateFactory(() => () => false),

  /** Match classes. */
  classes: predicateFactory(() => (file: ZipFileMetadata) => file.name.endsWith('.class')),

  /** Match resources. */
  resources: predicateFactory(() => (file: ZipFileMetadata) => !file.name.endsWith('.class')),

  /** Match services. */
  services: predicateFactory(() => (file: ZipFileMetadata) => file.name.startsWith('META-INF/services/')),

  /** Match the primary manifest. */
  manifest: predicateFactory(() => (file: ZipFileMetadata) => file.name === 'META-INF/MANIFEST.MF'),

  /** Match all manifests in the JAR. */
  allManifests: predicateFactory(
    () => (file: ZipFileMetadata) =>
      jarMatcher.manifest()(file) || (file.name.startsWith('META-INF/') && file.name.endsWith('.MF'))
  ),

  /** Match the primary module info. */
  moduleInfo: predicateFactory(() => (file: ZipFileMetadata) => file.name === 'module-info.class'),

  /** Match all module info declarations in the JAR. */
  allModuleInfos: predicateFactory(() => (file: ZipFileMetadata) => file.name.endsWith('module-info.class'))
}

// Default reader options.
const defaultReaderOptions: JarReaderOptions = {
  eager: false,
  predicate: []
}

// Matchers which always apply on top of developer-provided predicates.
const unconditionalPredicates: JarPredicate[] = [jarMatcher.allManifests(), jarMatcher.allModuleInfos()]

// Merge defaults to produce final reader options.
function readerOptions(options?: JarReaderOptions): JarReaderOptions {
  return {
    ...defaultReaderOptions,
    ...options,
    predicate: [...unconditionalPredicates, ...(options?.predicate || [])]
  }
}

/**
 * Build a compound predicate for the provided options.
 *
 * @param options Options for reading a JAR
 * @returns Default predicates
 */
export function buildPredicate(options: JarReaderOptions): JarPredicate {
  return (file: ZipFileMetadata) => {
    for (const pred of options.predicate) {
      if (pred(file) === pred.invert) return false
    }
    return true
  }
}

/**
 * JAR Builder
 *
 * Efficient and lazily-packed/encoded representation of a Java Archive (JAR) file builder, which emits an immutable
 * `JarFile` instance when the build operation is complete; such instances can be written to disk to produce a
 * compliant JAR file.
 *
 * The JAR builder works the same way as the JAR file class, but in reverse: it gathers `JarEntry` instances of
 * different types, buffering them until the JAR is told to flush; at that point, the JAR builder begins serializing
 * and compressing contents as needed, ultimately producing a `JarFile` instance.
 */
export class JarBuilder {
  // Name to carry with the JAR.
  private _name: string | null = null

  // Entries to be serialized.
  private readonly _entries: JarEntry[] = []

  // Manifest to be serialized.
  private readonly _manifest: JarManifestBuilder = JarManifest.builder()

  /**
   * Access the name set for the JAR in this builder.
   *
   * @return Name or `null`
   */
  public get name(): string | null {
    return this._name
  }

  /**
   * Access the underlying JAR manifest builder.
   *
   * @return Manifest builder
   */
  public get manifest(): JarManifestBuilder {
    return this._manifest
  }

  /**
   * Add an entry to the JAR.
   *
   * @param entry Entry to add
   */
  public add(entry: JarEntry): this {
    this._entries.push(entry)
    return this
  }

  /**
   * Build this builder into an immutable `JarFile` instance.
   *
   * @return JAR file instance.
   */
  public build(): JarFile {
    throw new Error('not yet implemented')
  }
}

/**
 * Deferred JAR Entry
 *
 * JAR entry which defers decoding of its contents.
 */
type DeferredJarEntry = {
  path: string
  type: JarEntryType
  entry: () => Promise<JarEntry>
  data: () => Promise<FileContentProducer>
}

/**
 * JAR File
 *
 * Efficient and lazily-parsed representation of a Java Archive (JAR) file; JARs are structured as Zip files, with
 * certain conventions that apply for Java class files and resources, and declaring JAR metadata.
 *
 * JARs typically have a "JAR manifest" file, which is a metadata file that describes the contents of the JAR, and
 * lives at the path `META-INF/MANIFEST.MF` within the JAR.
 *
 * Additional structure may apply:
 *
 * - Services can be declared within the `META-INF/services` directory; each file is named after a service interface,
 *   the full qualified path of the file is the name of the service provider. The file contains qualified class names
 *   for implementations of the service provided by the JAR.
 *
 * - "Classes" are defined as compiled Java classes, with the `.class` file extension. Classes can be situated anywhere
 *   within the JAR root; they are structured in a nested hierarchical directory structure that mirrors the package
 *   declaration of the compiled class.
 *
 * - "Resources" are defined as non-class files of any sort; resources can technically live anywhere within the JAR,
 *   but most of the time they live under the `META-INF` directory somewhere other than `services`.
 *
 * - "Executable JARs" are JARs which declare a main class in their manifest, via the `Main-Class` attribute. Such JARs
 *   can be run directly by the `java -jar` command.
 *
 * - "Multi-release JARs" ("MRJARs") can contain compiled classes for multiple Java versions as well as classes held at
 *   the root of the JAR. Classes are loaded at the highest supported bytecode level by the runtime.
 *
 * - "Modular JARs" are JAR files which include a `module-info.class` definition, either at the root of the JAR, or at
 *   the root of an MRJAR versioned class directory (for example, `META-INF/versions/9/module-info.class`).
 *
 * - "Multi-modular JARs" ("MMJARs") follow all of the above rules, but can contain multiple `module-info.class` files,
 *   with progressively upgrading versions, located in MRJAR class roots (`META-INF/versions/21/module-info.class`).
 *
 * This class provides a high-level interface for reading JAR data and parsing a JAR's manifest and module information.
 * Archives are read and de-compressed lazily, and class files are parsed on-demand to satisfy calls.
 *
 * @see fromData To create a JAR file from a data buffer
 * @see fromFile To create a JAR file from a file path
 */
export class JarFile implements JarManifestBaseline {
  /**
   * Primary constructor.
   *
   * @param _options Reader options
   * @param _zip Handle to a streamed/lazily decompressed JAR zip file
   * @param _entries Entries in the JAR
   * @param _manifest Optional manifest to include in the JAR
   */
  private constructor(
    private readonly _options: JarReaderOptions,
    private readonly _entries: Map<string, DeferredJarEntry>,
    private readonly _entryIndex: Map<JarEntryType, string[]>,
    private readonly _manifest: JarManifestApi | null
  ) {}

  // Retrieve a list of JAR entries of a specific type.
  private entriesOfType(type: JarEntryType): string[] {
    return this._entryIndex.get(type) || []
  }

  // Walk the contents of the managed JAR file.
  private async *contents(): AsyncIterable<JarEntry> {
    for (const entry of this._entries.values()) {
      yield await entry.entry()
    }
  }

  // Decide whether a JAR entry is eligible for consideration.
  private eligible(options: JarEntryIterableOptions, file: JarEntry): boolean {
    return (
      options.predicate.length === 0 ||
      options.predicate.some(pred =>
        pred({
          name: file.path,
          compression: JarCompression.IDENTITY // @TODO
        })
      )
    )
  }

  /**
   * Reader options
   */
  public get options(): JarReaderOptions {
    return this._options
  }

  /**
   * Interpreted JAR manifest
   *
   * @return Promise for a manifest
   */
  public get manifest(): JarManifestApi | null {
    return this._manifest || null
  }

  /**
   * Whether this JAR is a `Multi-Release` JAR
   *
   * @return Promise for `Multi-Release` status
   */
  public get multiRelease(): boolean {
    return this.manifest?.multiRelease || false
  }

  /**
   * Whether this JAR is modular
   *
   * @return Promise for modular status
   */
  public get modular(): Promise<boolean> {
    return Promise.resolve(this.entriesOfType(JarEntryType.MODULE).length > 0)
  }

  /**
   * Module info for this JAR
   *
   * @return Promise for module info
   */
  public get moduleInfo(): Promise<JavaModuleInfo> {
    if (!this.modular) throw new Error('not a modular JAR')
    const moduleDefs = this.entriesOfType(JarEntryType.MODULE)
    const main = moduleDefs.find(path => !path.includes('META-INF/versions/'))
    const target = main || moduleDefs.at(0)
    if (!target) {
      console.error('no usable module definition', moduleDefs, this._entryIndex[JarEntryType.MODULE])
      throw new Error('no usable module definition found')
    }

    return new Promise(async (accept, reject) => {
      try {
        const mainDef = (await (this._entries.get(target) as DeferredJarEntry).entry()) as JarModuleEntry
        mainDef.moduleInfo().then(accept).catch(reject)
      } catch (err) {
        reject(err)
      }
    })
  }

  /** @inheritdoc */
  public get manifestVersion(): string | null {
    return this.manifest?.manifestVersion || null
  }

  /** @inheritdoc */
  public get mainClass(): QualifiedClassName | null {
    return this.manifest?.mainClass || null
  }

  /** @inheritdoc */
  public get automaticModuleName(): string | null {
    return this.manifest?.automaticModuleName || null
  }

  /**
   * Retrieve the value for a key in the JAR's manifest, or `null` if no such key is present.
   *
   * @param key Key to retrieve from this JAR's manifest
   * @returns Value associated with the key, or `null`
   */
  public async manifestValue(key: JarManifestKeyString): Promise<string | null> {
    return this.manifest?.get(key) || null
  }

  /**
   * Obtain a JAR entry at a specific path, or `null` if none exists.
   * @param path Path to the entry to retrieve
   * @return JAR entry at that path, or `null`
   */
  public async entryAtPath(path: string): Promise<JarEntry | null> {
    return this._entries.get(path) || null
  }

  /**
   * Obtain a comiled class from the JAR entry at a specific path, or `null` if none exists.
   *
   * @param name Qualified name of the class to retrieve
   * @return JAR class entry at that path, or `null`
   */
  public async classAtName(name: string): Promise<JarEntry | null> {
    if (!name.includes('.')) throw new Error('invalid class name (must be qualified): ' + name)
    const stanza = this._entries.get(qualifiedClassToJarPath(name))
    if (stanza) {
      if (stanza.type === JarEntryType.CLASS) return stanza
      throw new Error(`entry is not a class: ${name} (type: ${stanza.type})`)
    }
    return null
  }

  /**
   * Create an empty JAR builder.
   *
   * @return Empty JAR builder.
   */
  static builder(): JarBuilder {
    return new JarBuilder()
  }

  /**
   * Create a JAR file from raw contents.
   *
   * @param entries Entries in the JAR
   * @param manifest Optional manifest to include in the JAR
   * @return JAR file instance
   */
  static fromRaw(entries: JarEntry[], manifest?: JarManifest, options?: JarReaderOptions): JarFile {
    const opts = readerOptions(options)
    const entryIndex = new Map<JarEntryType, string[]>()
    const map: Map<string, DeferredJarEntry> = new Map()

    for (const entry of entries) {
      const type = identifyEntry(entry.path)
      if (!entryIndex.has(type)) entryIndex.set(type, [])
      ;(entryIndex.get(type) as string[]).push(entry.path)

      map.set(entry.path, {
        path: entry.path,
        type,
        entry: () => Promise.resolve(entry),
        data: () =>
          Promise.resolve({
            name: entry.path,
            read: async () => await (await entry.data()).read()
          })
      })
    }
    return new JarFile(opts, map, entryIndex, manifest || null)
  }

  /**
   * Read a JAR file from the provided data buffer
   *
   * @param data Buffer of JAR file data
   * @param options Optional reader options to apply to the operation
   * @return JAR file instance
   */
  static async fromData(data: Buffer, options?: JarReaderOptions): Promise<JarFile> {
    const opts = readerOptions(options)
    const { manifest, entries, entryIndex } = await inflateFromZip(readZipFromData(data, buildPredicate(opts)))
    return new JarFile(opts, entries, entryIndex, manifest || null)
  }

  /**
   * Read a JAR file from the provided path on-disk
   *
   * @param path Path to the JAR file
   * @param options Optional reader options to apply to the operation
   * @return JAR file instance
   */
  static async fromFile(path: string, options?: JarReaderOptions): Promise<JarFile> {
    const opts = readerOptions(options)
    const fs = await import('fs/promises')
    const { manifest, entries, entryIndex } = await inflateFromZip(
      readZipFromData(await fs.readFile(path), buildPredicate(opts))
    )
    return new JarFile(opts, entries, entryIndex, manifest || null)
  }

  /**
   * Efficiently decompress and iterate over entries in the JAR matching the provided optional criteria.
   *
   * @param options Options governing how the iterator should behave.
   * @return Async iterable which produces JAR entries.
   */
  public async *entries(options?: JarEntryIterableOptions): AsyncIterable<JarEntry> {
    const opts: JarEntryIterableOptions = {
      ...defaultEntryIterableOptions,
      ...(options || {})
    }

    for await (const entry of this.contents()) {
      if (this.eligible(opts, entry)) {
        yield entry
      }
    }
  }
}

/**
 * Build a JAR resource record.
 *
 * @param path Path to the resource within the JAR
 * @param data Data for the resource
 * @return JAR resource entry
 */
export function jarResource(path: string, data?: Buffer, compression?: JarCompression): JarResource {
  return {
    path,
    size: data?.length || 0,
    compression: compression || JarCompression.IDENTITY,
    data: () =>
      Promise.resolve({
        name: path,
        read: async () => (data ? data : Buffer.alloc(0))
      })
  }
}

/**
 * Build a JAR class entry.
 *
 * @param name Qualified name of the built class within the JAR
 * @param data Serialized or loaded class data for the class
 * @return JAR class entry
 */
export function jarClass(name: QualifiedClassName, data: Buffer): JarClassEntry {
  return {
    qualifiedName: name,
    simpleName: qualifiedNameToSimpleName(name),
    path: qualifiedClassToJarPath(name),
    data: () =>
      Promise.resolve({
        name: qualifiedClassToJarPath(name),
        read: async () => data
      }),
    classfile: () => {
      return new Promise(async (accept, reject) => {
        try {
          accept(JavaClassFile.fromData(data))
        } catch (err) {
          reject(err)
        }
      })
    }
  }
}

/**
 * Build a JAR service mapping entry.
 *
 * @param name Qualified name of the service interface
 * @param compression Compression to use for the entry
 * @param impl Implementation classes to include (optional)
 * @return JAR service entry
 */
export function jarService(name: QualifiedClassName, ...impl: string[]): JarServiceEntry {
  return {
    path: `META-INF/services/${name}`,
    service: name,
    impls: impl,
    data: () =>
      Promise.resolve({
        name: `META-INF/services/${name}`,
        read: async () => Buffer.from(impl.join('\n'))
      })
  }
}

/**
 * Utility to obtain a JAR manifest builder
 *
 * @returns JAR manifest builder
 */
export function jarManifest(): JarManifestBuilder {
  return JarManifest.builder()
}

// Default entrypoint.
export default JarFile
