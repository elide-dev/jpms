#
# JPMS Attic: Makefile
#

export VERBOSE ?= no
export DEBUG ?= no
export TESTS ?= no
export SIGNING ?= no
export JAVADOC ?= no
export SNAPSHOT ?= yes

ifeq ($(SNAPSHOT),yes)
export ERROR_PRONE_VERSION ?= 1.0-HEAD-SNAPSHOT
export J2OBJC_VERSION ?= 3.0.0-SNAPSHOT
export CHECKER_FRAMEWORK_VERSION ?= 3.43.0-SNAPSHOT
export GUAVA_VERSION ?= 1.0-HEAD-jre-SNAPSHOT
else
export ERROR_PRONE_VERSION ?= 2.25.0-jpms
export J2OBJC_VERSION ?= 3.0.0-jpms
export CHECKER_FRAMEWORK_VERSION ?= 3.43.0-SNAPSHOT
export GUAVA_VERSION ?= 33.0.0-jre-jpms
endif

export PROJECT ?= $(shell pwd)
export LIBS ?= $(PROJECT)/libs

DEPS ?= com.google.guava com.google.errorprone com.google.j2objc org.checkerframework
POSIX_FLAGS ?=

ifeq ($(VERBOSE),yes)
export RULE ?=
export POSIX_FLAGS += -v
else
export RULE = @
endif

include tools/common.mk

all: setup $(DEPS) repository samples test  ## Build all targets and setup the repository.

setup:  ## Setup local codebase features; performs first-run stuff.
	$(info Building JPMS libraries...)
	$(RULE)mkdir -p repository

repository: $(DEPS) $(LIBS)  ## Build the repository layout.
	$(info Building repository layout...)
	@echo "Repository info:"
	@echo "- Location: $(REPOSITORY)"

$(LIBS):
	@echo "Packaging libraries..."
	$(RULE)$(MKDIR) $(LIBS)
	$(RULE)$(CP) \
		com.google.errorprone/annotations/target/*.jar \
		com.google.j2objc/annotations/target/*.jar \
		org.checkerframework/checker-qual/build/libs/*.jar \
		com.google.guava/guava/target/*.jar \
		$(LIBS)

errorprone: com.google.errorprone  ## Build the Error Prone Compiler.
com.google.errorprone: com.google.errorprone/annotations/target
com.google.errorprone/annotations/target:
	$(info Building Error Prone Compiler...)
	$(RULE)cd com.google.errorprone \
		&& $(MAVEN) versions:set -DnewVersion=$(ERROR_PRONE_VERSION) \
		&& $(MAVEN) versions:update-child-modules \
		&& $(MAVEN) $(MAVEN_GOAL) \
		&& $(MAVEN) deploy:deploy-file \
			-DgroupId=com.google.errorprone \
			-DartifactId=error_prone_annotations \
			-Dversion=$(ERROR_PRONE_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/error-prone-annotations.xml \
  			-Dfile=annotations/target/error_prone_annotations-$(ERROR_PRONE_VERSION).jar \
  			-DrepositoryId=jpms-local \
  			-Durl=$(REPOSITORY) \
		&& $(GIT) checkout . \
		&& find . -name pom.xml.versionsBackup -delete \
		&& echo "Error Prone Compiler ready."

j2objc: com.google.j2objc  ## Build the J2ObjC annotations.
com.google.j2objc: com.google.j2objc/annotations/target
com.google.j2objc/annotations/target:
	$(info Building J2ObjC...)
	$(RULE)cd com.google.j2objc/annotations \
		&& $(MAVEN) versions:set -DnewVersion=$(J2OBJC_VERSION) \
		&& $(MAVEN) versions:update-child-modules \
		&& $(MAVEN) $(MAVEN_GOAL) -Dmaven.javadoc.skip=true \
		&& $(MAVEN) deploy:deploy-file \
			-DgroupId=com.google.j2objc \
			-DartifactId=j2objc-annotations \
			-Dversion=$(J2OBJC_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../../tools/poms/j2objc-annotations.xml \
  			-Dfile=target/j2objc-annotations-$(J2OBJC_VERSION).jar \
  			-DrepositoryId=jpms-local \
  			-Durl=$(REPOSITORY) \
		&& $(GIT) checkout . \
		&& find . -name pom.xml.versionsBackup -delete \
		&& echo "J2ObjC annotations ready."

checkerframework: org.checkerframework  ## Build Checker Framework.
org.checkerframework: org.checkerframework/checker-qual/build/libs
org.checkerframework/checker-qual/build/libs:
	$(info Building Checker Framework...)
	$(RULE)cd org.checkerframework \
		&& $(GRADLE) \
			-Pversion=$(CHECKER_FRAMEWORK_VERSION) \
			:checker-qual:publishToMavenLocal \
			-x check \
			-x installGitHooks

guava: com.google.guava  ## Build Guava and all requisite dependencies.
com.google.guava: org.checkerframework com.google.j2objc com.google.errorprone com.google.guava/guava/target
com.google.guava/guava/target:
	$(info Building Guava...)
	$(RULE)cd com.google.guava \
		&& $(MAVEN) versions:set -DnewVersion=$(GUAVA_VERSION) \
		&& $(MAVEN) versions:update-child-modules \
		&& $(MAVEN) $(MAVEN_GOAL) \
			-Dchecker.version=$(CHECKER_FRAMEWORK_VERSION) \
			-Derrorprone.version=$(ERROR_PRONE_VERSION) \
			-Dj2objc.version=$(J2OBJC_VERSION) \
			-nsu \
		&& $(MAVEN) deploy:deploy-file \
			-DgroupId=com.google.guava \
			-DartifactId=guava \
			-Dversion=$(GUAVA_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/guava.xml \
  			-Dfile=guava/target/guava-$(GUAVA_VERSION).jar \
  			-DrepositoryId=jpms-local \
  			-Durl=$(REPOSITORY) \
		&& $(GIT) checkout . \
		&& find . -name pom.xml.versionsBackup -delete \
		&& echo "Guava ready."

git-add:
	$(GIT) add -f \
		repository/com/google/guava \
		repository/com/google/j2objc \
		repository/com/google/errorprone \
		repository/org/checkerframework
	$(GIT) status -sb

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

samples:  ## Build samples.
	$(info Building samples...)
	$(RULE)$(MAKE) -C samples

test:  ## Build and run integration and smoke tests.
	$(info Running local testsuite...)
	$(RULE)$(MAKE) -C tests PROJECT=$(PROJECT) LIBS=$(LIBS)

help:  ## Show this help text ('make help').
	$(info JPMS Attic:)
	@grep -E '^[a-z1-9A-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: all repository samples test $(DEPS)
