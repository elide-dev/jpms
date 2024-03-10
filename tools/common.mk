
#
# JPMS Attic: Makefile Commons
#

MAVEN_CMD ?= mvn
GRADLE_CMD ?= ./gradlew

REPOSITORY ?= $(PROJECT)/repository
_LOCAL_REPO_ARG ?= -Dmaven.repo.local=$(REPOSITORY)

MAVEN_ARGS ?= $(_LOCAL_REPO_ARG)
GRADLE_ARGS ?= --no-daemon $(_LOCAL_REPO_ARG)
MAVEN_GOAL ?= install
GRADLE_TASK ?= install

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

MAVEN ?= $(MAVEN_CMD) $(MAVEN_ARGS) $(MAVEN_GOAL)
GRADLE ?= $(GRADLE_CMD) $(GRADLE_ARGS)
RM ?= rm -f$(POSIX_FLAGS)
RMDIR ?= rm -fr$(POSIX_FLAGS)
MKDIR ?= mkdir -p
CP ?= cp -fr$(POSIX_FLAGS)
