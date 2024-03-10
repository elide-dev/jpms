plugins {
  java
  application
  signing
}

repositories {
  mavenCentral()
}

dependencies {
  implementation(libs.guava)
}

testing {
  suites {
    val test by getting(JvmTestSuite::class) {
      useJUnitJupiter("5.10.0")
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
    mainModule = "jpms.modularguava"
}
