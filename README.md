
## JPMS Attic

This repository provides sub-module library overrides for popular Java libraries which don't yet provide JPMS support (at least until some PRs are merged!). There is a Maven repository which contains these artifacts, too, so you can safely use them in your projects.

### What libraries are included?

- **[`org.checkerframework`][0]:** Type-checking framework for Java. The `checker-qual` package is used by Guava, so it is included here transitively. Checker Framework added a JPMS module definition in a [recent PR][1], so this is sub-moduled at `master`. At the time of this writing no release has taken place.

### How do I use it?

Coming soon.


[0]: https://github.com/typetools/checker-framework
[1]: https://github.com/typetools/checker-framework/pull/6326

