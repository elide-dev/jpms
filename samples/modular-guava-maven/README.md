# Modular Guava (Maven)

This sample builds a Guava-dependent pure-Java app [with the JPMS attic](../..). The app's module is
`demo.modularguava`:

```java
module demo.modularguava {
  requires com.google.common;
}
```

The entrypoint:

```java
public class ModularGuavaExample {
    public static void main(String[] args) {
        ImmutableNetwork<String, Integer> network =
            NetworkBuilder.directed().<String, Integer>immutable().addEdge("A", "B", 10).build();

        System.out.println("Hello Modular Guava! Here's a graph: " + network);
    }
}
```

This sample can be built and run with:

```shell
mvnw clean package exec:exec@modular
```

The effective underlying Java run command is:

```shell
java \
    --module-path target/libs:target/modular-guava-maven-1.0-SNAPSHOT.jar \
    --module demo.modularguava/org.example.ModularGuavaExample
```
