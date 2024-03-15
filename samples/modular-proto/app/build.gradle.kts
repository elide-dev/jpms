@file:Suppress("UnstableApiUsage")

plugins {
  java
  application
  signing
  alias(libs.plugins.protobuf)
}

dependencies {
  implementation(attic.guava)
  implementation(attic.protobuf.java)
}

// Latest possible version of the Protobuf Compiler should be used.
val protocLatest = "21.0-rc-1"

testing {
  suites {
    val test by getting(JvmTestSuite::class) {
      useJUnitJupiter("5.10.0")
    }
  }
}

protobuf {
  protoc {
    // this uses the `PROTOC` injected from `./.dev/bin`, which is built at the same
    // revision as the embedded protobuf project. if this can't be found, this will
    // fallback to an artifact from maven central.
    System.getenv("PROTOC")?.ifBlank { null }.let {
      if (!it.isNullOrBlank()) {
        path = it
      } else {
        // try to build the path relatively from the project directory
        path = layout.projectDirectory.file("../../../.dev/bin/protoc").asFile.path
      }
    }
  }
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

application {
    mainClass = "org.example.App"
    mainModule = "jpms.modularproto"
}
