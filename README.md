
## JPMS Attic

This repository provides sub-module library overrides for popular Java libraries which don't yet provide JPMS support (at least until some PRs are merged!). There is a Maven repository which contains these artifacts, too, so you can safely use them in your projects.

#### Pending PRs

Tracking issue [here][6] provides the best tracker. Once these PRs are merged and changes are released, this repo becomes obsolete.

- google/j2objc#2302 feat: support jpms in annotations module
- google/error-prone#4311 feat: add jpms definition for annotations
- typetools/checker-framework#6326 Add module-info.java to checker-qual

### What libraries are included?

- **[`com.google.errorprone`][2]:** **Error Prone Compiler** "is a static analysis tool for Java that catches common programming mistakes at compile time," built by Google. Error Prone's annotations module is JPMS-enabled at the embedded sub-module, and is used by Guava. The [PR enabling JPMS support in Error Prone Annotations][3] has been filed but not merged yet.

- **[`com.google.j2objc`][4]:** **J2ObjC** is a Java to Objective-C cross-compiling layer used by Google to effectively share Java logic on iOS and macOS platforms. J2ObjC itself is very complex and powerful, but here we have just JPMS-enabled the `annotations` module, which is used by Guava. The [PR enabling JPMS support for J2ObjC annotations][5] has been filed but not merged yet.

- **[`org.checkerframework`][0]:** **Checker Framework** is a type-checking framework for Java. The `checker-qual` package is used by Guava, so it is included here transitively. Checker Framework added a JPMS module definition in a [recent PR][1], so this is sub-moduled at `master`. At the time of this writing no release has taken place.

### How do I use it?

Coming soon.


[0]: https://github.com/typetools/checker-framework
[1]: https://github.com/typetools/checker-framework/pull/6326
[2]: https://github.com/sgammon/error-prone
[3]: https://github.com/google/error-prone/pull/4311
[4]: https://github.com/google/j2objc
[5]: https://github.com/google/j2objc/pull/2302
[6]: https://github.com/elide-dev/jpms/issues/1

