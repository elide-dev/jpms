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
        api(attic.j2objc.annotations)
        api(attic.errorprone.annotations)
        api(attic.checker.qual)
        api(attic.guava)
    }
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

signing {
    useGpgCmd()
    sign(publishing.publications["maven"])
}

// Stubbed test task.
val test by tasks.registering { }

// Stubbed javadoc task.
val javadoc by tasks.registering { }
