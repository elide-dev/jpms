
dependencyResolutionManagement {
    versionCatalogs {
        create("attic") {
            from(files("../../versions.toml"))
        }
    }
}
