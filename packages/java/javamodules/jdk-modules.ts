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
 * Built-in Java Modules
 *
 * Modules within the `java.*` namespace are "built-in" to the language.
 */
export enum BuiltinModule {
    JAVA_BASE = 'java.base',
    JAVA_COMPILER = 'java.compiler',
    JAVA_DATATRANSFER = 'java.datatransfer',
    JAVA_DESKTOP = 'java.desktop',
    JAVA_INSTRUMENT = 'java.instrument',
    JAVA_LOGGING = 'java.logging',
    JAVA_MANAGEMENT = 'java.management',
    JAVA_MANAGEMENT_RMI = 'java.management.rmi',
    JAVA_NAMING = 'java.naming',
    JAVA_NET_HTTP = 'java.net.http',
    JAVA_PREFS = 'java.prefs',
    JAVA_RMI = 'java.rmi',
    JAVA_SCRIPTING = 'java.scripting',
    JAVA_SE = 'java.se',
    JAVA_SECURITY_JGSS = 'java.security.jgss',
    JAVA_SECURITY_SASL = 'java.security.sasl',
    JAVA_SMARTCARDIO = 'java.smartcardio',
    JAVA_SQL = 'java.sql',
    JAVA_SQL_ROWSET = 'java.sql.rowset',
    JAVA_TRANSACTION_XA = 'java.transaction.xa',
    JAVA_XML = 'java.xml',
    JAVA_XML_CRYPTO = 'java.xml.crypto',
}

/**
 * JDK Modules
 *
 * Modules within the `jdk.*` namespace are JDK-only.
 */
export enum JdkModule {
    JDK_ACCESSIBILITY = 'jdk.accessibility',
    JDK_ATTACH = 'jdk.attach',
    JDK_CHARSETS = 'jdk.charsets',
    JDK_COMPILER = 'jdk.compiler',
    JDK_CRYPTO_CRYPTOKI = 'jdk.crypto.cryptoki',
    JDK_CRYPTO_EC = 'jdk.crypto.ec',
    JDK_DYNALINK = 'jdk.dynalink',
    JDK_EDITPAD = 'jdk.editpad',
    JDK_HOTSPOT_AGENT = 'jdk.hotspot.agent',
    JDK_HTTPSERVER = 'jdk.httpserver',
    JDK_INCUBATOR_VECTOR = 'jdk.incubator.vector',
    JDK_JARTOOL = 'jdk.jartool',
    JDK_JAVADOC = 'jdk.javadoc',
    JDK_JCMD = 'jdk.jcmd',
    JDK_JCONSOLE = 'jdk.jconsole',
    JDK_JDEPS = 'jdk.jdeps',
    JDK_JDI = 'jdk.jdi',
    JDK_JDWP_AGENT = 'jdk.jdwp.agent',
    JDK_JFR = 'jdk.jfr',
    JDK_JLINK = 'jdk.jlink',
    JDK_JPACKAGE = 'jdk.jpackage',
    JDK_JSHELL = 'jdk.jshell',
    JDK_JSOBJECT = 'jdk.jsobject',
    JDK_JSTATD = 'jdk.jstatd',
    JDK_LOCALEDATA = 'jdk.localedata',
    JDK_MANAGEMENT = 'jdk.management',
    JDK_MANAGEMENT_AGENT = 'jdk.management.agent',
    JDK_MANAGEMENT_JFR = 'jdk.management.jfr',
    JDK_NAMING_DNS = 'jdk.naming.dns',
    JDK_NAMING_RMI = 'jdk.naming.rmi',
    JDK_NET = 'jdk.net',
    JDK_NIO_MAPMODE = 'jdk.nio.mapmode',
    JDK_SCTP = 'jdk.sctp',
    JDK_SECURITY_AUTH = 'jdk.security.auth',
    JDK_SECURITY_JGSS = 'jdk.security.jgss',
    JDK_XML_DOM = 'jdk.xml.dom',
    JDK_ZIPFS = 'jdk.zipfs',
    JDK_UNSUPPORTED = 'jdk.unsupported',
}
