plugins {
    `java-platform`
    `maven-publish`
    signing
}

// Latest BOM release version.
version = (properties["toolsVersion"] as? String)
    ?.ifBlank { null }
    ?.takeIf { it != "unspecified" }
    ?: "1.0.0"

dependencies {
    constraints {
        // Attic Libraries
        api(attic.j2objc.annotations)
        api(attic.errorprone.annotations)
        api(attic.checker.qual)
        api(attic.reactivestreams)
        api(attic.protobuf.java)
        api(attic.protobuf.util)
        api(attic.protobuf.kotlin)
        api(attic.geantyref)
        api(attic.guava)

        // Library Constraints
        api("com.github.ben-manes.caffeine:caffeine") {
            version {
                fromCatalog(attic.versions.caffeine)
            }
        }
        api("org.slf4j:slf4j-api") {
            version {
                fromCatalog(attic.versions.slf4j)
            }
        }
        api("org.yaml:snakeyaml") {
            version {
                fromCatalog(attic.versions.snakeyaml.core)
            }
        }
        api("org.snakeyaml:snakeyaml-engine") {
            version {
                fromCatalog(attic.versions.snakeyaml.engine)
            }
        }
    }
}

fun MutableVersionConstraint.fromCatalog(provider: Provider<String>) {
    val resolved = provider.get()
    when {
        resolved.startsWith(">=") -> prefer(resolved.drop(">=".length).trim())
        resolved.startsWith("strictly ") -> strictly(resolved.drop("strictly".length).trim())
        else -> prefer(resolved)
    }
}

tasks.build {
    dependsOn("generatePomFileForMavenPublication")
}

publishing {
    publications {
        create<MavenPublication>("maven") {
            groupId = "dev.javamodules"
            artifactId = "jpms-platform"
            version = project.version as String
            from(components["javaPlatform"])

            pom {
                name = "JPMS Attic Platform"
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

configurations.all {
    exclude(group = "com.google.code.findbugs", module = "jsr305")
    exclude(group = "com.google.guava", module = "listenablefuture")
}

signing {
    useGpgCmd()
    sign(publishing.publications["maven"])
}

// Stubbed test task.
val test by tasks.registering { }

// Stubbed javadoc task.
val javadoc by tasks.registering { }
