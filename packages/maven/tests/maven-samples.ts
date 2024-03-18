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

export const POM_CONTENT_PARENT = (
    '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
    '    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">' +
    '  <parent>' +
    '    <artifactId>example-parent</artifactId>' +
    '    <groupId>org.example</groupId>' +
    '    <version>0.0.1</version>' +
    '  </parent>' +
    '  <modelVersion parallel="now">4.0.0</modelVersion>'+
    '  <groupId>org.example</groupId>' +
    '  <artifactId>example</artifactId>' +
    '  <version>0.0.1-SNAPSHOT</version>' +
    '  <packaging>pom</packaging>' +
    '  <name>Some Example Library</name>' +
    '</project>'
);

export const POM_CONTENT_NO_PARENT = (
    '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
    '    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">' +
    '  <modelVersion parallel="now">4.0.0</modelVersion>'+
    '  <groupId>org.example</groupId>' +
    '  <artifactId>example</artifactId>' +
    '  <version>0.0.1-SNAPSHOT</version>' +
    '  <packaging>pom</packaging>' +
    '  <name>Some Example Library</name>' +
    '</project>'
);

export const POM_CONTENT_PARENT_INHERITED = (
    '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
    '    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">' +
    '  <parent>' +
    '    <artifactId>example-parent</artifactId>' +
    '    <groupId>org.example</groupId>' +
    '    <version>0.0.1</version>' +
    '  </parent>' +
    '  <modelVersion parallel="now">4.0.0</modelVersion>'+
    '  <artifactId>example</artifactId>' +
    '  <packaging>pom</packaging>' +
    '  <name>Some Example Library</name>' +
    '</project>'
);
