plugins {
  java
  application
  signing
}

dependencies {
  implementation(platform(attic.javamodules.platform))
  implementation("com.google.guava:guava")
  implementation("org.slf4j:slf4j-api")
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

dependencyLocking {
  lockAllConfigurations()
}
