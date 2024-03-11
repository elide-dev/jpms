
# JPMS Attic

This repository provides sub-module library overrides for popular Java libraries which don't yet provide JPMS support (at least until some PRs are merged!). There is a Maven repository which contains these artifacts, too, so you can safely use them in your projects.

#### Pending PRs

Tracking issue [here][6] provides the best tracker. Once these PRs are merged and changes are released, this repo becomes obsolete.

- google/j2objc#2302 feat: support jpms in annotations module
- google/error-prone#4311 feat: add jpms definition for annotations
- typetools/checker-framework#6326 Add module-info.java to checker-qual

### What's in the box?

- **[`com.google.errorprone`][2]:** **Error Prone Compiler** "is a static analysis tool for Java that catches common programming mistakes at compile time," built by Google. Error Prone's annotations module is JPMS-enabled at the embedded sub-module, and is used by Guava. The [PR enabling JPMS support in Error Prone Annotations][3] has been filed and merged, but not released yet.

- **[`com.google.guava`][11]:** **Google Guava** is Google's core Java commons, used throughout Google's code and the wider JVM ecosystem. Guava is an immensely popular artifact, with tons of fantastic utilities. JPMS support is [in draft][12].

- **[`com.google.j2objc`][4]:** **J2ObjC** is a Java to Objective-C cross-compiling layer used by Google to effectively share Java logic on iOS and macOS platforms. J2ObjC itself is very complex and powerful, but here we have just JPMS-enabled the `annotations` module, which is used by Guava. The [PR enabling JPMS support for J2ObjC annotations][5] has been filed and merged, but not released yet.

- **[`org.checkerframework`][0]:** **Checker Framework** is a type-checking framework for Java. The `checker-qual` package is used by Guava, so it is included here transitively. Checker Framework added a JPMS module definition in a [recent PR][1], so this is sub-moduled at `master`. At the time of this writing no release has taken place.

### How do I use it?

Add this domain as a repository within any JVM build tool: [Maven][7], [Gradle][8], [Bazel][9], [sbt][10]. For example:

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

| Coordinate                                      | Version                 |
| ----------------------------------------------- | ----------------------- |
| `com.google.errorprone:error_prone_annotations` | `2.25.0-jpms`           |
| `com.google.guava:guava`                        | `33.0.0-jre-jpms`       |
| `com.google.j2objc:j2objc-annotations`          | `3.0.0-jpms`            |
| `org.checkerframework:checker-qual`             | `3.43.0-SNAPSHOT`       |

### BOMs & Catalogs

This repository additionally provides [Maven BOM][13], [Gradle Version Catalog][14], and [Gradle Platform][15] artifacts. These simplify and enforce the use of the right library versions. See below for use.

| Type                  | Coordinate                      | Version  |
| --------------------- | ------------------------------- | -------- |
| [Maven BOM][13]       | `dev.javamodules:jpms-bom`      | `1.0.0`  |
| [Gradle Catalog][14]  | `dev.javamodules:jpms-catalog`  | `1.0.0`  |
| [Gradle Platform][15] | `dev.javamodules:jpms-platform` | `1.0.0`  |

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
