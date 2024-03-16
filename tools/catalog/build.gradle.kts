plugins {
    `version-catalog`
    `maven-publish`
    signing
}

// Latest BOM release version.
version = (properties["toolsVersion"] as? String)
    ?.ifBlank { null }
    ?.takeIf { it != "unspecified" }
    ?: "1.0.0"

catalog {
    versionCatalog {
        version("guava", attic.versions.guava.get())
        version("errorprone", attic.versions.errorprone.get())
        version("j2objc", attic.versions.j2objc.get())
        version("checker", attic.versions.checker.get())
        version("protobuf", attic.versions.protobuf.get())
        version("reactivestreams", attic.versions.reactivestreams.get())
        version("geantyref", attic.versions.geantyref.get())
        version("attic", project.version as String)

        library("geantyref", "io.leangen.geantyref", "geantyref")
            .versionRef("geantyref")
        library("guava", "com.google.guava", "guava")
            .versionRef("guava")
        library("errorprone-annotations", "com.google.errorprone", "error_prone_annotations")
            .versionRef("errorprone")
        library("j2objc-annotations", "com.google.j2objc", "j2objc-annotations")
            .versionRef("j2objc")
        library("reactivestreams", "org.reactivestreams", "reactive-streams")
            .versionRef("reactivestreams")
        library("checker-qual", "org.checkerframework", "checker-qual")
            .versionRef("checker")

        library("protobuf-java", "com.google.protobuf", "protobuf-java")
            .versionRef("protobuf")
        library("protobuf-java-lite", "com.google.protobuf", "protobuf-javalite")
            .versionRef("protobuf")
        library("protobuf-util", "com.google.protobuf", "protobuf-util")
            .versionRef("protobuf")
        library("protobuf-kotlin", "com.google.protobuf", "protobuf-kotlin")
            .versionRef("protobuf")
        library("protobuf-kotlin-lite", "com.google.protobuf", "protobuf-kotlin-lite")
            .versionRef("protobuf")

        library("javamodules-bom", "dev.javamodules", "jpms-bom")
            .versionRef("attic")
        library("javamodules-platform", "dev.javamodules", "jpms-platform")
            .versionRef("attic")
    }
}

publishing {
    publications {
        create<MavenPublication>("maven") {
            groupId = "dev.javamodules"
            artifactId = "jpms-catalog"
            version = project.version as String
            from(components["versionCatalog"])

            pom {
                name = "JPMS Attic Catalog"
                description = "JPMS-enabled libraries, from the future"
                url = "https://jpms.pkg.st"

                licenses {
                    license {
                        name = "The Apache License, Version 2.0"
                        url = "http://www.apache.org/licenses/LICENSE-2.0.txt"
                    }
                }
                developers {
                    developer {
                        id = "sgammon"
                        name = "Sam Gammon"
                    }
                }
                scm {
                    connection = "scm:git:git://github.com/elide-dev/jpms.git"
                    developerConnection = "scm:git:ssh://github.com/elide-dev/jpms.git"
                    url = "https://github.com/elide-dev/jpms"
                }
            }
        }
    }

    repositories {
        maven {
            name = "attic"
            url = uri("${properties["jpms.repository"]}")
        }
    }
}

signing {
    useGpgCmd()
    sign(publishing.publications["maven"])
}

// Stubbed test task.
val test by tasks.registering { }

// Stubbed javadoc task.
val javadoc by tasks.registering { }
