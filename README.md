<br />
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/img/modular-java-banner-txdark-md.png">
    <img height=300 alt="Java Modules" src="./assets/img/modular-java-banner-txlight-md.png">
  </picture>
</p>
<br />
<p align="center">
<img src="https://img.shields.io/badge/Java%209%2B-white?logoColor=F80000&logo=oracle" alt="Modular Java" />
<img src="https://img.shields.io/badge/Works%20with%20Kotlin-7F52FF?logoColor=white&logo=kotlin" alt="Kotlin" />
<img src="https://img.shields.io/badge/Works%20with%20Bazel-43A047?logoColor=white&logo=bazel" alt="Bazel" />
<img src="https://img.shields.io/badge/Works%20with%20Gradle-02303A?logoColor=white&logo=gradle" alt="Gradle" />
<img src="https://img.shields.io/badge/Works%20with%20Maven-C71A36?logoColor=white&logo=apache-maven" alt="Maven" />
</p>
<p align="center">
<img src="https://github.com/elide-dev/jpms/actions/workflows/on.push.yml/badge.svg" alt="Build status" />
<img src="https://img.shields.io/github/license/elide-dev/jpms?label=License&labelColor=white" alt="Apache 2.0 License" />
<a href="https://elide.dev/discord"><img src="https://img.shields.io/discord/1119121740161884252?b1&label=Discord&logo=discord&labelColor=white" /></a>
</p>
<br />

# JPMS Attic Repository

> Latest Release: `1.0.8`

