# Contribution Guidelines

This repository is open to contributions: fixes and new libraries are both welcome. See the guide below for directions to build and test the codebase, and to add a new library or amend or update an existing oen.

## Build / Test

You can build everything and run all tests with:

```shell
make
```

The embedded projects generally use `mvnw` and `gradlew`, where possible, so you should only need a recent copy of Java. [Java 21 on OpenJDK](https://jdk.java.net/21/) is suggested.

At least one project calls out to `mvn`, so you may need to [install Maven](https://maven.apache.org/install.html).

### Using the Makefile

Various commands and switches are available in the Makefile. To see the list of targets:

**Listing targets:**

```
> make help

JPMS Attic:
all                            Build all targets and setup the repository.
checkerframework               Build Checker Framework.
clean                          Clean all built targets.
distclean                      Clean downloaded material and local dev tools.
errorprone                     Build the Error Prone Compiler.
forceclean                     DANGEROUS: Wipe all untracked files and other changes; completely reset.
guava                          Build Guava and all requisite dependencies.
help                           Show this help text ('make help').
j2objc                         Build the J2ObjC annotations.
protobuf                       Build Protocol Buffers.
reactivestreams                Build Reactive Streams.
repository                     Build the repository layout.
reset                          Reset the codebase as well as performing a `distclean`.
samples                        Build samples.
setup                          Setup local codebase features; performs first-run stuff.
site                           Build and run the Jekyll site.
test                           Build and run integration and smoke tests.
tools                          Build ancillary libraries.
update-modules                 Update all sub-modules.
```

**Switches and their defaults:**

```makefile
VERBOSE ?= no    # show build commands and pass `-v` to commands like `cp` and `rm`
TESTS ?= no      # run the tests for each library as we go
SIGNING ?= no    # sign library outputs
JAVADOC ?= no    # build javadoc outputs for each library as we go
SNAPSHOT ?= yes  # build snapshot versions; pass `no` to build live versions
```

**Setting up your local environment:**

```shell
make setup dev
```

> This command will setup local tooling and clone all submodules.

## Making changes

Generally, when making changes, make sure to add tests and samples, where applicable. New libraries will need build steps.

### Adding a library

Look in the root `Makefile`. You'll see a target pattern like this:

```make
guava: com.google.guava  ## Build Guava and all requisite dependencies.
com.google.guava: org.checkerframework com.google.j2objc com.google.errorprone com.google.guava/guava/target
com.google.guava/guava/target:
	$(info Building Guava...)
	$(RULE)cd com.google.guava \
		&& $(MAVEN) ... \
		&& $(GIT) checkout . \
		&& find . -name pom.xml.versionsBackup -delete \
		&& echo "Guava ready."
```

A few things to note, patterns you will want to follow:

1. The `## ...` text is the documentation used in `make help`
2. A short-hand target like `guava` should map → the group ID
3. All artifacts are stored at their group ID, as compound projects
4. It is best to `git checkout .` in the subproject after builds

#### Library copy & validate

After setting up your library build steps, check the following targets in the `Makefile`, amending them if needed:

##### Lib copy step

```make
$(LIBS):
	@echo "Packaging libraries..."
	$(RULE)$(MKDIR) $(LIBS)
	$(RULE)$(CP) \
		com.google.errorprone/annotations/target/*.jar \
		com.google.j2objc/annotations/target/*.jar \
		org.checkerframework/checker-qual/build/libs/*.jar \
		com.google.guava/guava/target/*.jar \
		$(LIBS)
```

##### Clean step

```make
clean:  ## Clean all built targets.
	$(info Cleaning outputs...)
	$(RULE)$(RMDIR) \
		$(LIBS) \
		com.google.errorprone/*/target \
		com.google.j2objc/annotations/target \
		com.google.guava/*/target \
		org.checkerframework/build \
		org.checkerframework/*/build \
		samples/modular-guava/app/build \
		samples/modular-guava-repo/app/build \
		samples/modular-guava-maven/target
```

#### Mapping versions

You will also need to add variables to pin the version for the added library, both in `SNAPSHOT` and non-`SNAPSHOT` forms. For example:

```make
ifeq ($(SNAPSHOT),yes)
# ...
export ERROR_PRONE_VERSION ?= 1.0-HEAD-SNAPSHOT
# ...
else
# ...
export ERROR_PRONE_VERSION ?= 2.25.0-jpms
# ...
endif
```

Make sure this version variable overrides the published version in the embedded project.

#### Adding a POM

At `install` into the local repository, a custom POM can be used. This is useful because the published POM may not map to the right transitive JPMS-enabled versions.

Add your pom to `tools/poms`, and see examples of use in the Makefile.

#### Adding to Git

Check the `git-add` command in the `Makefile`, making sure that your artifacts are expressed. This ensures they will not be ignored when publishing.

## Publishing

File a PR following the above instructions. Once reviewed and merged, the resulting repository artifacts will be published via GitHub Pages automatically.

## Thank you!

If you are reading this, **you rock.** Open source is a team sport, thank you for considering contributions to this project!
