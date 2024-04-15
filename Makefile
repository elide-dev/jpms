#
# JPMS Attic: Makefile
#

export VERBOSE ?= no
export DEBUG ?= no
export RELEASE ?= no

ifeq ($(RELEASE),no)
export TESTS ?= no
export SIGNING ?= no
export SIGSTORE ?= no
export SLSA ?= no
export SBOM ?= no
export JAVADOC ?= no
export SNAPSHOT ?= yes
else
export TESTS ?= yes
export SIGNING ?= yes
export SIGSTORE ?= no
export SLSA ?= yes
export SBOM ?= yes
export JAVADOC ?= no
export SNAPSHOT ?= no
endif

export RELEASE_VERSION ?= $(shell cat .version)

export ERROR_PRONE_VERSION ?= 2.26.1
export J2OBJC_VERSION ?= 3.0.0

ifeq ($(SNAPSHOT),yes)
export CHECKER_FRAMEWORK_VERSION ?= 3.43.0-SNAPSHOT
export GUAVA_VERSION ?= 1.0-HEAD-jre-SNAPSHOT
export GUAVA_FAILUREACCESS_VERSION ?= 1.0.3-jpms
export REACTIVE_STREAMS_VERSION ?= 1.0.5-SNAPSHOT
export PROTOBUF_VERSION ?= 4.27.0-SNAPSHOT
export GEANTYREF_VERSION ?= 1.3.16-SNAPSHOT
export KOTLINX_COLLECTIONS_VERSION ?= 0.4.1
export KOTLINX_COLLECTIONS_POSTFIX ?= SNAPSHOT
export MAVEN_RESOLVER_VERSION ?= 2.0.0-SNAPSHOT
else
export CHECKER_FRAMEWORK_VERSION ?= 3.43.0-SNAPSHOT
export GUAVA_VERSION ?= 33.1.0-jre-jpms
export GUAVA_FAILUREACCESS_VERSION ?= 1.0.3-jpms
export REACTIVE_STREAMS_VERSION ?= 1.0.5-jpms
export PROTOBUF_VERSION ?= 4.26.1-jpms
export GEANTYREF_VERSION ?= 1.3.15-jpms
export KOTLINX_COLLECTIONS_VERSION ?= 0.4.1
export KOTLINX_COLLECTIONS_POSTFIX ?= jpms
export MAVEN_RESOLVER_VERSION ?= 2.10.0-alpha-10-jpms
endif

export PROJECT ?= $(shell pwd)
export DEV_ROOT ?= $(PROJECT)/.dev
export DEV_BIN ?= $(DEV_ROOT)/bin
export LIBS ?= $(PROJECT)/libs
export PROJECT_PATH ?= $(DEV_BIN):$(shell echo $$PATH)

DEPS ?= com.google.guava org.checkerframework org.reactivestreams com.google.protobuf io.leangen.geantyref kotlinx.collections.immutable
POSIX_FLAGS ?=

ifeq ($(VERBOSE),yes)
export RULE ?=
export POSIX_FLAGS += -v
else
export RULE = @
endif

include tools/common.mk
DEV_LOCAL = $(DEV_ROOT) $(DEV_BIN) $(DEV_BIN)/protoc
BUILD_DEPS ?= $(DEV_LOCAL)


all: setup $(BUILD_DEPS) packages repository samples tools test indexer  ## Build all targets and setup the repository.

update-modules:  ## Update all sub-modules.
	$(info Updating Attic submodules...)
	$(RULE)$(GIT) submodule update --recursive --remote --jobs=10

setup: node_modules/  ## Setup local codebase features; performs first-run stuff.
	$(info JPMS codebase ready.)

node_modules/:
	$(RULE)$(PNPM) install --frozen-lockfile --strict-peer-dependencies

repository: $(DEPS) $(LIBS) prebuilts  ## Build the repository layout.
	$(info Building repository layout...)
	@echo "Repository info:"
	@echo "- Location: $(REPOSITORY)"

#
# Library: Error Prone ---------------------------------------------------------------------