- [GitHub Repo](https://github.com/javamodules/attic)
- [Docs](https://javamodules.dev)

This repository provides sub-module library overrides for popular Java libraries which don't yet provide JPMS support
(at least until some PRs are merged!). There is a Maven repository which contains these artifacts, too, so you can
safely use them in your projects.

#### Pending PRs

Tracking issue [here][6] provides the best tracker. Once these PRs are merged and changes are released, this repo
becomes obsolete.

### What's in the box?

- **[`com.google.errorprone`][2]:** **Error Prone Compiler** "is a static analysis tool for Java that catches common
  programming mistakes at compile time," built by Google. Error Prone's annotations module is JPMS-enabled at the
  embedded sub-module, and is used by Guava. The [PR enabling JPMS support in Error Prone Annotations][3] has been
  filed, merged, and released, as [`2.26.1`](https://github.com/google/error-prone/releases/tag/v2.26.1).

- **[`com.google.guava`][11]:** **Google Guava** is Google's core Java commons, used throughout Google's code and the
  wider JVM ecosystem. Guava is an immensely popular artifact, with tons of fantastic utilities. JPMS support is [in
  draft][12].

- **[`com.google.j2objc`][4]:** **J2ObjC** is a Java to Objective-C cross-compiling layer used by Google to effectively
  share Java logic on iOS and macOS platforms. J2ObjC itself is very complex and powerful, but here we have just
  JPMS-enabled the `annotations` module, which is used by Guava. The [PR enabling JPMS support for J2ObjC
  annotations][5] has been filed, merged, and released as
  [`3.0.0`](https://github.com/google/j2objc/commit/a883dd3f90d51d5ccad4aa3af8feaaeed6560109).

- **[`com.google.protobuf`][4]:** **Protocol Buffers** (a.k.a., protobuf) are Google's language-neutral,
  platform-neutral, extensible mechanism for serializing structured data. JPMS support is [in draft][17].

- **[`io.leangen.geantyref`][18]:** **Geantyref** is a fork of the excellent GenTyRef library, adding support for
  working with AnnotatedTypes introduced in Java 8 plus many nifty features. JPMS support has been [proposed][19], but
  not yet merged or released.

- **[`kotlinx.collections.immutable`][20]:** **KotlinX Immutable Collections** is a library provided as part of the
  _Kotlin Extensions_ suite, maintained by the JetBrains team. It provides immutable and persistent collection types in
  Kotlin. JPMS support is in [draft][21], but not yet merged or released.

- **[`org.apache.maven.resolver`][22]:** **Maven Resolver** is how Maven and many other build tools resolve graphs of
  dependencies, and perform downloads of dependency artifacts. JPMS support is in early draft; no PR has been filed yet.

- **[`org.checkerframework`][0]:** **Checker Framework** is a type-checking framework for Java. The `checker-qual`
  package is used by Guava, so it is included here transitively. Checker Framework added a JPMS module definition in a
  [recent PR][1], so this is sub-moduled at `master`. At the time of this writing no release has taken place.

- **[`org.reactivestreams`][16]:** **Reactive Streams** is a universal JVM API for building reactive software in an
  implementation-agnostic manner.

### How do I use it?

Add this domain as a repository within any JVM build tool: [Maven][7], [Gradle][8], [Bazel][9], [sbt][10]. For example:

> [!NOTE]
> **Filing issues:** Please file issues for this repo on [`elide-dev/jpms`](https://github.com/elide-dev/jpms/issues).

#### Maven

**In a `pom.xml`:**

```xml
<repositories>
  <repository>
    <id>jpms-attic</id>
    <name>JPMS Attic</name>
    <url>https://jpms.pkg.st/repository</url>
  </repository>
</repositories>
```

**In a `settings.xml`:**

```xml
<profiles>
  <profile>
    <id>jpms-attic</id>
    <activation>
      <activeByDefault>true</activeByDefault>
    </activation>
    <repositories>
      <repository>
        <id>pkgst-jpms</id>
        <name>Pkgst JPMS</name>
        <url>https://jpms.pkg.st/repository</url>
      </repository>
    </repositories>
  </profile>
</profiles>
```

#### Gradle

##### Groovy

```groovy
repositories {
    maven {
        url "https://jpms.pkg.st/repository"
    }
}
```

##### Kotlin

```kotlin
repositories {
    maven {
        url = uri("https://jpms.pkg.st/repository")
    }
}
```

### Libraries

You should use a JPMS-enabled library version which has no conflict with Maven Central. Reference the table below to
pick a library.

**Libraries marked `Central` have seen releases in Maven Central,** and so are no longer needed through this repository.

| Coordinate                                                     | Version                                                                                                                                                                                                                                            |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `com.google.errorprone:error_prone_annotations`                | ![Central](https://img.shields.io/maven-central/v/com.google.errorprone/error_prone_annotations?label=Central&labelColor=blue)                                                                                                                     |
| `com.google.guava:guava`                                       | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fcom%2Fgoogle%2Fguava%2Fguava%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)                                         |
| `com.google.j2objc:j2objc-annotations`                         | ![Central](https://img.shields.io/maven-central/v/com.google.j2objc/j2objc-annotations?label=Central&labelColor=blue)                                                                                                                              |
| `com.google.protobuf:protobuf-java`                            | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fcom%2Fgoogle%2Fprotobuf%2Fprotobuf-java%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)                              |
| `com.google.protobuf:protobuf-javalite`                        | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fcom%2Fgoogle%2Fprotobuf%2Fprotobuf-javalite%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)                          |
| `com.google.protobuf:protobuf-util`                            | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fcom%2Fgoogle%2Fprotobuf%2Fprotobuf-util%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)                              |
| `com.google.protobuf:protobuf-kotlin`                          | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fcom%2Fgoogle%2Fprotobuf%2Fprotobuf-kotlin%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)                            |
| `com.google.protobuf:protobuf-kotlin-lite`                     | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fcom%2Fgoogle%2Fprotobuf%2Fprotobuf-kotlin-lite%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)                       |
| `io.leangen.geantyref:geantyref`                               | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fio%2Fleangen%2Fgeantyref%2Fgeantyref%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)                                 |
| `org.apache.maven.resolver:maven-resolver-api`                 | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Fapache%2Fmaven%2Fresolver%2Fmaven-resolver-api%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)                 |
| `org.apache.maven.resolver:maven-resolver-connector-basic`     | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Fapache%2Fmaven%2Fresolver%2Fmaven-resolver-connector-basic%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)     |
| `org.apache.maven.resolver:maven-resolver-generator-gnupg`     | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Fapache%2Fmaven%2Fresolver%2Fmaven-resolver-generator-gnupg%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)     |
| `org.apache.maven.resolver:maven-resolver-impl`                | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Fapache%2Fmaven%2Fresolver%2Fmaven-resolver-impl%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)                |
| `org.apache.maven.resolver:maven-resolver-named-locks`         | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Fapache%2Fmaven%2Fresolver%2Fmaven-resolver-named-locks%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)         |
| `org.apache.maven.resolver:maven-resolver-spi`                 | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Fapache%2Fmaven%2Fresolver%2Fmaven-resolver-spi%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)                 |
| `org.apache.maven.resolver:maven-resolver-transport-classpath` | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Fapache%2Fmaven%2Fresolver%2Fmaven-resolver-transport-classpath%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black) |
| `org.apache.maven.resolver:maven-resolver-transport-file`      | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Fapache%2Fmaven%2Fresolver%2Fmaven-resolver-transport-file%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)      |
| `org.apache.maven.resolver:maven-resolver-transport-jdk`       | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Fapache%2Fmaven%2Fresolver%2Fmaven-resolver-transport-jdk%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)       |
| `org.apache.maven.resolver:maven-resolver-transport-jetty`     | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Fapache%2Fmaven%2Fresolver%2Fmaven-resolver-transport-jetty%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)     |
| `org.apache.maven.resolver:maven-resolver-util`                | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Fapache%2Fmaven%2Fresolver%2Fmaven-resolver-util%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)                |
| `org.checkerframework:checker-qual`                            | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Fcheckerframework%2Fchecker-qual%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)                                |
| `org.jetbrains.kotlinx:kotlinx-collections-immutable`          | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Fjetbrains%2Fkotlinx%2Fkotlinx-collections-immutable%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)            |
| `org.reactivestreams:reactive-streams`                         | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Freactivestreams%2Freactive-streams%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)                             |

