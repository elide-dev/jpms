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

import JarFile from '../dist/java-jar.js'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { resolve, normalize, join, dirname } from 'node:path'

const count = process.argv.length > 2 ? parseInt(process.argv[3]) : 50
console.log('runs:', count)
const start = performance.now()

export function repoPath(path) {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  return resolve(normalize(join(__dirname, '..', '..', '..', 'repository', path)))
}

export function repoJar(group, artifact, version) {
  const pathSegments = []
  const groupSegments = group.split('.')
  pathSegments.push(...groupSegments)
  pathSegments.push(artifact)
  pathSegments.push(version)
  pathSegments.push(`${artifact}-${version}.jar`)
  return repoJarByPath(join(...pathSegments))
}

const { resolved } = repoJar('com.google.guava', 'guava', '33.0.0-jre-jpms')

export function repoJarByPath(path) {
  return {
    resolved: repoPath(path),
    relative: path
  }
}

async function inflateGuavaJar() {
  return await JarFile.fromFile(resolved)
}

// inflate the jar 1000 times
console.log('starting')

async function* parseJars() {
  for (let i = 0; i < count; i++) {
    console.log('running', i)
    yield async () => {
      const start = performance.now()
      await inflateGuavaJar()
      const end = performance.now()
      return end - start
    }
  }
}

function blackhole(_jar) {
  // do nothing
}

let done = 0
let promises = []
for await (const jar of parseJars()) {
  console.log('started', 1)
  promises.push(
    jar().then(latency => {
      done++
      console.log('finished', done, Math.round(latency) + 'ms')
      blackhole(jar)
    })
  )
}

await Promise.all(promises)
const end = performance.now()
console.info('done: ', Math.round((end - start) / 1000) + 's')
