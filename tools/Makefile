#
# JPMS Attic: Tools
#

include common.mk

RELEASE ?= 1.0.0
TOOLS_VERSION ?= $(RELEASE)

GRADLE_TOOL_ARGS ?= -Pversion="$(TOOL_VERSION)" -PtoolsVersion="$(TOOLS_VERSION)"

all: tools

tools: bom catalog platform

bom: bom/target
bom/target:
	$(info Building BOM publication...)
	$(RULE)cd bom \
		&& mvnw versions:set -DnewVersion=$(TOOLS_VERSION) \
		&& mvnw package \
		&& mkdir target \
		&& $(MAVEN) $(DEPLOY_TASK) \
			-DgroupId=dev.javamodules \
			-DartifactId=jpms-bom \
			-Dversion=$(TOOLS_VERSION) \
			-Dpackaging=pom \
			-DpomFile=./pom.xml \
  			-Dfile=./pom.xml \
  			-DrepositoryId=jpms-local \
  			-Durl=$(REPOSITORY)

catalog: catalog/build
catalog/build:
	$(info Building Gradle Version Catalog publication...)
	$(RULE)cd catalog && \
		../gradlew \
			$(GRADLE_ARGS) \
			$(GRADLE_TOOL_ARGS) \
			generateCatalogAsToml \
			publishToMavenLocal \
			publishAllPublicationsToAtticRepository \
			--write-verification-metadata sha256,sha512,pgp \
			--export-keys \
			--write-locks

platform: platform/build
platform/build:
	$(info Building Gradle Platform publication...)
	$(RULE)cd platform && \
		../gradlew \
			$(GRADLE_ARGS) \
			$(GRADLE_TOOL_ARGS) \
			build \
			publishToMavenLocal \
			publishAllPublicationsToAtticRepository \
			--write-verification-metadata sha256,sha512,pgp \
			--export-keys \
			--write-locks

.PHONY: bom catalog platform
