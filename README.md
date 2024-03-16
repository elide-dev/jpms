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

- [GitHub Repo](https://github.com/javamodules/attic)
- [Docs](https://javamodules.dev)

This repository provides sub-module library overrides for popular Java libraries which don't yet provide JPMS support (at least until some PRs are merged!). There is a Maven repository which contains these artifacts, too, so you can safely use them in your projects.

> [!TIP]
> **These libraries should be treated like `SNAPSHOT` versions until a release is issued. If you see hash failures with Gradle, make sure to pass `--refresh-dependencies --write-verification-metadata ...`. With Maven, pass `-U`.**

#### Pending PRs

Tracking issue [here][6] provides the best tracker. Once these PRs are merged and changes are released, this repo becomes obsolete.

### What's in the box?

- **[`com.google.errorprone`][2]:** **Error Prone Compiler** "is a static analysis tool for Java that catches common programming mistakes at compile time," built by Google. Error Prone's annotations module is JPMS-enabled at the embedded sub-module, and is used by Guava. The [PR enabling JPMS support in Error Prone Annotations][3] has been filed, merged, and released, as [`2.26.1`](https://github.com/google/error-prone/releases/tag/v2.26.1).

- **[`com.google.guava`][11]:** **Google Guava** is Google's core Java commons, used throughout Google's code and the wider JVM ecosystem. Guava is an immensely popular artifact, with tons of fantastic utilities. JPMS support is [in draft][12].

- **[`com.google.j2objc`][4]:** **J2ObjC** is a Java to Objective-C cross-compiling layer used by Google to effectively share Java logic on iOS and macOS platforms. J2ObjC itself is very complex and powerful, but here we have just JPMS-enabled the `annotations` module, which is used by Guava. The [PR enabling JPMS support for J2ObjC annotations][5] has been filed, merged, and released as [`3.0.0`](https://github.com/google/j2objc/commit/a883dd3f90d51d5ccad4aa3af8feaaeed6560109).


- **[`com.google.protobuf`][4]:** **Protocol Buffers** (a.k.a., protobuf) are Google's language-neutral, platform-neutral, extensible mechanism for serializing structured data. = JPMS support is [in draft][17].

- **[`io.leangen.geantyref`][18]:** **Geantyref** is a fork of the excellent GenTyRef library, adding support for working with AnnotatedTypes introduced in Java 8 plus many nifty features.

- **[`org.checkerframework`][0]:** **Checker Framework** is a type-checking framework for Java. The `checker-qual` package is used by Guava, so it is included here transitively. Checker Framework added a JPMS module definition in a [recent PR][1], so this is sub-moduled at `master`. At the time of this writing no release has taken place.

- **[`org.reactivestreams`][16]:** **Reactive Streams** is a universal JVM API for building reactive software in an implementation-agnostic manner.

### How do I use it?

Add this domain as a repository within any JVM build tool: [Maven][7], [Gradle][8], [Bazel][9], [sbt][10]. For example:

> [!NOTE]
> **Filing issues:** Please file issues for this repo on [`elide-dev/jpms`](https://github.com/elide-dev/jpms/issues).

#### Maven

```xml
  <repositories>
    <repository>
      <id>jpms-attic</id>
      <name>JPMS Attic</name>
      <url>https://jpms.pkg.st/repository</url>
    </repository>
  </repositories>
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

You should use a JPMS-enabled library version which has no conflict with Maven Central. Reference the table below to pick a library.

**Libraries marked `Central` have seen releases in Maven Central,** and so are no longer needed through this repository.


| Coordinate                                      | Version                 |
| ----------------------------------------------- | ----------------------- |
| `com.google.errorprone:error_prone_annotations` | ![Central](https://img.shields.io/maven-central/v/com.google.errorprone/error_prone_annotations?label=Central&labelColor=blue) |
| `com.google.guava:guava`                        | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fcom%2Fgoogle%2Fguava%2Fguava%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black) |
| `com.google.j2objc:j2objc-annotations`          | ![Central](https://img.shields.io/maven-central/v/com.google.j2objc/j2objc-annotations?label=Central&labelColor=blue) |
| `com.google.protobuf:protobuf-java`             | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fcom%2Fgoogle%2Fprotobuf%2Fprotobuf-java%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black) |
| `com.google.protobuf:protobuf-javalite`         | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fcom%2Fgoogle%2Fprotobuf%2Fprotobuf-javalite%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black) |
| `com.google.protobuf:protobuf-util`             | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fcom%2Fgoogle%2Fprotobuf%2Fprotobuf-util%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black) |
| `com.google.protobuf:protobuf-kotlin`           | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fcom%2Fgoogle%2Fprotobuf%2Fprotobuf-kotlin%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black) |
| `com.google.protobuf:protobuf-kotlin-lite`      | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fcom%2Fgoogle%2Fprotobuf%2Fprotobuf-kotlin-lite%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black) |
| `io.leangen.geantyref:geantyref`                | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fio%2Fleangen%2Fgeantyref%2Fgeantyref%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black) |
| `org.checkerframework:checker-qual`             | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Fcheckerframework%2Fchecker-qual%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black) |
| `org.reactivestreams:reactive-streams`          | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Forg%2Freactivestreams%2Freactive-streams%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black) |

### Using the modules

Use the modules in your `module-info.java`:

| Coordinate                                      | Module                              |
| ----------------------------------------------- | ----------------------------------- |
| `com.google.errorprone:error_prone_annotations` | `com.google.errorprone.annotations` |
| `com.google.guava:guava`                        | `com.google.common`                 |
| `com.google.j2objc:j2objc-annotations`          | `com.google.j2objc.annotations`     |
| `com.google.protobuf:protobuf-java`             | `com.google.protobuf`               |
| `com.google.protobuf:protobuf-javalite`         | `com.google.protobuf`               |
| `com.google.protobuf:protobuf-util`             | `com.google.protobuf.util`          |
| `com.google.protobuf:protobuf-kotlin`           | `com.google.protobuf.kotlin`        |
| `com.google.protobuf:protobuf-kotlin-lite`      | `com.google.protobuf.kotlin`        |
| `io.leangen.geantyref:geantyref`                | `io.leangen.geantyref`              |
| `org.checkerframework:checker-qual`             | `org.checkerframework.checker.qual` |
| `org.reactivestreams:reactive-streams`          | `org.reactivestreams`               |

### BOMs & Catalogs

This repository additionally provides [Maven BOM][13], [Gradle Version Catalog][14], and [Gradle Platform][15] artifacts. These simplify and enforce the use of the right library versions. See below for use.

| Type                  | Coordinate                      | Version  |
| --------------------- | ------------------------------- | -------- |
| [Maven BOM][13]       | `dev.javamodules:jpms-bom`      | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fdev%2Fjavamodules%2Fjpms-bom%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black) |
| [Gradle Catalog][14]  | `dev.javamodules:jpms-catalog`  | ![JPMS](https://img.shields.io/maven-metadata/v?metadataUrl=https%3A%2F%2Fjpms.pkg.st%2Frepository%2Fdev%2Fjavamodules%2Fjpms-catalog%2Fmaven-metadata.xml&logo=maven&label=JPMS&labelColor=white&color=black) |
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
      from("dev.javamodules:jpms-catalog:1.0.0")
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
  api(platform("dev.javamodules:jpms-platform:1.0.0"))
}
```

The Version Catalog also provides a mapping:

```kotlin
dependencies {
  api(platform(attic.javamodules.platform))
}
```

### Limitations

This repo does not currently publish source or javadoc JARs. It's not that it couldn't, it's just that mounting classifier-equipped JARs in local repositories is annoying.

### Sample Projects

Sample projects are provided in the [samples](./samples) directory, which show how to hook up the repository and override libraries.

### Coming soon

Future badges

![SLSA](https://img.shields.io/badge/SLSA-white?logoColor=white&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB2aWV3Qm94PSIwIDAgMjggMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI%2BPGRlZnM%2BPGNsaXBQYXRoIGlkPSJjbGlwMF8xMjNfMTEyNyI%2BPHBhdGggZD0iTTAgNS42QzAgMi41MDcyMSAyLjUwNzIxIDAgNS42IDBIMjIuNEMyNS40OTI4IDAgMjggMi41MDcyMSAyOCA1LjZWMjIuNEMyOCAyNS40OTI4IDI1LjQ5MjggMjggMjIuNCAyOEg1LjZDMi41MDcyMSAyOCAwIDI1LjQ5MjggMCAyMi40VjUuNloiIGZpbGw9IndoaXRlIi8%2BPC9jbGlwUGF0aD48L2RlZnM%2BPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzEyM18xMTI3KSIgdHJhbnNmb3JtPSJtYXRyaXgoMSwgMCwgMCwgMSwgLTguODgxNzg0MTk3MDAxMjUyZS0xNiwgLTMuNTUyNzEzNjc4ODAwNTAxZS0xNSkiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjYuMTA1MiAzLjA2MzY4ZS0wNUwyNi4xODIyIC0wLjA4NzA1NTdMMjQuNjgzNiAtMS40MTE1TDI0LjAyMTQgLTAuNjYyMTkxQzIzLjgyMzcgLTAuNDM4NTA2IDIzLjYyMzIgLTAuMjE3NzUyIDIzLjQxOTkgMy4wNjM2OGUtMDVIMi44NjEwMmUtMDZWMS41NTg0MUwtMS4zNzU5OCAyLjQwNjQ2TC0wLjg1MTI5NyAzLjI1Nzc2Qy0wLjU3NjYwMiAzLjcwMzQ2IC0wLjI5MjcyNyA0LjE0MTY4IDIuODYxMDJlLTA2IDQuNTcyMjRWMjMuMjU2NEMtMC4wMDY3ODE4MiAyMy4yNTY2IC0wLjAxMzU2NjkgMjMuMjU2NyAtMC4wMjAzNTIxIDIzLjI1NjlMLTEuMDIwMTQgMjMuMjc3MkwtMC45Nzk0MzUgMjUuMjc2OEwyLjg2MTAyZS0wNiAyNS4yNTY5VjI4SDI4VjEwLjI2MzJDMjguMjg4MSA5Ljg0ODU1IDI4LjU2NzkgOS40MjY2MiAyOC44MzkyIDguOTk3NTlDMjkuMjk0OSA4LjMxMTczIDI5LjYzMzMgNy43MjUzMiAyOS44NTk4IDcuMzA2QzI5Ljk3MzcgNy4wOTUyMSAzMC4wNTk1IDYuOTI2MjkgMzAuMTE3OCA2LjgwNzc2QzMwLjE0NyA2Ljc0ODQ5IDMwLjE2OTMgNi43MDE3OCAzMC4xODQ5IDYuNjY4N0wzMC4yMDMyIDYuNjI5NDJMMzAuMjA4NiA2LjYxNzY5TDMwLjIxMDQgNi42MTM4NEwzMC4yMTEgNi42MTI0M0wzMC4yMTEzIDYuNjExODVMMzAuMjExNCA2LjYxMTU5QzMwLjIxMTQgNi42MTE0OCAzMC4yMTE1IDYuNjExMzYgMjkuMzU1NyA2LjIyNTE1TDMwLjIxMTUgNi42MTEzNkwzMC42MjI4IDUuNjk5ODdMMjguNzk5OCA0Ljg3NzIyTDI4LjM4OSA1Ljc4NzU4TDI4LjM4ODkgNS43ODc3OUwyOC4zODg4IDUuNzg3OTdMMjguMzg4NyA1Ljc4ODNMMjguMzg4NiA1Ljc4ODQ5TDI4LjM4ODUgNS43ODg3TDI4LjM4NjkgNS43OTIxOUwyOC4zNzU2IDUuODE2NTFDMjguMzY0NyA1LjgzOTUgMjguMzQ3NCA1Ljg3NTgzIDI4LjMyMzQgNS45MjQ0OEMyOC4yNzU1IDYuMDIxOCAyOC4yMDEzIDYuMTY4MjQgMjguMTAwMiA2LjM1NTQ4QzI4LjA2OTMgNi40MTI2NyAyOC4wMzU5IDYuNDczNjIgMjggNi41MzgxMVYzLjA2MzY4ZS0wNUgyNi4xMDUyWk0yNi4xMDUyIDMuMDYzNjhlLTA1SDIzLjQxOTlDMTkuMDEwNiA0LjcyMzcgMTMuMzAxNSA4LjA0OTI3IDcuMDIxNTMgOS41NTU4QzQuNjQ2NTcgNy40NDc2NyAyLjU2MDU2IDQuOTgxNjkgMC44NTEzMDMgMi4yMDg0TDAuMzI2NjIzIDEuMzU3MUwyLjg2MTAyZS0wNiAxLjU1ODQxVjQuNTcyMjRDMS43NDE1MyA3LjEzMzczIDMuNzk2NDggOS40MjQgNi4wOTY0NyAxMS40MDM1QzkuNDAyNDQgMTQuMjQ4NyAxMy4yMTQ3IDE2LjQ1MTggMTcuMzMwNCAxNy44OTU2QzEzLjg0NTcgMjAuMTczMSA5LjkzNzk1IDIxLjc4NTMgNS44MDgwMSAyMi42MTY2QzMuOTEyNTIgMjIuOTk4MSAxLjk3MDA4IDIzLjIxNTEgMi44NjEwMmUtMDYgMjMuMjU2NFYyNS4yNTY5TDAuMDIwMzU3OCAyNS4yNTY0QzIuMTE3MTcgMjUuMjEzOCA0LjE4NDg5IDI0Ljk4MzQgNi4yMDI2NCAyNC41NzcyQzExLjI4MzIgMjMuNTU0NiAxNi4wNDYxIDIxLjQxODEgMjAuMTU5NyAxOC4zNTkzQzIzLjE2MTggMTYuMTI3MSAyNS44MTgzIDEzLjQwMzUgMjggMTAuMjYzMlY2LjUzODExQzI3LjgwMDcgNi44OTYyNiAyNy41MjQxIDcuMzYzNTEgMjcuMTY3NCA3Ljg5OTcxTDI3LjE2MDkgNy45MDk1MkwyNy4xNTQ2IDcuOTE5NDhDMjUuMDUyMiAxMS4yNDczIDIyLjQwMjggMTQuMTIyNiAxOS4zNjIxIDE2LjQ1NTRDMTUuNTg1OSAxNS4zMTM2IDEyLjA1MTMgMTMuNTAzOCA4LjkyNjI4IDExLjEyM0MxNS4zMjI3IDkuMjk3MTkgMjEuMDkxNSA1LjY3MzA5IDI1LjUyIDAuNjYyMjUyTDI2LjEwNTIgMy4wNjM2OGUtMDVaIiBmaWxsPSIjRkY2NzQwIi8%2BPC9nPjwvc3ZnPg%3D%3D)
![SPDX](https://img.shields.io/badge/SPDX-white?logoColor=white&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZpZXdCb3g9IjAgMCA1MiA1MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTk3OV8zOTgiIHgxPSI4LjQ4NTgxIiB5MT0iNS4yMDgwNiIgeDI9IjI3LjcwMzQiIHkyPSIyOS42MTc3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI%2BPHN0b3Agc3RvcC1jb2xvcj0id2hpdGUiIHN0b3Atb3BhY2l0eT0iMCIvPjxzdG9wIG9mZnNldD0iMC4zNDk0IiBzdG9wLWNvbG9yPSIjQ0RDQ0NDIiBzdG9wLW9wYWNpdHk9IjAuMjI2NjgiLz48c3RvcCBvZmZzZXQ9IjAuODg5IiBzdG9wLWNvbG9yPSIjNDU0MTQyIiBzdG9wLW9wYWNpdHk9IjAuODQ2OTgiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMyMzFGMjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBkPSJNMTMuMzA0MiAxNC42NjhIMzYuNDUwMUw0NS45Njc2IDUuMDI2NzNIMy43MjU2NVY1LjE4NTczVjE0LjU1N1Y0Ny40OTdMMTMuMzA0MiAzNy45MTY1VjE0LjY2OFoiIGZpbGw9IiMwMDM3NzgiLz48cGF0aCBvcGFjaXR5PSIwLjgiIGQ9Ik0xMy4zMDQyIDE0LjY2OEgzNi40NTAxTDQ1Ljk2NzYgNS4wMjY3M0gzLjcyNTY1VjUuMTg1NzNWMTQuNTU3VjQ3LjQ5N0wxMy4zMDQyIDM3LjkxNjVWMTQuNjY4WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzE5NzlfMzk4KSIvPjxwYXRoIGQ9Ik0zNi40NTAxIDE0LjY2NzlMMTMuMzA0MiAzNy45MTY0TDMuNzI1NjUgNDcuNTA4MkgxMy4zMDQySDE3LjY3ODlMMjYuMTc1NSAzOC44MTk0VjMwLjA5MzJWMjcuNjIzNEgyOC42Nzc3SDM3LjM0NUw0NS45MzE4IDE5LjAxNzlWMTQuNjY3OVY0Ljk3NzE3TDM2LjQ1MDEgMTQuNjY3OVoiIGZpbGw9IiMwMDk0RkYiLz48cGF0aCBkPSJNMjguNTcwNCAzMC4wMzMyVjM2LjQyNFY0Ny41MDgySDQ1LjkzMThWMzAuMDMzMkgzNC45NjU4SDI4LjU3MDRaIiBmaWxsPSIjMDA5NEZGIi8%2BPC9zdmc%2B)
![Sigstore](https://img.shields.io/badge/Sigstore-white?logoColor=white&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZpZXdCb3g9IjAgMCAxMjUgMTI1IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxzdHlsZT4uYXtmaWxsOiMyZTJmNzE7fTwvc3R5bGU%2BPC9kZWZzPjxwYXRoIGQ9Im0xMDkuMjA5MjI3NCw0MS40NDk0OTE4Yy03LjExMTc2MS02LjA5ODA1MTktNy45MTk0ODE3LTkuNTY1NTIyOS0xMC4zNzA5NDI0LTE5LjA0NDk2ODUtMi42NjYwOTQxLTEwLjMxMDExNjEtMTYuOTU2Mjg4Ny0xOS4yNTk0MTUzLTI3LjQyMjk0ODUtMTcuMDIzMTQ3OC04LjAxMzAyMjQsMS43MTE4NDMtMTUuODM2MTAyNSwyLjE2MjEzMTYtMjMuNzk2MzgzOS4yNjU0NDY0LS44NDI2MTE5LS4yMDA3NjQtMS43MzQ5Nzk0LS4yMjQxNDkyLTIuNjA3MzIwMi0uMjYzNDU2MS00LjIzMjU4ODQtLjE5MTA2MTctNy42NzUwNTcxLDEuMzQ5MzczMS0xMC4zMDI1OTA2LDQuNzA3MzgxNi0xLjU3OTc0MTgsMi4wMTkwODQxLTIuOTY2NDkzOCw0LjE3MTc2MjEtNC4xMTc0NjYzLDYuNDQ0MTAyNS0zLjA1MzM3OTYsNi4wMjc2NDc3LTcuNzM1MDc0OSwxMC4zMDU2MzgxLTEzLjY3NDk2NjEsMTMuMzgyNzc2LTIuNzEzODU5NSwxLjQwNTg0NTgtNS4zOTM4ODUyLDIuOTI3NjIyMi03LjkwNDkyODIsNC42NjM1OTY3LTMuODY3MTMzMiwyLjY3MzM3MDgtNy4wMjcxMTQyLDUuOTcwNjc3NS03LjYzMTUyMDksMTAuOTU3Njg1OS0uNDQwMzM3NSwzLjYzMzQwNi42NzM5NDAyLDYuOTg3MTg1MywyLjM4MTg2NSwxMC4wNjQwNzQ1LDMuMTQwMDE2Niw1LjY1Njk2ODEsNC42ODQ4MDUsMTEuNjAzNzYyOSw0LjA2Mzg1NDYsMTcuNDcwNjk5OSwwLDIuNDI0MzQzOC0uMDY1MjQyMSw0LjI1MDg3MzYuMDExODE3LDYuMDcxMTgzOS4yNjU1NzA4LDYuMjY4NzEzOCwxLjczMzIzNzksMTIuMDA0NzkzNCw3LjI2MDU5MjYsMTUuODc2MDMxNCwyLjA5OTQzOTUsMS40NzA1MjgxLDQuMzI4NTU0NiwyLjc0Mzc3NTEsNi42ODU2NjYxLDMuNzAzODEwMyw2LjkwOTE5MzQsMi44MTQxNzkzLDEyLjQ3NDYxMTEsNy4xNTU4NTcsMTYuMjcwMjgyNywxMy42NjU4ODU2LjUwNzE5NjYuODY5NzI4NywxLjI0NjU2NTUsMS42MTY1NjA5LDEuOTM5OTEwNCwyLjM2MzE0NDQsMy4xNTE2NDcsMy4zOTM4MzI2LDcuMDE3MTAwOSw1LjEwMzkzNDEsMTEuNjg2NjA2MSw0Ljk1MDE4OTIsMy40NzkwMzkxLS4xMTQxODkyLDYuODA0ODMwOS0uOTQzNjE1OCw5LjkzOTU2MS0yLjM2MDkwNTQsOS4zODEzNjQ4LTQuMjQxOTE3NiwxOC44NzI4MTQtNy45MDA0NTAyLDI5LjE2OTU1ODMtOS41NTIzMzc2LDcuMjg2MjE2OC0xLjE2OTAwODksMTIuMDM1ODI4NS02LjEzNzM1ODksMTQuNTU5NTU5Mi0xMy4xMjcyODA4LjgyNTE5NzQtMi4yODU1MjU2LDEuMjMxOTQ5OC00LjY1NDg4OTQsMS41Nzk5OTA1LTcuMDI4MjMzNy42OTI1OTg2LTQuNzIzNTUyMiwyLjk4OTgxNjctOC4yOTY3NTM5LDcuMTYwMTE3My0xMC42NjExNDIyLjk0OTMwNjYtLjUzODEwNzMsMS4zMjAyOTcyLTEuMTYxMDQ4LDIuMjA0NzAzOC0xLjgwMjg5NTgsMy4xNjkxMjM3LTIuMjk5MjA4NCw1LjA1MzY4MDktNS4zOTU1MDIyLDUuNjE5NjIwMy05LjI3NDk0OTkuNTg4ODI3LTQuMDM2NDI2OC0uMjI5NDM1Ny03LjgyODgwMjEtMi4wMjM4NzMxLTExLjQ0OTAyMjktMi42MjQ2NDE0LTUuMjk1MjQ0Ni02LjMwNDA0MDMtOS4yNDQ4NDc3LTEwLjY4MDc2NDYtMTIuOTk3NjY3M1ptLTMyLjYyODMyMi0zMS44MDkwMzMxYzUuODkxNjI4Mi0uMDM2MzIxNiwxMC4zNjc2NDYxLDIuNDA2NDMxOCwxMy4yNTczOTE4LDcuNjA0MTU1My4xMDk0NjI0LjE5NzAzMjQuMTY2MDU5NS40MjcxNTIyLjIyMjUzMjEuNjQ4MzE2MS4wMjkxNjkyLjExNDE4OTItLjAyMjQ1MjIuMjI2Mzg4Mi0uMTc4MTg3NC4yNzM2NTYxLS4yNTc0ODU1LjAzOTMwNy0uNDc2MzQ4MS0uMDg4MDY3NS0uNjU1NDY4NC0uMjczNjU2MS0uMzk4NzI5My0uNDEzNDY5NC0uODEwMjA4NS0uODE4NDgwNC0xLjE3MDEyODQtMS4yNjQyOTEtMi4zNTc3MzM1LTIuOTIwNDA3Ni01LjQwODg3NC00LjcyMTA2NDQtOS4wMTQ5MTQ1LTUuNjQ5NTA0OC0uODQ1NjU5NC0uMjE3NjgwOS0xLjY3ODM4MjMtLjQ4NjYxMDItMi41MTMyMTk5LS43NDQwOTU3LS4yMzU4NDE4LS4wNzI4OTItLjU3ODg0NDctLjE1MjUwMTEtLjUzNzU0NzYtLjQ0MDMzNzUuMDQyNjY1NS0uMjk3MjkuMzg1NDgxOS0uMTUzMjQ3NC41ODk1NDIyLS4xNTQyNDI1Wk0xOS40NDQ2OTM4LDQ2LjMxOTMyNTZjLS4zMjI5MTQxLjg3MDIyNjItLjYyNDgwNjUsMS43NTMzODktMS4wMjIyMjk3LDIuNTkwMDMwMS0yLjYwMzQwMiw1LjQ3OTgzOC0zLjA4OTk1LDExLjE4NjA2NDMtMS45MTcwMjI4LDE3LjA4OTU3MTYuMjc1MDI0MywxLjM4NDQ1MDguNDY2MzM0OCwyLjc4NTgxODYuNjc1NzQzOSw0LjE4MjQ1OTYuMDU5MTQ3LjM5NDU2MjMuMTgzNDczOS45NTAwODQxLS4yNjQ4MjQ0LDEuMDkxNjM4OS0uNDYzMTAwNy4xNDYwMzI4LS40OTMyMDI4LS40NTQyNjktLjYzNzkyOTYtLjc1MDgxMjctNC4xNzg2NjU3LTguNTU3OTcxMS0zLjc1NDU2MS0xNi43ODkyOTYzLDEuNzk0MTI2NC0yNC42MzkyNDQ1LjIxMDIxNzYtLjI5NzUzODguNTA1ODkwNS0uNTQxMzQxNC43ODgzNzgyLS43NzgxNzgzLjE0NTk3MDYtLjEyMjY0NzcuMzQ1Njc3My0uMTI1ODgxOC41MjM3NDA0LjA2NzY2NzcuMjM3MjcyMi4zNDc3OTIuMjA1MDU1NS43NTU3ODgzLjA2MDAxNzcsMS4xNDY4Njc2Wm0xLjYwNzYwNDksNDAuMjM1MTUxN2M3LjU5NjQ0MzIsOS41NjY3NjY4LDE3LjM3ODA5MjIsMTUuNDQ0ODk4OCwyOS4zOTM4OTQsMTcuNDc5OTA0NywyMS43ODA1MzM5LDMuNjg5MTMyNCw0Mi45OTU0NzA1LTguMDEzMTQ2Nyw1MC42MjMwNzMyLTI3LjgzODc4MTMsNi4yMDg5NDQ4LTE2LjEzODI0MzcsMS4yNTk2MjY0LTM0Ljk3NDIzODUtMTIuMTQ5MTQ3LTQ2LjIzNzY3MjgtMTkuNDI4MjExNC0xNi4zMTk4NTE4LTQ3LjYxMjA0ODEtMTQuNzA4MjY2NC02NS4wMzc1OTQ3LDMuNzU0MDYzNS0xLjQ3MzU3NTYsMS41NjEzMzIyLTIuNzI4ODQ4NCwzLjMyODkwMTUtNC4yMjc2NzUsNS4xNzU4MzEsNi44NDg2NzgtMTMuNjc4NTczMywyNi4wMjIyNjQ5LTI3LjA0OTQwOCw0OS4zODAwNTI4LTIyLjE3NzA4NjQsMjAuOTcyMTI5LDQuMzc0NTE2NCwzNi4zOTQ3NjIyLDIzLjU3Njk2MTUsMzYuMjMxMzE0OSw0NS4zMjI5MTUyLS4xNjgxNzQxLDIyLjM3ODM0OC0xNS45ODM3NTI0LDQxLjA2NDU3ODMtMzguMzQ1NDMyMiw0NS4wOTgyNjg1LTIwLjQwNjY1NjEsMy42ODExNzE0LTM5LjEyMzk4MzctNy44OTg0Ni00NS44Njg0ODU5LTIwLjU3NzQ0MjRabTM2LjA4NjcxMjUtMjUuMDM1Nzk3aC4wNzM3MDA2YzAtNC44NzU4MDQ1LjA3MjA4MzUtOS43NTMxMDE3LS4wMTQ5ODg5LTE0LjYyNzQxMzUtLjE4MDY3NTItMTAuMTA5ODQ5Niw4LjQ3NzExODEtMTMuMzIwODMwMiwxNS42Njg3MzctMTAuOTQ1MjQ2OSwxLjQwNDQ3NzUuNDYzOTcxNCwyLjcyMTA3NDEsMS4wOTQzNzU0LDMuNzQ1NTQyOCwyLjIwNTE3MDIuOTUwNzA2LDEuMDMwNjg4MiwxLjA3ODAxODMsMi4yODY1MjA3LjM1MzU3NjEsMy4zMDk0OTY4LS42OTgxOTYxLjk4NTY1OTMtMS42MTcwNTg1LDEuMTc0NzMwOC0zLjAwODkxMDUuNTcyMTg5OS0xLjAzODA4OTQtLjQ0OTU0MjMtMi4wMzE5NTg0LTEuMDExNTMyMy0zLjA5MDYzNDEtMS40MDA2MjE0LTIuNjM3ODU3OC0uOTY5NDg4OC01LjYzMjc3NDUtLjEyNzM3NDUtNy4xMjY4MTIxLDEuOTIwMDcwNC0uNjQzODM4MS44ODI0MTY0LS44MTU2ODE2LDEuOTExNjExOS0uOTM1NDY4MywyLjk1MTc1MzctLjIzMTQ4ODEsMi4wMDg4ODQyLS4xNDI3MzY1LDQuMDI3OTY4My0uMTQ0MTY3LDYuMDQzMzIwNy0uMDA2MDk1MSw4LjUzMjg0NDUuMDA4NTgyOCwxNy4wNjU2ODg5LS4wMDY4NDE0LDI1LjU5ODUzMzQtLjAwOTM5MTQsNS4yMDI2OTkxLTIuNzQ5MjQ4Miw5LjEyMDcwNzQtNy42MTQxMDY1LDEwLjM5OTY3NjMtNC4xOTgyNTcsMS4xMDM4MjktOC4yNjYyMTY0LjcwMzc5MzYtMTEuNjY4NDQ1My0yLjM4MzU0NDItMS4wMjAxMTUxLS45MjU3MDM4LTEuMTgwOTUwMy0yLjI1NDE3OTUtLjU4MTc2NzktMy4yMDQwMTQ4LjY0NTMzMDctMS4wMjI5NzYxLDEuNjM1MzQzNy0xLjMxMTMxLDIuODU1MzUyMS0uNzgxMTYzNiwxLjMzNDY5NTIuNTc5NjUzMywyLjU0OTY2NTksMS40NTEzNzIyLDQuMDM0OTM0MSwxLjY2MDM0NTksNC4zOTEzMDg5LjYxODIxMzksNy40NzE1NTY1LTEuMjg5NDE3Niw3LjQ2MjQ3NjEtNi4wNjU0NjItLjAwOTcwMjQtNS4wODQyODA3LS4wMDIxNzY4LTEwLjE2ODU2MTMtLjAwMjE3NjgtMTUuMjUzMDkwN1ptMjIuNTM0NjQyOS01LjQzNzI5N2MyLjczOTkxOS4wMzEzNDYxLDQuOTQzODQ1MywyLjI1MjQzODEsNC45NTI2NzcsNC45OTA5ODg4LjAwODk1NiwyLjc5OTI1MjYtMi4yMzczMjQ4LDUuMDQyMjM3MS01LjAzMTE2NjUsNS4wMjQwNzYzLTIuNzMwOTYzLS4wMTc2NjMzLTQuOTUyNzM5Mi0yLjI0MjczNTctNC45Njc4NTI0LTQuOTc1MDY3LS4wMTUyOTk5LTIuNzY0NDIzNywyLjI5NDYwNi01LjA3MTM0NDIsNS4wNDYzNDItNS4wMzk5OTgxWm0tMzkuMDY3MDEzNSwxMC4wMTQ1Njc2Yy0yLjc4NTQ0NTQtLjAxNzkxMi01LjAwNTk3NzctMi4yOTk3MDU5LTQuOTYwMzI2OS01LjA5NjcxOTYuMDQ0NDY5MS0yLjcyNzM1NTcsMi4zMDUxMTY5LTQuOTM3OTk5MSw1LjAyNzk5NDYtNC45MTY4NTI5LDIuNzEyODAyMi4wMjA4OTc0LDQuOTU0NzkxNiwyLjI2NzExNiw0Ljk3NTgxMzMsNC45ODUyNjY5LjAyMTUxOTMsMi43NzA2NDMxLTIuMjYxMDIwOSw1LjA0NjQ2NjQtNS4wNDM0ODEsNS4wMjgzMDU2Wm02NC41MTE2Nzc1LDIwLjQ0NDg0MzZjLTIuNTQ5MTA2MSw5LjE3NTkzNjItOC4zMjYyMzQxLDE1LjA1NTA2MzMtMTcuNjg1NTE5OSwxNy4yNDkyODcyLS4zNTQ1NzEyLjA4MzA5MTktLjczNzUwMzEuMDY5NDA5MS0xLjEwNjA2OC4wNTk0NTgtLjE5MDUwMTktLjAwNTIyNDMtLjM0MjE5NDUtLjEzNTA4NjYtLjM0Njk4MzQtLjM5ODI5MzkuMDUzMDUyLS40MTc0NDk5LjM0Nzc5Mi0uNzAxNTU0Ni43MTU2NzI4LS44OTc4NDA2LjgxODg1MzUtLjQzNzEwMzMsMS42MzA2MTY5LS44OTc4NDA2LDIuNDgyOTMxMS0xLjI2MDMxMDUsNS41ODMwODEtMi4zNzQwOTA2LDkuNzMxOTU1NS02LjMyMTcwMzYsMTIuNzY5OTEwOS0xMS41MTc2ODU2LjcxMjM3NjUtMS4yMTg1MTU4LDEuNDk4ODI2Ni0yLjM5NDI0MTcsMi4yNjg0ODQzLTMuNTc4NDI2LjIxNzQzMjItLjMzNDM1NzkuNDkyODkxOS0uODMyNjYwNy45MjIxNTg3LS42NDExMDE1LjQ0MzUwOTQuMTk3Nzc4Ny4wNjc3Mjk5LjY2Njk3NDQtLjAyMDU4NjQuOTg0OTEzWiIgY2xhc3M9ImEiIHRyYW5zZm9ybT0ibWF0cml4KDEsIDAsIDAsIDEsIDAsIDMuNTUyNzEzNjc4ODAwNTAxZS0xNSkiLz48L3N2Zz4%3D)

### Licensing

This repo is open source, licensed under [Apache 2.0](./LICENSE.txt). The libraries listed in this repo may have their own licenses; it is up to you to comply with these. These libraries are only published here for the purpose of early testing and development against new code; no warranty is provided of any kind.

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
