# Packages

Sub-directories in this path define NPM packages which are published under the `@javamodules` namespace. These packages are used as tools for indexing Maven repositories, parsing POMs and Gradle module definitions, and so on.

## Available Utilities

| Package                     | Name             | Description                          |
| --------------------------- | ---------------- | ------------------------------------ |
| [`@javamodules/gradle`][0]  | Gradle Utilities | Gradle Module utilities and types    |
| [`@javamodules/indexer`][1] | Repo Indexer     | Builds JSON indexes from Maven repos |
| [`@javamodules/java`][2]    | Java Utilities   | Java class file and module utilities |
| [`@javamodules/maven`][3]   | Maven Utilities  | POM and other Maven utilities        |

## Usage

Check each module's documentation in the project README or on NPM. These utilities are pretty specific and may not be fully documented or tested. Contributions and issues are welcome.

[0]: ./gradle
[1]: ./indexer
[2]: ./java
[3]: ./maven
