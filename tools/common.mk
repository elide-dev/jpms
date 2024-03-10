
#
# JPMS Attic: Makefile Commons
#

MAVEN_CMD ?= mvn
GRADLE_CMD ?= ./gradlew

REPOSITORY ?= $(PROJECT)/repository

MAVEN_ARGS ?=
GRADLE_ARGS ?= --no-daemon

ifeq ($(TESTS),yes)
else
MAVEN_ARGS += -DskipTests
GRADLE_ARGS += -x test
endif

ifeq ($(JAVADOC),yes)
else
MAVEN_ARGS += -Dmaven.javadoc.skip=true
GRADLE_ARGS += -x javadocJar
endif

ifeq ($(SIGNING),yes)
GRADLE_ARGS += sign
else
MAVEN_ARGS += -Dgpg.skip=true
endif


## Command Macros

MAVEN ?= $(MAVEN_CMD) $(MAVEN_ARGS)
GRADLE ?= $(GRADLE_CMD) $(GRADLE_ARGS)
RM ?= rm -f$(POSIX_FLAGS)
RMDIR ?= rm -fr$(POSIX_FLAGS)
MKDIR ?= mkdir -p
CP ?= cp -fr$(POSIX_FLAGS)
