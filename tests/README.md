# JPMS Attic Tests

This repository holds integration and smoke tests for use of JPMS with Guava and other major JVM libraries. The [**integration tests**](./integration) hold projects which depend on Guava downstream. They are built with the JPMS version to ensure compatibility; the build itself is the test.

The [**smoke tests**](./smoke) are simple tests against the JARs provided by this repository.
