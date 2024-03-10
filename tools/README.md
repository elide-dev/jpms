
## JPMS Repository Tools

This directory defines a bunch of Makefile commons which are imported by the root Makefile for this project.

Maven and Gradle commands and their flags are defined here, as well as other common behavior across modules. Modules are built from the outside with one of Gradle or Maven, and place their installed outputs in a local `repository`.
