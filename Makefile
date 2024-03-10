#
# JPMS Attic: Makefile
#

export VERBOSE ?= no
export DEBUG ?= no
export TESTS ?= no
export SIGNING ?= no
export JAVADOC ?= no

PROJECT ?= $(shell pwd)

LIBS ?= $(PROJECT)/libs
DEPS ?= com.google.guava com.google.errorprone com.google.j2objc org.checkerframework

POSIX_FLAGS ?=

ifeq ($(VERBOSE),yes)
RULE ?=
POSIX_FLAGS += -v
else
RULE = @
endif

include tools/common.mk

all: setup $(DEPS) repository  ## Build all targets and setup the repository.

setup:  ## Setup local codebase features; performs first-run stuff.
	$(info Building JPMS libraries...)
	$(RULE)mkdir -p repository

repository: $(DEPS) $(LIBS)  ## Build the repository layout.
	@echo ""
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
	@echo ""
	$(info Building Error Prone Compiler...)
	$(RULE)cd com.google.errorprone && \
		$(MAVEN) package

j2objc: com.google.j2objc  ## Build the J2ObjC annotations.
com.google.j2objc: com.google.j2objc/annotations/target
com.google.j2objc/annotations/target:
	@echo ""
	$(info Building J2ObjC...)
	$(RULE)cd com.google.j2objc/annotations && \
		$(MAVEN) package

checkerframework: org.checkerframework  ## Build Checker Framework.
org.checkerframework: org.checkerframework/checker-qual/build/libs
org.checkerframework/checker-qual/build/libs:
	@echo ""
	$(info Building Checker Framework...)
	$(RULE)cd org.checkerframework && \
		$(GRADLE) :checker-qual:build -x check -x installGitHooks

guava: com.google.guava  ## Build Guava and all requisite dependencies.
com.google.guava: org.checkerframework com.google.j2objc com.google.errorprone com.google.guava/guava/target
com.google.guava/guava/target:
	@echo ""
	$(info Building Guava...)
	$(RULE)cd com.google.guava && \
		$(MAVEN) package

clean:  ## Clean all built targets.
	$(info Cleaning outputs...)
	$(RULE)$(RMDIR) \
		$(LIBS) \
		com.google.errorprone/*/target \
		com.google.j2objc/annotations/target \
		com.google.guava/*/target \
		org.checkerframework/target \
		org.checkerframework/*/target;

help:  ## Show this help text ('make help').
	$(info JPMS Attic:)
	@grep -E '^[a-z1-9A-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: all repository $(DEPS)
