plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.7.0"
    id("build.less") version "1.0.0-rc2"
}

val ephemeraVersion = "1.0.7"
rootProject.name = "modular-proto"
include("app")

dependencyResolutionManagement {
    repositories {
        maven {
            name = "jpms-attic"
            url = uri("file:///${rootProject.projectDir}/../../repository")
        }
        mavenCentral()
    }

    versionCatalogs {
        create("attic") {
            from("dev.javamodules:jpms-catalog:$ephemeraVersion")
        }
    }
}
