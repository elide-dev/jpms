package org.example;

import com.google.common.graph.ImmutableNetwork;
import com.google.common.graph.NetworkBuilder;

public class App {
    public String getGreeting() {
        return "Hello World!";
    }

    public static void main(String[] args) {
        System.out.println(new App().getGreeting());
        ImmutableNetwork<String, Integer> network =
            NetworkBuilder.directed().<String, Integer>immutable().addEdge("A", "B", 10).build();

        System.out.println("Hello Modular Guava! Here's a graph: " + network);
    }
}
