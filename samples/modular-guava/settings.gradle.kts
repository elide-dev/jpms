plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.7.0"
    id("build.less") version "1.0.0-rc2"
}

rootProject.name = "modular-guava"
include("app")

dependencyResolutionManagement {
    repositories {
        maven {
            name = "jpms-attic"
            url = uri("https://jpms.pkg.st/repository")
        }
        mavenCentral()
    }
}