errorprone: com.google.errorprone  ## Build the Error Prone Compiler.
com.google.errorprone: $(BUILD_DEPS) com.google.errorprone/annotations/target
com.google.errorprone/annotations/target:
	$(info Building Error Prone Compiler...)
	$(RULE)cd com.google.errorprone \
		&& $(MAVEN) versions:set -DnewVersion=$(ERROR_PRONE_VERSION) \
		&& $(MAVEN) versions:update-child-modules \
		&& $(MAVEN) $(MAVEN_GOAL) \
		&& $(MAVEN) $(DEPLOY_TASK) \
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

#
# Library: J2ObjC --------------------------------------------------------------------------

j2objc: com.google.j2objc  ## Build the J2ObjC annotations.
com.google.j2objc: $(BUILD_DEPS) com.google.j2objc/annotations/target
com.google.j2objc/annotations/target:
	$(info Building J2ObjC...)
	$(RULE)cd com.google.j2objc/annotations \
		&& $(MAVEN) versions:set -DnewVersion=$(J2OBJC_VERSION) \
		&& $(MAVEN) versions:update-child-modules \
		&& $(MAVEN) $(MAVEN_GOAL) -Dmaven.javadoc.skip=true \
		&& $(MAVEN) $(DEPLOY_TASK) \
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

#
# Library: Maven Resolver ------------------------------------------------------------------

maven-resolver: org.apache.maven.resolver  ## Build the Error Prone Compiler.
org.apache.maven.resolver: $(BUILD_DEPS) org.apache.maven.resolver/maven-resolver-api/target
org.apache.maven.resolver/maven-resolver-api/target:
	$(info Building Maven Resolver...)
ifeq ($(SNAPSHOT),no)
	$(RULE)cd org.apache.maven.resolver \
		&& $(MAVEN) versions:set -DnewVersion=$(MAVEN_RESOLVER_VERSION) \
		&& $(MAVEN) versions:update-child-modules
endif

	$(RULE)cd org.apache.maven.resolver \
		&& $(MAVEN) $(MAVEN_GOAL)

