#
# JPMS Attic: Tools
#

include common.mk

TOOLS_VERSION ?= 1.0.0

GRADLE_TOOL_ARGS ?= -Pversion="$(TOOL_VERSION)" -PtoolsVersion="$(TOOLS_VERSION)"

all: tools

tools: bom catalog platform

bom: bom/target
bom/target:
	$(info Building BOM publication...)
	$(RULE)cd bom && mvnw package && mkdir target \
		&& $(MAVEN) deploy:deploy-file \
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
			publishAllPublicationsToAtticRepository

platform: platform/build
platform/build:
	$(info Building Gradle Platform publication...)
	$(RULE)cd platform && \
		../gradlew \
			$(GRADLE_ARGS) \
			$(GRADLE_TOOL_ARGS) \
			build \
			publishToMavenLocal \
			publishAllPublicationsToAtticRepository

.PHONY: bom catalog platform
