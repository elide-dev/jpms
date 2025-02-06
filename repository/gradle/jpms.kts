val latestAtticRelease = "1.0.10"

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
      from("dev.javamodules:jpms-catalog:$latestAtticRelease")
    }
  }
}
