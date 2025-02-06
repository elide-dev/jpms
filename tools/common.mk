#
# JPMS Attic: Makefile Commons
#

MAVEN_CMD ?= mvn
GRADLE_CMD ?= ./gradlew
BAZEL_CMD ?= bazel

REPOSITORY ?= file://$(PROJECT)/repository
M2_LOCAL ?= $(PROJECT)/.m2/repository
_LOCAL_REPO_ARG ?= -Dmaven.repo.local=$(M2_LOCAL) -Djpms.repository=$(REPOSITORY) -Dprotoc.bin=$(DEV_BIN)/protoc

ENV_PREFIX ?= PATH="$(PROJECT_PATH)" PROTOC="$(DEV_BIN)/protoc"

MAVEN_ARGS ?= $(_LOCAL_REPO_ARG)
MAVEN_TEST_ARGS := $(MAVEN_ARGS)
GRADLE_ARGS ?= --no-daemon -Pjpms.repository=$(REPOSITORY) $(_LOCAL_REPO_ARG)
GRADLE_TEST_ARGS := $(GRADLE_ARGS)
BAZEL_ARGS ?=
BAZEL_TEST_ARGS := $(BAZEL_ARGS)
MAVEN_GOAL ?= install
MAVEN_TEST_GOAL ?= verify
GRADLE_TASK ?= install
GRADLE_TEST_TASK ?= check
BAZEL_TARGET ?=

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
DEPLOY_TASK = deploy:deploy-file
else
MAVEN_ARGS += -Dsign=true
DEPLOY_TASK = gpg:sign-and-deploy-file
endif

ifeq ($(SIGSTORE),yes)
MAVEN_ARGS += -Dsigstore=true
endif

ifeq ($(SLSA),yes)
MAVEN_ARGS += -Dslsa=true
endif

ifeq ($(SBOM),yes)
MAVEN_ARGS += -Dsbom=true
endif

## Command Macros

GIT ?= $(shell which git)
PNPM ?= $(shell which pnpm)
BUN ?= $(shell which bun)
NODE ?= $(shell which node)
MAVEN ?= $(ENV_PREFIX) $(MAVEN_CMD) $(MAVEN_ARGS)
MAVEN_TEST ?= $(ENV_PREFIX) $(MAVEN_CMD) $(MAVEN_TEST_ARGS)
GRADLE ?= $(ENV_PREFIX) $(GRADLE_CMD) $(GRADLE_ARGS)
GRADLE_TEST ?= $(ENV_PREFIX) $(GRADLE_CMD) $(GRADLE_TEST_ARGS) $(GRADLE_TEST_TASK)
BAZEL ?= $(ENV_PREFIX) $(BAZEL_CMD) $(BAZEL_ARGS)
BAZEL_TEST ?= $(ENV_PREFIX) $(BAZEL_CMD) $(BAZEL_TEST_ARGS)
RM ?= rm -f$(POSIX_FLAGS)
RMDIR ?= rm -fr$(POSIX_FLAGS)
MKDIR ?= mkdir -p
CP ?= cp -fr$(POSIX_FLAGS)
