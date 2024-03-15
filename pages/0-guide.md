# JPMS Attic Repository

This usage guide can help you use the [Java Platform Module System][0] in your build before popular libraries ship support for it. Libraries like **Guava**, **Reactive Streams**, and **Protobuf** don't yet ship `module-info` definitions; some specify an `Automatic-Module-Name`, but tools like [`jlink`][1] reject these.

## So you want to use Modular Java

If you want to use these libraries in a module app, you are left with a poor set of choices:

**1) 🙅 Build your app with these libraries on the classpath.**
You won't be able to use tools like `jlink`, but perhaps you give those up; well, libraries on the `classpath` are not subject to encapsulation rules even for modular Java builds. This largely _defeats the purpose_ of a modular Java build, because all classes can be seen by these artifacts, so no safe optimization can be achieved by the compiler.

**2) 🙅 Use tools like [Moditect][2].**
Moditect is pretty great for injecting or generating `module-info.java` definitions when you use these libraries at dependencies. The downside, of course, is that you have to modify your dependencies, and wire together Moditect in your build. For some this is hard, for others this is intolerable, and for another group it is perfect.

**3) 🙅 Stop using the libraries.**
You could stop using libraries like Guava, Reactive Streams, and Protobuf, but these libraries are used _so ubiquitously_ in the Java ecosystem that you are likely to run into them in your transitive library graph anyway. If you want to use Google Cloud someday, you will _have_ to use all of these. If you want to use popular libraries like Dubbo or FoundationDB that are downstream from Guava and Protobuf, they will end up in your graph nonetheless, and you can return to step 1 or 2.

**4) 🙅 Stop using JPMS.**
This is an option, and even the [best of us][3] have resorted to this at times. But JPMS **is not going away**, offers meaningful compile time and safety optimizations, unlocks new tools like `jlink`, and is even required for [certain advanced use cases of Java][4].

---
Or, you could:
---

**5) ✅ Use this repo.**

This [GitHub repository][5] (the one hosting this page) is also a Maven Repository, hosted at the following endpoint:

```
https://jpms.pkg.st/repository
```

This repository forks the popular libraries you need, with fully modular Java support, until such time as modular support is released to Maven Central.

## How you can use it

- As a repository for Maven, Bazel, Gradle, etc.
- As a [Maven BOM][6]
- As a [Gradle Version Catalog][7]
- As a [Gradle Platform][8]

Together these artifacts let you consume the libraries in this repo easily (and safely, in a way that does not collide with Maven Central), and also **enforce transitively** that your artifact graph will support JPMS.

[0]: https://www.oracle.com/corporate/features/understanding-java-9-modules.html
[1]: https://docs.oracle.com/en/java/javase/11/tools/jlink.html
[2]: https://github.com/moditect/moditect
[3]: https://blog.gradle.org/mrjars
[4]: https://medium.com/graalvm/truffle-unchained-13887b77b62c
[5]: https://github.com/javamodules/attic
[6]: https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#bill-of-materials-bom-poms
[7]: https://docs.gradle.org/current/userguide/platforms.html#sec:sharing-catalogs
[8]: https://docs.gradle.org/current/userguide/platforms.html#sub:using-platform-to-control-transitive-deps