### Using the modules

Use the modules in your `module-info.java`:

| Coordinate                                                     | Module                                          |
| -------------------------------------------------------------- | ----------------------------------------------- |
| `com.google.errorprone:error_prone_annotations`                | `com.google.errorprone.annotations`             |
| `com.google.guava:guava`                                       | `com.google.common`                             |
| `com.google.j2objc:j2objc-annotations`                         | `com.google.j2objc.annotations`                 |
| `com.google.protobuf:protobuf-java`                            | `com.google.protobuf`                           |
| `com.google.protobuf:protobuf-javalite`                        | `com.google.protobuf`                           |
| `com.google.protobuf:protobuf-util`                            | `com.google.protobuf.util`                      |
| `com.google.protobuf:protobuf-kotlin`                          | `com.google.protobuf.kotlin`                    |
| `com.google.protobuf:protobuf-kotlin-lite`                     | `com.google.protobuf.kotlin`                    |
| `io.leangen.geantyref:geantyref`                               | `io.leangen.geantyref`                          |
| `org.apache.maven.resolver:maven-resolver-api`                 | `org.apache.maven.resolver`                     |
| `org.apache.maven.resolver:maven-resolver-connector-basic`     | `org.apache.maven.resolver.connector.basic`     |
| `org.apache.maven.resolver:maven-resolver-generator-gnupg`     | `org.apache.maven.resolver.generator.gnupg`     |
| `org.apache.maven.resolver:maven-resolver-impl`                | `org.apache.maven.resolver.impl`                |
| `org.apache.maven.resolver:maven-resolver-named-locks`         | `org.apache.maven.resolver.named`               |
| `org.apache.maven.resolver:maven-resolver-spi`                 | `org.apache.maven.resolver.spi`                 |
| `org.apache.maven.resolver:maven-resolver-transport-classpath` | `org.apache.maven.resolver.transport.classpath` |
| `org.apache.maven.resolver:maven-resolver-transport-file`      | `org.apache.maven.resolver.transport.file`      |
| `org.apache.maven.resolver:maven-resolver-transport-jdk`       | `org.apache.maven.resolver.transport.jdk`       |
| `org.apache.maven.resolver:maven-resolver-transport-jetty`     | `org.apache.maven.resolver.transport.jetty`     |
| `org.apache.maven.resolver:maven-resolver-util`                | `org.apache.maven.resolver.util`                |
| `org.checkerframework:checker-qual`                            | `org.checkerframework.checker.qual`             |
| `org.jetbrains.kotlinx:kotlinx-collections-immutable`          | `kotlinx.collections.immutable`                 |
| `org.reactivestreams:reactive-streams`                         | `org.reactivestreams`                           |

> By and large, where a module already had an `Automatic-Module-Name`, it has been preserved.

### BOMs & Catalogs

This repository additionally provides [Maven BOM][13], [Gradle Version Catalog][14], and [Gradle Platform][15]
artifacts. These simplify and enforce the use of the right library versions. See below for use.

| Type                  | Coordinate                      | Version                                                                                                                                                                                                         |
| --------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Maven BOM][13]       | `dev.javamodules:jpms-bom`      | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fdev%2Fjavamodules%2Fjpms-bom%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)      |
| [Gradle Catalog][14]  | `dev.javamodules:jpms-catalog`  | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fdev%2Fjavamodules%2Fjpms-catalog%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black)  |
| [Gradle Platform][15] | `dev.javamodules:jpms-platform` | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fdev%2Fjavamodules%2Fjpms-platform%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black) |

