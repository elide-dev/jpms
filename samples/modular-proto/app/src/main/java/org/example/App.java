package org.example;

import com.google.common.graph.ImmutableNetwork;
import com.google.common.graph.NetworkBuilder;
import org.example.proto.Greeting;
import org.example.proto.GreetingRequest;

@SuppressWarnings("UnstableApiUsage")
public class App {
    public String getGreeting() {
        return "Hello World!";
    }

    public static void main(String[] args) {
        // say hello
        System.out.println(new App().getGreeting());

        // build generated proto
        String name;
        if (args.length == 0) {
            name = "JPMS";
        } else {
            name = args[0];
        }
        ImmutableNetwork<String, Integer> network =
            NetworkBuilder.directed().<String, Integer>immutable().addEdge("A", "B", 10).build();

        System.out.println("Hello Modular Guava! Here's a graph: " + network);
        var request = greetingRequest(name);
        System.out.println("Modular Protobuf: " + request);
        var greeting = generateGreeting(request);
        System.out.println("Built message: " + greeting);
        System.out.println(greeting.getMessage());
        System.out.println("Done.");
        System.exit(0);
    }

    private static GreetingRequest greetingRequest(String name) {
        var builder = GreetingRequest.newBuilder();
        builder.setName(name);
        return builder.build();
    }

    private static Greeting generateGreeting(GreetingRequest request) {
        var greeting = Greeting.newBuilder();
        greeting.setMessage(renderMessageString(request));
        return greeting.build();
    }

    private static String renderMessageString(GreetingRequest request) {
        return "Hello, " + request.getName();
    }
}
