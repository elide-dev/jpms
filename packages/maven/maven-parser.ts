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

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2015 Intuit Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * This file is inlined from the `pom-parser` NPM module, which is four years out-of-date at the time of this writing.
 * The module is licensed under MIT, so both licenses are included above. The library code and tests are dual-licensed:
 * both MIT, with the original under Intuit's ownership, and extensions under Elide's ownership.
 */

import { readFile as readFileAsync } from 'node:fs/promises';
import xml2js, { Options as XmlParseOptions } from 'xml2js'
import traverse from 'traverse'

export type { XmlParseOptions }

// xmljs options https://github.com/Leonidas-from-XIV/node-xml2js#options
let XML2JS_OPTS = {
  trim: true,
  normalizeTags: true,
  normalize: true,
  mergeAttrs: true
}

export type PomProject = Record<string, any>

export type PomObject = {
  project: PomProject
} & {
  [key: string]: string
}

export interface ParsedOutput {
  pomXml: string
  pomObject: PomObject
  xmlContent?: string
}

/**
 * Options for the parser, with XML parsing options available as well.
 */
export type ParseOptions = (XmlParseOptions & { filePath?: string; xmlContent?: string }) | null

/**
 * Callback type for the parser.
 */
export type ParseCallback = (err: Error | null, result?: ParsedOutput | null) => void

const checkEmpty = (value: string | null | undefined): string => {
  if (!!value) return value
  throw new Error('Cannot parse empty or invalid XML')
}

/**
 * This method exposes an `async/await` syntax to the older `parse` method and allows you to call the method with just
 * one argument.
 *
 * @param {ParseOptions} opt the options to be used for parsing
 * @returns {Promise<ParsedOutput>} a `Promise` that holds the parsed output
 */
export async function parseAsync(opt: ParseOptions): Promise<ParsedOutput> {
  if (!opt)
    throw new Error(
      'You must provide options: opt.filePath and any other option of ' +
        'https://github.com/Leonidas-from-XIV/node-xml2js#options'
    )
  if (!opt.xmlContent && !opt.filePath) throw new Error('You must provide the opt.filePath or the opt.xmlContent')

  if (opt.filePath) {
    const xmlContent = checkEmpty(await readFileAsync(opt.filePath, 'utf8'))
    const result = await _parseWithXml2js(xmlContent)
    return result
  }

  const result = await _parseWithXml2js(checkEmpty(opt.xmlContent || ''))
  delete result.xmlContent
  return result
}

/**
 * Parses xml into javascript object by using a file path or an xml content.
 * @param {object} opt Is the option with the filePath or xmlContent and the optional format.
 * @return {object} The pom object along with the timers.
 */
function parse(opt: ParseOptions, callback: ParseCallback): void {
  if (!opt)
    throw new Error(
      'You must provide options: opt.filePath and any other option of ' +
        'https://github.com/Leonidas-from-XIV/node-xml2js#options'
    )

  if (!opt.xmlContent && !opt.filePath) throw new Error('You must provide the opt.filePath or the opt.xmlContent')

  // If the xml content is was not provided by the api client.
  // https://github.com/petkaantonov/bluebird/blob/master/API.md#error-rejectedhandler----promise
  if (opt.filePath) {
    readFileAsync(opt.filePath, 'utf8')
      .then(function (xmlContent) {
        return checkEmpty(xmlContent)
      })
      .then(_parseWithXml2js)
      .then(
        function (result) {
          callback(null, result)
        },
        function (e) {
          callback(e, null)
        }
      )
  } else if (opt.xmlContent) {
    // parse the xml provided by the api client.
    _parseWithXml2js(checkEmpty(opt.xmlContent))
      .then(function (result) {
        delete result.xmlContent
        callback(null, result)
      })
      .catch(function (e) {
        callback(e)
      })
  }
}

/**
 * Parses the given xml content.
 * @param xmlContent {string} Is the xml content in string using utf-8 format.
 * @param loadedXml {boolean} Whether the xml was loaded from the file-system.
 * @param callback {function} The callback function using Javascript PCS.
 */
function _parseWithXml2js(xmlContent: string): Promise<ParsedOutput> {
  return new Promise(function (resolve, reject) {
    // parse the pom, erasing all
    xml2js.parseString(xmlContent, XML2JS_OPTS, function (err, pomObject) {
      if (err) {
        // Reject with the error
        reject(err)
      }

      // Replace the arrays with single elements with strings
      removeSingleArrays(pomObject)

      // Response to the call
      resolve({
        pomXml: xmlContent, // Only add the pomXml when loaded from the file-system.
        pomObject: pomObject // Always add the object
      })
    })
  })
}

/**
 * Removes all the arrays with single elements with a string value.
 * @param {object} o is the object to be traversed.
 */
function removeSingleArrays(obj: Object): void {
  // Traverse all the elements of the object
  traverse(obj).forEach(function traversing(value) {
    // As the XML parser returns single fields as arrays.
    if (value instanceof Array && value.length === 1) {
      this.update(value[0])
    }
  })
}

export default parse
