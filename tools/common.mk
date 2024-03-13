
#
# JPMS Attic: Makefile Commons
#

MAVEN_CMD ?= mvn
GRADLE_CMD ?= ./gradlew

REPOSITORY ?= file://$(PROJECT)/repository
M2_LOCAL ?= $(PROJECT)/.m2/repository
_LOCAL_REPO_ARG ?= -Dmaven.repo.local=$(M2_LOCAL) -Djpms.repository=$(REPOSITORY)

MAVEN_ARGS ?= $(_LOCAL_REPO_ARG)
GRADLE_ARGS ?= --no-daemon -Pjpms.repository=$(REPOSITORY) $(_LOCAL_REPO_ARG)
MAVEN_GOAL ?= install
GRADLE_TASK ?= install

ifeq ($(TESTS),yes)
GRADLE_ARGS += check
else
MAVEN_ARGS += -DskipTests
GRADLE_ARGS += -x test
endif

ifeq ($(JAVADOC),yes)
else
MAVEN_ARGS += -Dmaven.javadoc.skip=true
GRADLE_ARGS += -x javadoc
endif

ifeq ($(SIGNING),no)
MAVEN_ARGS += -Dgpg.skip=true
endif


## Command Macros

GIT ?= $(shell which git)
MAVEN ?= $(MAVEN_CMD) $(MAVEN_ARGS)
GRADLE ?= $(GRADLE_CMD) $(GRADLE_ARGS)
RM ?= rm -f$(POSIX_FLAGS)
RMDIR ?= rm -fr$(POSIX_FLAGS)
MKDIR ?= mkdir -p
CP ?= cp -fr$(POSIX_FLAGS)
