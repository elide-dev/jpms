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

import { MavenCoordinate } from "./maven-model";

/**
 * Maven Project
 *
 * Describes the API provided by a parsed/interpreted Maven Project.
 */
export interface MavenProject {
  /** Top-level name of the project (note that this differs from the artifact ID). */
  name: string | undefined;

  /** Description provided by the developers for this project. */
  description: string | undefined;

  /** Coordinate for this project. */
  coordinate: MavenCoordinate;

  /** Parent project coordinate relating to this one, if present. */
  parent: MavenCoordinate | undefined;
}

/**
 * Parsed Maven Project
 *
 * Implements the `MavenProject` interface, backed by the raw output of parsing a Maven POM; accessors are provided for
 * various project details, dependency mappings, and other metadata.
 *
 * Generally speaking, this class' job is to traverse the raw object output yielded by parsing the POM, and to turn it
 * into sensible, type-uniform values. For example, the `<dependencies>` block in a POM will come through as an array
 * in most cases; when there is only one dependency, though, it will come through as a single object. This class
 * accounts for these sorts of differences.
 *
 * This class is not responsible for any sort of validation or verification of the POM.
 *
 * JSON serialization is supported by this class; serializing a parsed Maven project yields a raw JSON structure, which
 * can be re-inflated via the `fromSerialized` method. The output structure emitted during JSON serialization is
 * identical to the output of `serialize`.
 */
export class ParsedMavenProject implements MavenProject {
  /** {@inheritdoc} */
  public get name(): string | undefined {
    throw new Error('not yet implemented')
  }

  /** {@inheritdoc} */
  public get description(): string | undefined {
    throw new Error('not yet implemented')
  }

  /** {@inheritdoc} */
  public get coordinate(): MavenCoordinate {
    throw new Error('not yet implemented')
  }

  /** {@inheritdoc} */
  public get parent(): MavenCoordinate | undefined {
    throw new Error('not yet implemented')
  }
}

// Default entrypoint.
export default ParsedMavenProject;
