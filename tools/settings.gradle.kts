
dependencyResolutionManagement {
    versionCatalogs {
        create("attic") {
            from(files("../versions.toml"))
        }
    }
}

includeBuild("./catalog")
includeBuild("./platform")
