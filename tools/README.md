# JPMS Repository Tools

This directory defines a bunch of Makefile commons which are imported by the root Makefile for this project.

Maven and Gradle commands and their flags are defined here, as well as other common behavior across modules. Modules are built from the outside with one of Gradle or Maven, and place their installed outputs in a local `repository`.

## Available Tools & Libraries

In addition to `Makefile` commons:

- **[`bom`](./bom):** Maven BOM publication providing the libraries in this repository.
- **[`catalog`](./catalog):** Gradle [Version Catalog][0] publication providing the libraries in this repository.
- **[`platform`](./platform):** Gradle [Platform][1] publication constraining to the libraries in this repository.
- **[`poms`](./poms):** Maven POMs used for each published library.

[0]: https://docs.gradle.org/current/userguide/platforms.html#sub:central-declaration-of-dependencies
[1]: https://docs.gradle.org/current/userguide/dependency_version_alignment.html#aligning_versions_natively_with_gradle
