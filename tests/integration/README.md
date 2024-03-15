# Integration Tests

This directoy holds projects which use libraries like **Guava**, **Protocol Buffers**, and **Reactive Streams**; builds are run on these projects in order to test their library use and compatibility with JPMS.

Projects were selected based on their use case of relevant libraries and their build system. See [the tracking ticket](elide-dev/jpms#26) for more information.

## Projects

| Repository | Build system + Language | Libraries used |
| ----------- | ------------------------- | -------------- |
| [`dubbo`][0] | Maven, Java | Protobuf, Guava, Reactive |
| [`pkl`][1] | Gradle, Java, Kotlin | Guava |
| [`bazel`][2] | Bazel, Java | Protobuf, Guava, Reactive |
| [`checkstyle`][3] | Maven, Java | Guava |
| [`gson`][4] | Maven, Java | Protobuf, Guava |
| [`armeria`][5] | Gradle, Java | Guava, Protobuf, Reactive |
| [`ghidra`][6] | Gradle, Java | Guava, Protobuf |
| [`pmd`][7] | Maven, Java | Guava |
| [`Signal-Server`][8] | Maven, Java | Guava, Protobuf, Reactive |

[0]: ./dubbo
[1]: ./pkl
[2]: ./bazel
[3]: ./checkstyle
[4]: ./gson
[5]: ./armeria
[6]: ./ghidra
[7]: ./pmd
[8]: ./signal-server
