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

import { globSync } from "glob";
import { existsSync } from "node:fs";
import { readdir, stat, mkdir } from "node:fs/promises";
import { join, resolve, sep, dirname, basename } from "node:path";

import { MavenCoordinate, mavenCoordinate } from "@javamodules/maven";
import { GradleModuleInfo } from "@javamodules/gradle";
import { gradleModule } from "@javamodules/gradle/util";

import { RepositoryPackage, RepositoryIndexBundle, RepositoryIndexFile } from "./indexer-model.mjs";

function repositoryPackage(
  root: string,
  maven: MavenCoordinate,
  pom: string,
  gradle?: GradleModuleInfo,
): RepositoryPackage {
  return {
    maven,
    root,
    pom,
    gradle,
    valueOf: function () {
      return `${pom} (${maven})`;
    },
  };
}

function coordinateForPomPath(prefix: string, path: string) {
  if (!path.startsWith(prefix))
    throw new Error(`Cannot generate coordinate for path '${path}' which is not under prefix '${prefix}'`);

  // like `/.../jpms/repository/org/reactivestreams/reactive-streams/1.0.5-jpms/reactive-streams-1.0.5-jpms.pom`
  const trimmed = path.slice(prefix.length + 1);
  const segments = trimmed.split(sep);

  // like `reactive-streams-1.0.5-jpms.pom`
  const pomName = segments[segments.length - 1];

  // like `org/reactivestreams/reactive-streams/1.0.5-jpms`
  const coordinateTarget = trimmed.slice(0, trimmed.length - 1 - pomName.length);
  const coordinateSegments = coordinateTarget.split(sep);

  // like `1.0.5-jpms`
  const versionString = coordinateSegments[coordinateSegments.length - 1];

  // like `reactive-streams`
  const artifactId = coordinateSegments[coordinateSegments.length - 2];

  // like ['org', 'reactivestreams']
  const groupSegments = coordinateSegments.slice(0, coordinateSegments.length - 2);

  return mavenCoordinate(groupSegments.join("."), artifactId, versionString);
}

async function buildPackages(prefix: string, path: string) {
  const found: RepositoryPackage[] = [];
  const pathPoms = globSync(join(path, "**", "*.pom"));
  for (const pomPath of pathPoms) {
    const coordinate = coordinateForPomPath(prefix, pomPath);
    console.log(`- Scanning POM '${coordinate.valueOf()}'`);
    found.push(repositoryPackage(path, coordinate, pomPath, await gradleModule(dirname(pomPath), basename(pomPath))));
  }
  return found;
}

async function buildRootPackage(prefix: string, path: string): Promise<RepositoryPackage[]> {
  const filestat = await stat(path);
  if (!filestat.isDirectory()) return []; // we are only processing directory roots

  const target = resolve(path);
  return await buildPackages(prefix, target);
}

// @ts-ignore
function buildIndexes(all_packages: RepositoryPackage[]): RepositoryIndexBundle {
  // @TODO build indexes
  return {
    artifacts: [],
    modules: [],
  };
}

// @ts-ignore
async function prepareContent(indexes: RepositoryIndexBundle): Promise<RepositoryIndexFile[]> {
  return [];
}

// @ts-ignore
async function writeIndexFile(write: RepositoryIndexFile) {}

async function writeIndexes(outpath: string, all_packages: RepositoryPackage[]) {
  const resolvedOut = resolve(outpath);
  if (!existsSync(resolvedOut)) {
    await mkdir(resolvedOut, { recursive: true });
  }
  const indexes = buildIndexes(all_packages);
  const writes = await prepareContent(indexes);
  for (const write of writes) {
    await writeIndexFile(write);
  }
}

/**
 * Build indexes for a Maven repository.
 *
 * @param path Path to the repository
 * @param outpath Output path (directory) for generated index files
 */
export async function buildRepositoryIndexes(path: string, outpath: string) {
  const prefix = resolve(path);
  console.log(`Scanning repository '${prefix}'...`);
  let all_packages: RepositoryPackage[] = [];
  try {
    const files = await readdir(path);
    for (const file of files) {
      all_packages = all_packages.concat(await buildRootPackage(prefix, join(path, file)));
    }
  } catch (err) {
    console.error(err);
  }

  writeIndexes(outpath, all_packages);
}

// argument expected is path to repository
await buildRepositoryIndexes(process.argv[2] || join("..", "..", "repository"), "./indexes");