#### Using the Version Catalog

To use the version catalog from Gradle, follow the setup steps below. These code samples are provided in Kotlin:

**`settings.gradle.kts`**:

```kotlin
dependencyResolutionManagement {
  repositories {
    mavenCentral()

    maven {
      name = "jpms-attic"
      url = uri("https://jpms.pkg.st/repository")
    }
  }

  versionCatalogs {
    create("attic") {
      from("dev.javamodules:jpms-catalog:1.0.8")
    }
  }
}
```

**`build.gradle.kts`**:

```kotlin
dependencies {
  api(attic.guava)
}
```

#### Using the Gradle Platform

To use the Gradle Platform to constrain your versions, map the repository as usual, then:

```kotlin
dependencies {
  api(platform("dev.javamodules:jpms-platform:1.0.8"))
}
```

The Version Catalog also provides a mapping:

```kotlin
dependencies {
  api(platform(attic.javamodules.platform))
}
```

### Limitations

This repo does not currently publish source or javadoc JARs. It's not that it couldn't, it's just that mounting
classifier-equipped JARs in local repositories is annoying.

### Sample Projects

Sample projects are provided in the [samples](./samples) directory, which show how to hook up the repository and
override libraries.

### Coming soon

Future badges

![SLSA](https://img.shields.io/badge/SLSA-white?logoColor=white&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB2aWV3Qm94PSIwIDAgMjggMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI%2BPGRlZnM%2BPGNsaXBQYXRoIGlkPSJjbGlwMF8xMjNfMTEyNyI%2BPHBhdGggZD0iTTAgNS42QzAgMi41MDcyMSAyLjUwNzIxIDAgNS42IDBIMjIuNEMyNS40OTI4IDAgMjggMi41MDcyMSAyOCA1LjZWMjIuNEMyOCAyNS40OTI4IDI1LjQ5MjggMjggMjIuNCAyOEg1LjZDMi41MDcyMSAyOCAwIDI1LjQ5MjggMCAyMi40VjUuNloiIGZpbGw9IndoaXRlIi8%2BPC9jbGlwUGF0aD48L2RlZnM%2BPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzEyM18xMTI3KSIgdHJhbnNmb3JtPSJtYXRyaXgoMSwgMCwgMCwgMSwgLTguODgxNzg0MTk3MDAxMjUyZS0xNiwgLTMuNTUyNzEzNjc4ODAwNTAxZS0xNSkiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjYuMTA1MiAzLjA2MzY4ZS0wNUwyNi4xODIyIC0wLjA4NzA1NTdMMjQuNjgzNiAtMS40MTE1TDI0LjAyMTQgLTAuNjYyMTkxQzIzLjgyMzcgLTAuNDM4NTA2IDIzLjYyMzIgLTAuMjE3NzUyIDIzLjQxOTkgMy4wNjM2OGUtMDVIMi44NjEwMmUtMDZWMS41NTg0MUwtMS4zNzU5OCAyLjQwNjQ2TC0wLjg1MTI5NyAzLjI1Nzc2Qy0wLjU3NjYwMiAzLjcwMzQ2IC0wLjI5MjcyNyA0LjE0MTY4IDIuODYxMDJlLTA2IDQuNTcyMjRWMjMuMjU2NEMtMC4wMDY3ODE4MiAyMy4yNTY2IC0wLjAxMzU2NjkgMjMuMjU2NyAtMC4wMjAzNTIxIDIzLjI1NjlMLTEuMDIwMTQgMjMuMjc3MkwtMC45Nzk0MzUgMjUuMjc2OEwyLjg2MTAyZS0wNiAyNS4yNTY5VjI4SDI4VjEwLjI2MzJDMjguMjg4MSA5Ljg0ODU1IDI4LjU2NzkgOS40MjY2MiAyOC44MzkyIDguOTk3NTlDMjkuMjk0OSA4LjMxMTczIDI5LjYzMzMgNy43MjUzMiAyOS44NTk4IDcuMzA2QzI5Ljk3MzcgNy4wOTUyMSAzMC4wNTk1IDYuOTI2MjkgMzAuMTE3OCA2LjgwNzc2QzMwLjE0NyA2Ljc0ODQ5IDMwLjE2OTMgNi43MDE3OCAzMC4xODQ5IDYuNjY4N0wzMC4yMDMyIDYuNjI5NDJMMzAuMjA4NiA2LjYxNzY5TDMwLjIxMDQgNi42MTM4NEwzMC4yMTEgNi42MTI0M0wzMC4yMTEzIDYuNjExODVMMzAuMjExNCA2LjYxMTU5QzMwLjIxMTQgNi42MTE0OCAzMC4yMTE1IDYuNjExMzYgMjkuMzU1NyA2LjIyNTE1TDMwLjIxMTUgNi42MTEzNkwzMC42MjI4IDUuNjk5ODdMMjguNzk5OCA0Ljg3NzIyTDI4LjM4OSA1Ljc4NzU4TDI4LjM4ODkgNS43ODc3OUwyOC4zODg4IDUuNzg3OTdMMjguMzg4NyA1Ljc4ODNMMjguMzg4NiA1Ljc4ODQ5TDI4LjM4ODUgNS43ODg3TDI4LjM4NjkgNS43OTIxOUwyOC4zNzU2IDUuODE2NTFDMjguMzY0NyA1LjgzOTUgMjguMzQ3NCA1Ljg3NTgzIDI4LjMyMzQgNS45MjQ0OEMyOC4yNzU1IDYuMDIxOCAyOC4yMDEzIDYuMTY4MjQgMjguMTAwMiA2LjM1NTQ4QzI4LjA2OTMgNi40MTI2NyAyOC4wMzU5IDYuNDczNjIgMjggNi41MzgxMVYzLjA2MzY4ZS0wNUgyNi4xMDUyWk0yNi4xMDUyIDMuMDYzNjhlLTA1SDIzLjQxOTlDMTkuMDEwNiA0LjcyMzcgMTMuMzAxNSA4LjA0OTI3IDcuMDIxNTMgOS41NTU4QzQuNjQ2NTcgNy40NDc2NyAyLjU2MDU2IDQuOTgxNjkgMC44NTEzMDMgMi4yMDg0TDAuMzI2NjIzIDEuMzU3MUwyLjg2MTAyZS0wNiAxLjU1ODQxVjQuNTcyMjRDMS43NDE1MyA3LjEzMzczIDMuNzk2NDggOS40MjQgNi4wOTY0NyAxMS40MDM1QzkuNDAyNDQgMTQuMjQ4NyAxMy4yMTQ3IDE2LjQ1MTggMTcuMzMwNCAxNy44OTU2QzEzLjg0NTcgMjAuMTczMSA5LjkzNzk1IDIxLjc4NTMgNS44MDgwMSAyMi42MTY2QzMuOTEyNTIgMjIuOTk4MSAxLjk3MDA4IDIzLjIxNTEgMi44NjEwMmUtMDYgMjMuMjU2NFYyNS4yNTY5TDAuMDIwMzU3OCAyNS4yNTY0QzIuMTE3MTcgMjUuMjEzOCA0LjE4NDg5IDI0Ljk4MzQgNi4yMDI2NCAyNC41NzcyQzExLjI4MzIgMjMuNTU0NiAxNi4wNDYxIDIxLjQxODEgMjAuMTU5NyAxOC4zNTkzQzIzLjE2MTggMTYuMTI3MSAyNS44MTgzIDEzLjQwMzUgMjggMTAuMjYzMlY2LjUzODExQzI3LjgwMDcgNi44OTYyNiAyNy41MjQxIDcuMzYzNTEgMjcuMTY3NCA3Ljg5OTcxTDI3LjE2MDkgNy45MDk1MkwyNy4xNTQ2IDcuOTE5NDhDMjUuMDUyMiAxMS4yNDczIDIyLjQwMjggMTQuMTIyNiAxOS4zNjIxIDE2LjQ1NTRDMTUuNTg1OSAxNS4zMTM2IDEyLjA1MTMgMTMuNTAzOCA4LjkyNjI4IDExLjEyM0MxNS4zMjI3IDkuMjk3MTkgMjEuMDkxNSA1LjY3MzA5IDI1LjUyIDAuNjYyMjUyTDI2LjEwNTIgMy4wNjM2OGUtMDVaIiBmaWxsPSIjRkY2NzQwIi8%2BPC9nPjwvc3ZnPg%3D%3D)
![SPDX](https://img.shields.io/badge/SPDX-white?logoColor=white&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZpZXdCb3g9IjAgMCA1MiA1MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTk3OV8zOTgiIHgxPSI4LjQ4NTgxIiB5MT0iNS4yMDgwNiIgeDI9IjI3LjcwMzQiIHkyPSIyOS42MTc3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI%2BPHN0b3Agc3RvcC1jb2xvcj0id2hpdGUiIHN0b3Atb3BhY2l0eT0iMCIvPjxzdG9wIG9mZnNldD0iMC4zNDk0IiBzdG9wLWNvbG9yPSIjQ0RDQ0NDIiBzdG9wLW9wYWNpdHk9IjAuMjI2NjgiLz48c3RvcCBvZmZzZXQ9IjAuODg5IiBzdG9wLWNvbG9yPSIjNDU0MTQyIiBzdG9wLW9wYWNpdHk9IjAuODQ2OTgiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMyMzFGMjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBkPSJNMTMuMzA0MiAxNC42NjhIMzYuNDUwMUw0NS45Njc2IDUuMDI2NzNIMy43MjU2NVY1LjE4NTczVjE0LjU1N1Y0Ny40OTdMMTMuMzA0MiAzNy45MTY1VjE0LjY2OFoiIGZpbGw9IiMwMDM3NzgiLz48cGF0aCBvcGFjaXR5PSIwLjgiIGQ9Ik0xMy4zMDQyIDE0LjY2OEgzNi40NTAxTDQ1Ljk2NzYgNS4wMjY3M0gzLjcyNTY1VjUuMTg1NzNWMTQuNTU3VjQ3LjQ5N0wxMy4zMDQyIDM3LjkxNjVWMTQuNjY4WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzE5NzlfMzk4KSIvPjxwYXRoIGQ9Ik0zNi40NTAxIDE0LjY2NzlMMTMuMzA0MiAzNy45MTY0TDMuNzI1NjUgNDcuNTA4MkgxMy4zMDQySDE3LjY3ODlMMjYuMTc1NSAzOC44MTk0VjMwLjA5MzJWMjcuNjIzNEgyOC42Nzc3SDM3LjM0NUw0NS45MzE4IDE5LjAxNzlWMTQuNjY3OVY0Ljk3NzE3TDM2LjQ1MDEgMTQuNjY3OVoiIGZpbGw9IiMwMDk0RkYiLz48cGF0aCBkPSJNMjguNTcwNCAzMC4wMzMyVjM2LjQyNFY0Ny41MDgySDQ1LjkzMThWMzAuMDMzMkgzNC45NjU4SDI4LjU3MDRaIiBmaWxsPSIjMDA5NEZGIi8%2BPC9zdmc%2B)

### Licensing

This repo is open source, licensed under [Apache 2.0](./LICENSE.txt). The libraries listed in this repo may have their
own licenses; it is up to you to comply with these. These libraries are only published here for the purpose of early
testing and development against new code; no warranty is provided of any kind.

[0]: https://github.com/typetools/checker-framework
[1]: https://github.com/typetools/checker-framework/pull/6326
[2]: https://github.com/sgammon/error-prone
[3]: https://github.com/google/error-prone/pull/4311
[4]: https://github.com/google/j2objc
[5]: https://github.com/google/j2objc/pull/2302
[6]: https://github.com/elide-dev/jpms/issues/1
[7]: https://maven.apache.org/guides/mini/guide-multiple-repositories.html
[8]: https://docs.gradle.org/current/userguide/declaring_repositories.html
[9]: https://github.com/bazelbuild/rules_jvm_external/blob/master/docs/api.md#maven_install-repositories
[10]: https://www.scala-sbt.org/1.x/docs/Resolvers.html
[11]: https://github.com/google/guava
[12]: https://github.com/sgammon/guava/pull/14
[13]: https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#bill-of-materials-bom-poms
[14]: https://docs.gradle.org/current/userguide/platforms.html
[15]: https://docs.gradle.org/current/userguide/dependency_version_alignment.html
[16]: https://github.com/reactive-streams/reactive-streams-jvm
[17]: https://github.com/protocolbuffers/protobuf/pull/16178
[18]: https://github.com/leangen/geantyref
[19]: https://github.com/leangen/geantyref/pull/29
[20]: https://github.com/Kotlin/kotlinx.collections.immutable
[21]: https://github.com/Kotlin/kotlinx.collections.immutable/pull/175
[22]: https://maven.apache.org/resolver/
