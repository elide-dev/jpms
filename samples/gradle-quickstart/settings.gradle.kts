plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.7.0"
    id("build.less") version "1.0.0-rc2"
}

val ephemeraVersion = "1.0.10"
val remote = false
rootProject.name = "gradle-quickstart"
include("app")

when (remote) {
    false -> apply(from = "../../repository/gradle/jpms.kts")
    true -> apply(from = "https://jpms.pkg.st/repository/gradle/jpms.kts")
}