ifeq ($(SNAPSHOT),no)
	@echo "Installing Maven Resolver parent..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=pom \
			-DpomFile=../tools/poms/maven-resolver-parent.xml \
			-Dfile=../tools/poms/maven-resolver-parent.xml \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	@echo "Installing Maven Resolver API..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver-api \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/maven-resolver-api.xml \
			-Dfile=maven-resolver-api/target/maven-resolver-api-$(MAVEN_RESOLVER_VERSION).jar \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	@echo "Installing Maven Resolver SPI..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver-spi \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/maven-resolver-spi.xml \
			-Dfile=maven-resolver-spi/target/maven-resolver-spi-$(MAVEN_RESOLVER_VERSION).jar \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	@echo "Installing Maven Resolver (Basic Connector)..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver-connector-basic \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/maven-resolver-connector-basic.xml \
			-Dfile=maven-resolver-connector-basic/target/maven-resolver-connector-basic-$(MAVEN_RESOLVER_VERSION).jar \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	@echo "Installing Maven Resolver Named Locks..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver-named-locks \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/maven-resolver-named-locks.xml \
			-Dfile=maven-resolver-named-locks/target/maven-resolver-named-locks-$(MAVEN_RESOLVER_VERSION).jar \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	@echo "Installing Maven Resolver (GnuPG Generator)..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver-generator-gnupg \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/maven-resolver-generator-gnupg.xml \
			-Dfile=maven-resolver-generator-gnupg/target/maven-resolver-generator-gnupg-$(MAVEN_RESOLVER_VERSION).jar \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	@echo "Installing Maven Resolver Implementation..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver-impl \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/maven-resolver-impl.xml \
			-Dfile=maven-resolver-impl/target/maven-resolver-impl-$(MAVEN_RESOLVER_VERSION).jar \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	@echo "Installing Maven Resolver Utilities..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver-util \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/maven-resolver-util.xml \
			-Dfile=maven-resolver-util/target/maven-resolver-util-$(MAVEN_RESOLVER_VERSION).jar \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	@echo "Installing Maven Resolver Transport (Classpath)..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver-transport-classpath \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/maven-resolver-transport-classpath.xml \
			-Dfile=maven-resolver-transport-classpath/target/maven-resolver-transport-classpath-$(MAVEN_RESOLVER_VERSION).jar \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	@echo "Installing Maven Resolver Transport (File)..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver-transport-file \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/maven-resolver-transport-file.xml \
			-Dfile=maven-resolver-transport-file/target/maven-resolver-transport-file-$(MAVEN_RESOLVER_VERSION).jar \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	@echo "Installing Maven Resolver Transport (JDK Parent)..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver-transport-jdk-parent \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=pom \
			-DpomFile=../tools/poms/maven-resolver-transport-jdk-parent.xml \
			-Dfile=../tools/poms/maven-resolver-transport-jdk-parent.xml \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	@echo "Installing Maven Resolver Transport (JDK Base)..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver-transport-jdk \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=pom \
			-DpomFile=../tools/poms/maven-resolver-transport-jdk.xml \
			-Dfile=../tools/poms/maven-resolver-transport-jdk.xml \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	@echo "Installing Maven Resolver Transport (JDK 8)..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver-transport-jdk-8 \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/maven-resolver-transport-jdk8.xml \
			-Dfile=maven-resolver-transport-jdk-parent/maven-resolver-transport-jdk-8/target/maven-resolver-transport-jdk-8-$(MAVEN_RESOLVER_VERSION).jar \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	@echo "Installing Maven Resolver Transport (JDK 11)..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver-transport-jdk-11 \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/maven-resolver-transport-jdk11.xml \
			-Dfile=maven-resolver-transport-jdk-parent/maven-resolver-transport-jdk-11/target/maven-resolver-transport-jdk-11-$(MAVEN_RESOLVER_VERSION).jar \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	@echo "Installing Maven Resolver Transport (JDK 21)..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver-transport-jdk-21 \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/maven-resolver-transport-jdk21.xml \
			-Dfile=maven-resolver-transport-jdk-parent/maven-resolver-transport-jdk-21/target/maven-resolver-transport-jdk-21-$(MAVEN_RESOLVER_VERSION).jar \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	@echo "Installing Maven Resolver Transport (Jetty)..."
	$(RULE)cd org.apache.maven.resolver && $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=org.apache.maven.resolver \
			-DartifactId=maven-resolver-transport-jetty \
			-Dversion=$(MAVEN_RESOLVER_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/maven-resolver-transport-jetty.xml \
			-Dfile=maven-resolver-transport-jetty/target/maven-resolver-transport-jetty-$(MAVEN_RESOLVER_VERSION).jar \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

		$(RULE)cd org.apache.maven.resolver && $(GIT) checkout .
		$(RULE)cd org.apache.maven.resolver && find . -name pom.xml.versionsBackup -delete
endif
		@echo "Maven Resolver ready."


#
# Library: Checker Framework ---------------------------------------------------------------

checkerframework: org.checkerframework  ## Build Checker Framework.
org.checkerframework: $(BUILD_DEPS) org.checkerframework/checker-qual/build/libs
org.checkerframework/checker-qual/build/libs:
	$(info Building Checker Framework...)
	$(RULE)cd org.checkerframework \
		&& $(GRADLE) \
			-Pversion=$(CHECKER_FRAMEWORK_VERSION) \
			:checker-qual:publishToMavenLocal \
			-x check \
			-x installGitHooks

#
# Library: Guava ---------------------------------------------------------------------------

guava: com.google.guava  ## Build Guava and all requisite dependencies.
com.google.guava: org.checkerframework com.google.guava/guava/target
com.google.guava/guava/target: com.google.guava/guava/futures/failureaccess/target
	$(info Building Guava...)
	$(RULE)cd com.google.guava \
		&& $(MAVEN) versions:set -DnewVersion=$(GUAVA_VERSION) \
		&& $(MAVEN) versions:update-child-modules \
		&& $(MAVEN) $(MAVEN_GOAL) \
			-Dchecker.version=$(CHECKER_FRAMEWORK_VERSION) \
			-Derrorprone.version=$(ERROR_PRONE_VERSION) \
			-Dj2objc.version=$(J2OBJC_VERSION) \
			-Dfailureaccess.version=$(GUAVA_FAILUREACCESS_VERSION) \
			-U

	$(RULE)cd com.google.guava/guava-bom \
		&& $(MAVEN) versions:set -DnewVersion=$(GUAVA_VERSION)

ifeq ($(SNAPSHOT),no)
	$(RULE)cd com.google.guava \
		&& $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=com.google.guava \
			-DartifactId=guava-parent \
			-Dversion=$(GUAVA_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/guava-parent.xml \
			-Dfile=pom.xml \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	$(RULE)cd com.google.guava \
		&& $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=com.google.guava \
			-DartifactId=guava \
			-Dversion=$(GUAVA_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/guava.xml \
  			-Dfile=guava/target/guava-$(GUAVA_VERSION).jar \
  			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	$(RULE)cd com.google.guava \
		&& $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=com.google.guava \
			-DartifactId=guava-testlib \
			-Dversion=$(GUAVA_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/guava-testlib.xml \
			-Dfile=guava-testlib/target/guava-testlib-$(GUAVA_VERSION).jar \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	$(RULE)cd com.google.guava \
		&& $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=com.google.guava \
			-DartifactId=guava-gwt \
			-Dversion=$(GUAVA_VERSION) \
			-Dpackaging=jar \
			-DpomFile=../tools/poms/guava-gwt.xml \
			-Dfile=guava-gwt/target/guava-gwt-$(GUAVA_VERSION).jar \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)

	$(RULE)cd com.google.guava \
		&& $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=com.google.guava \
			-DartifactId=guava-bom \
			-Dversion=$(GUAVA_VERSION) \
			-Dpackaging=pom \
			-DpomFile=./guava-bom/pom.xml \
			-Dfile=./guava-bom/pom.xml \
			-DrepositoryId=jpms-local \
			-Durl=$(REPOSITORY)
endif
	$(RULE)cd com.google.guava \
		&& $(GIT) checkout . \
		&& find . -name pom.xml.versionsBackup -delete \
		&& echo "Guava ready."

com.google.guava/guava/futures/failureaccess/target:
	$(info Building Guava Failure Access...)
	$(RULE)cd com.google.guava/futures/failureaccess \
		&& $(MAVEN) versions:set -DnewVersion=$(GUAVA_FAILUREACCESS_VERSION) \
		&& $(MAVEN) $(MAVEN_GOAL) \
		&& $(GIT) checkout . \
		&& echo "Guava Failure Access ready."

#
# Library: Reactive Streams ----------------------------------------------------------------

reactivestreams: org.reactivestreams  ## Build Reactive Streams.
org.reactivestreams: $(BUILD_DEPS) org.reactivestreams/api/build/libs
org.reactivestreams/api/build/libs:
	$(info Building Reactive Streams...)
	$(RULE)cd org.reactivestreams \
		&& $(GRADLE) \
			-Pversion=$(REACTIVE_STREAMS_VERSION) \
			-PreleaseVersion=$(REACTIVE_STREAMS_VERSION) \
			$(GRADLE_GOAL) \
			publishToMavenLocal \
			publishAllPublicationsToMavenLocalRepository \
		&& echo "Reactive Streams ready."

#
# Library: Protocol Buffers ----------------------------------------------------------------

protobuf: com.google.protobuf  ## Build Protocol Buffers.
com.google.protobuf: com.google.protobuf/bazel-bin/java/core/amended_core_mvn-project.jar
com.google.protobuf/bazel-bin/java/core/amended_core_mvn-project.jar:
	$(info Building Protocol Buffers...)
	$(RULE)rm -f com.google.protobuf/.bazelrc
	$(RULE)cd com.google.protobuf && $(GIT) checkout .bazelrc
	$(RULE)$(CP) tools/project.bazelrc com.google.protobuf/project.bazelrc
	$(RULE)$(CP) tools/bazel.rc com.google.protobuf/jpms.bazelrc
	$(RULE)echo "import %workspace%/project.bazelrc" >> com.google.protobuf/.bazelrc
	$(RULE)cd com.google.protobuf \
		&& $(BAZEL) \
			build \
			//:protoc \
			//java:release
ifeq ($(TESTS),yes)
	@echo "Running Protocol Buffers testsuites..."
	$(RULE)cd com.google.protobuf \
		&& $(BAZEL) \
			test \
			//java/...
endif
	@echo "Setting Protobuf Java BOM version ('$(PROTOBUF_VERSION)')..."
	$(RULE)cd com.google.protobuf/java/bom \
		&& $(MAVEN) versions:set \
			-DnewVersion=$(PROTOBUF_VERSION) \
			-Dproject.version=$(PROTOBUF_VERSION)
	@echo "Setting Protobuf Java version ('$(PROTOBUF_VERSION)')..."
	$(RULE)cd com.google.protobuf/java \
		&& $(MAVEN) versions:set \
			-DnewVersion=$(PROTOBUF_VERSION) \
			-Dbom.version=$(PROTOBUF_VERSION) \
		&& $(MAVEN) versions:update-child-modules \
			-Dbom.version=$(PROTOBUF_VERSION)

	@echo "Publishing Protobuf Java to local repository..."

	@# parent
	$(RULE)$(CP) \
		./com.google.protobuf/java/pom.xml \
		./com.google.protobuf/bazel-bin/java/protobuf-parent-$(PROTOBUF_VERSION).xml

	@# bom
	$(RULE)$(CP) \
		./com.google.protobuf/java/bom/pom.xml \
		./com.google.protobuf/bazel-bin/java/protobuf-bom-$(PROTOBUF_VERSION).xml

	@# core
	$(RULE)$(CP) \
		./com.google.protobuf/bazel-bin/java/core/amended_core_mvn-project.jar \
		./com.google.protobuf/bazel-bin/java/core/protobuf-java-$(PROTOBUF_VERSION).jar
	$(RULE)$(CP) \
		./tools/poms/protobuf-java.xml \
		./com.google.protobuf/bazel-bin/java/core/protobuf-java-$(PROTOBUF_VERSION).xml

	@# lite
	$(RULE)$(CP) \
		./com.google.protobuf/bazel-bin/java/core/amended_lite_mvn-project.jar \
		./com.google.protobuf/bazel-bin/java/core/protobuf-javalite-$(PROTOBUF_VERSION).jar
	$(RULE)$(CP) \
		./tools/poms/protobuf-javalite.xml \
		./com.google.protobuf/bazel-bin/java/core/protobuf-javalite-$(PROTOBUF_VERSION).xml

	@# util
	$(RULE)$(CP) \
		./com.google.protobuf/bazel-bin/java/util/amended_util_mvn-project.jar \
		./com.google.protobuf/bazel-bin/java/util/protobuf-util-$(PROTOBUF_VERSION).jar
	$(RULE)$(CP) \
		./tools/poms/protobuf-util.xml \
		./com.google.protobuf/bazel-bin/java/util/protobuf-util-$(PROTOBUF_VERSION).xml

	@# kotlin
	$(RULE)$(CP) \
		./com.google.protobuf/bazel-bin/java/kotlin/amended_kotlin_mvn-project.jar \
		./com.google.protobuf/bazel-bin/java/kotlin/protobuf-kotlin-$(PROTOBUF_VERSION).jar
	$(RULE)$(CP) \
		./tools/poms/protobuf-kotlin.xml \
		./com.google.protobuf/bazel-bin/java/kotlin/protobuf-kotlin-$(PROTOBUF_VERSION).xml

	@# kotlin-lite
	$(RULE)$(CP) \
		./com.google.protobuf/bazel-bin/java/kotlin-lite/amended_kotlin-lite_mvn-project.jar \
		./com.google.protobuf/bazel-bin/java/kotlin-lite/protobuf-kotlin-lite-$(PROTOBUF_VERSION).jar
	$(RULE)$(CP) \
		./tools/poms/protobuf-kotlinlite.xml \
		./com.google.protobuf/bazel-bin/java/kotlin-lite/protobuf-kotlin-lite-$(PROTOBUF_VERSION).xml

	@# parent
	$(RULE)$(MAVEN) $(DEPLOY_TASK) \
		-DgroupId=com.google.protobuf \
		-DartifactId=protobuf-parent \
		-Dversion=$(PROTOBUF_VERSION) \
		-Dpackaging=pom \
		-DpomFile=./com.google.protobuf/bazel-bin/java/protobuf-parent-$(PROTOBUF_VERSION).xml \
		-Dfile=./com.google.protobuf/bazel-bin/java/protobuf-parent-$(PROTOBUF_VERSION).xml \
		-DrepositoryId=jpms-local \
		-Durl="$(REPOSITORY)"

	@# bom
	$(RULE)$(MAVEN) $(DEPLOY_TASK) \
		-DgroupId=com.google.protobuf \
		-DartifactId=protobuf-bom \
		-Dversion=$(PROTOBUF_VERSION) \
		-Dpackaging=pom \
		-DpomFile=./com.google.protobuf/bazel-bin/java/protobuf-bom-$(PROTOBUF_VERSION).xml \
		-Dfile=./com.google.protobuf/bazel-bin/java/protobuf-bom-$(PROTOBUF_VERSION).xml \
		-DrepositoryId=jpms-local \
		-Durl="$(REPOSITORY)"

	@# core
	$(RULE)$(MAVEN) $(DEPLOY_TASK) \
		-DgroupId=com.google.protobuf \
		-DartifactId=protobuf-java \
		-Dversion=$(PROTOBUF_VERSION) \
		-Dpackaging=jar \
		-DpomFile=./com.google.protobuf/bazel-bin/java/core/protobuf-java-$(PROTOBUF_VERSION).xml \
		-Dfile=./com.google.protobuf/bazel-bin/java/core/protobuf-java-$(PROTOBUF_VERSION).jar \
		-DrepositoryId=jpms-local \
		-Durl="$(REPOSITORY)"

	@# lite
	$(RULE)$(MAVEN) $(DEPLOY_TASK) \
		-DgroupId=com.google.protobuf \
		-DartifactId=protobuf-javalite \
		-Dversion=$(PROTOBUF_VERSION) \
		-Dpackaging=jar \
		-DpomFile=./com.google.protobuf/bazel-bin/java/core/protobuf-javalite-$(PROTOBUF_VERSION).xml \
		-Dfile=./com.google.protobuf/bazel-bin/java/core/protobuf-javalite-$(PROTOBUF_VERSION).jar \
		-DrepositoryId=jpms-local \
		-Durl="$(REPOSITORY)"

	@# util
	$(RULE)$(MAVEN) $(DEPLOY_TASK) \
		-DgroupId=com.google.protobuf \
		-DartifactId=protobuf-util \
		-Dversion=$(PROTOBUF_VERSION) \
		-Dpackaging=jar \
		-DpomFile=./com.google.protobuf/bazel-bin/java/util/protobuf-util-$(PROTOBUF_VERSION).xml \
		-Dfile=./com.google.protobuf/bazel-bin/java/util/protobuf-util-$(PROTOBUF_VERSION).jar \
		-DrepositoryId=jpms-local \
		-Durl="$(REPOSITORY)"

	@# kotlin
	$(RULE)$(MAVEN) $(DEPLOY_TASK) \
		-DgroupId=com.google.protobuf \
		-DartifactId=protobuf-kotlin \
		-Dversion=$(PROTOBUF_VERSION) \
		-Dpackaging=jar \
		-DpomFile=./com.google.protobuf/bazel-bin/java/kotlin/protobuf-kotlin-$(PROTOBUF_VERSION).xml \
		-Dfile=./com.google.protobuf/bazel-bin/java/kotlin/protobuf-kotlin-$(PROTOBUF_VERSION).jar \
		-DrepositoryId=jpms-local \
		-Durl="$(REPOSITORY)"

	@# kotlin-lite
	$(RULE)$(MAVEN) $(DEPLOY_TASK) \
		-DgroupId=com.google.protobuf \
		-DartifactId=protobuf-kotlin-lite \
		-Dversion=$(PROTOBUF_VERSION) \
		-Dpackaging=jar \
		-DpomFile=./com.google.protobuf/bazel-bin/java/kotlin-lite/protobuf-kotlin-lite-$(PROTOBUF_VERSION).xml \
		-Dfile=./com.google.protobuf/bazel-bin/java/kotlin-lite/protobuf-kotlin-lite-$(PROTOBUF_VERSION).jar \
		-DrepositoryId=jpms-local \
		-Durl="$(REPOSITORY)"

	@echo "Protobuf ready."

#
# Library: Geantyref -----------------------------------------------------------------------

geantyref: io.leangen.geantyref  ## Build Geantyref reflection library.
io.leangen.geantyref: $(BUILD_DEPS) io.leangen.geantyref/target
io.leangen.geantyref/target:
	$(info Building Geantyref...)
	$(RULE)cd io.leangen.geantyref \
		&& $(MAVEN) versions:set -DnewVersion=$(GEANTYREF_VERSION) \
		&& $(MAVEN) versions:update-child-modules \
		&& $(MAVEN) $(MAVEN_GOAL) -U

ifeq ($(SNAPSHOT),no)
	@# geantyref
	$(RULE)$(MAVEN) $(DEPLOY_TASK) \
		-DgroupId=io.leangen.geantyref \
		-DartifactId=geantyref \
		-Dversion=$(GEANTYREF_VERSION) \
		-Dpackaging=jar \
		-DpomFile=./tools/poms/geantyref.xml \
		-Dfile=./io.leangen.geantyref/target/geantyref-$(GEANTYREF_VERSION).jar \
		-DrepositoryId=jpms-local \
		-Durl="$(REPOSITORY)"
endif

#
# Library: KotlinX Collections Immutable ---------------------------------------------------

kotlinx-collections: kotlinx.collections.immutable  ## Build KotlinX Immutable Collections.
kotlinx.collections.immutable: $(BUILD_DEPS) kotlinx.collections.immutable/core/build
kotlinx.collections.immutable/core/build:
	$(info Building KotlinX Immutable Collections...)
	$(RULE)cd kotlinx.collections.immutable \
		&& $(GRADLE) \
			-Pversion=$(KOTLINX_COLLECTIONS_VERSION) \
			-PversionSuffix=$(KOTLINX_COLLECTIONS_POSTFIX) \
			kotlinx-collections-immutable:publishAllPublicationsToJpmsRepository
	@echo "KotlinX Immutable Collections ready."

#
# Testing: Integration ---------------------------------------------------------------------

tests-gson:  ## Build GSON against local libraries.
	$(RULE)$(MAKE) -C tests/integration gson

tests-checkstyle:  ## Build Checkstyle against local libraries.
	$(RULE)$(MAKE) -C tests/integration checkstyle

tests-pmd:  ## Build PMD against local libraries.
	$(RULE)$(MAKE) -C tests/integration pmd

#
# Top-level commands
#

site:  ## Build and run the Jekyll site.
	$(info Building site...)
	$(RULE)bundle install
	$(RULE)bundle exec jekyll serve

samples:  ## Build samples.
	$(info Building samples...)
	$(RULE)$(MAKE) -C samples

test:  ## Build and run integration and smoke tests.
	$(info Running local testsuite...)
	$(RULE)$(MAKE) -C tests PROJECT=$(PROJECT) LIBS=$(LIBS) REPOSITORY=$(REPOSITORY)

tools:  ## Build ancillary libraries.
	$(info Building ancillary libraries...)
	$(RULE)$(MAKE) -C tools PROJECT=$(PROJECT) RELEASE=$(RELEASE_VERSION) LIBS=$(LIBS) REPOSITORY=$(REPOSITORY)

indexer:  ## Run the indexer tool.
	$(info Rebuilding)
	$(RULE)$(PNPM) run indexer

help:  ## Show this help text ('make help').
	$(info JPMS Attic:)
	@grep -E '^[a-z1-9A-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

#
# Local Dev Targets
#

dev: $(DEV_LOCAL)  ## Setup local development tooling.
$(DEV_LOCAL):
	@echo "Setting up local dev root..."
	$(RULE)$(MKDIR) -p $(DEV_ROOT) $(DEV_BIN)
	$(RULE)rm -f com.google.protobuf/.bazelrc
	$(RULE)cd com.google.protobuf && $(GIT) checkout .bazelrc
	$(RULE)$(CP) tools/project.bazelrc com.google.protobuf/project.bazelrc
	$(RULE)$(CP) tools/bazel.rc com.google.protobuf/jpms.bazelrc
	$(RULE)echo "import %workspace%/project.bazelrc" >> com.google.protobuf/.bazelrc
	@echo "Building 'protoc'..."
	$(RULE)cd com.google.protobuf && $(BAZEL) build //:protoc
	@echo "Mounting 'protoc'..."
	$(RULE)$(CP) ./com.google.protobuf/bazel-bin/protoc $(DEV_BIN)/protoc

#
# Aggregate targets
#

$(LIBS):
	@echo "Packaging libraries..."
	$(RULE)$(MKDIR) $(LIBS)
	$(RULE)$(CP) \
		com.google.guava/guava/target/*.jar \
		com.google.protobuf/bazel-bin/java/*/amended_*_mvn-project.jar \
		io.leangen.geantyref/target/*.jar \
		kotlinx.collections.immutable/core/build/libs/*.jar \
		org.checkerframework/checker-qual/build/libs/*.jar \
		org.reactivestreams/api/build/libs/*.jar \
		$(LIBS)

prebuilts:
	@echo "Installing pre-built libraries..."
	$(RULE)$(MAVEN) $(DEPLOY_TASK) \
		-DgroupId=com.google.guava \
		-DartifactId=failureaccess \
		-Dversion=1.0.3-jpms \
		-Dpackaging=jar \
		-DpomFile=./tools/poms/failureaccess.xml \
		-Dfile=./tools/prebuilt/failureaccess-1.0.3-jpms.jar \
		-DrepositoryId=jpms-local \
		-Durl="$(REPOSITORY)"

git-add:
	$(GIT) add -f \
		repository/com/google/guava \
		repository/com/google/j2objc \
		repository/com/google/errorprone \
		repository/com/google/protobuf \
		repository/io/leangen/geantyref \
		repository/kotlinx \
		repository/org/checkerframework \
		repository/org/reactivestreams \
		repository/dev/javamodules
	$(GIT) status -sb

index:  ## Rebuild JSON indexes for the repository.
	@echo Stubbed

packages:  ## Build JavaScript packages.
	$(info Building packages...)
	$(RULE)$(PNPM) run build && $(PNPM) run test:node

clean:  ## Clean all built targets.
	$(info Cleaning outputs...)
	$(RULE)$(RMDIR) \
		$(LIBS) \
		com.google.errorprone/*/target \
		com.google.j2objc/annotations/target \
		com.google.guava/*/target \
		com.google.guava/futures/failureaccess/target \
		org.apache.maven.resolver/*/target \
		org.checkerframework/build \
		org.checkerframework/*/build \
		org.reactivestreams/*/build \
		io.leangen.geantyref/target \
		kotlinx.collections.immutable/build \
		kotlinx.collections.immutable/*/build \
		samples/gradle-platform/app/build \
		samples/modular-guava/app/build \
		samples/modular-guava-repo/app/build \
		samples/modular-guava-maven/target \
		samples/modular-proto/build \
		samples/modular-proto/app/build \
		tools/bom/target \
		tools/catalog/build \
		tools/graph/target \
		tools/platform/build

distclean: clean  ## Clean downloaded material and local dev tools.
	$(info Cleaning dist...)
	$(RULE)$(RM) -fr $(DEV_LOCAL) $(LIBS) $(M2_LOCAL)
	$(RULE)cd com.google.protobuf && $(BAZEL) clean

reset: distclean  ## Reset the codebase as well as performing a `distclean`.
	$(info Resetting codebase...)
	$(RULE)$(GIT) reset --hard

forceclean: reset  ## DANGEROUS: Wipe all untracked files and other changes; completely reset.
	$(info Sanitizing codebase...)
	$(RULE)$(GIT) clean -xdf

.PHONY: all repository packages samples test tools indexer $(DEPS) com.google.protobuf/bazel-bin/java/core/amended_core_mvn-project.jar
