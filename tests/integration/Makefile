#
# JPMS Attic: Integration Tests
#

include ../../tools/common.mk

INTEGRATION_TESTS ?= gson checkstyle

all: integration-tests

integration-tests:
	$(info Running integration tests...)
	$(RULE)$(MAKE) $(INTEGRATION_TESTS)

checkstyle:
	$(info Building Checkstyle...)
	@cd checkstyle && $(MAVEN_TEST) \
		-Dguava.version=$(GUAVA_VERSION) \
		-Derror-prone.version=$(ERROR_PRONE_VERSION) \
		--settings ../settings.xml \
		-U \
		-DskipTests \
		package

# Ghidra's build is pretty complex; it is not included for now.
ghidra:
	$(info Building Ghidra...)
	@cd ghidra && $(GRADLE_TEST) \
		-Pguava.version=$(GUAVA_VERSION) \
		-Pfailureaccess.version=1.0.3-jpms

pmd:
	$(info Building PMD...)
	@cd pmd && $(MAVEN_TEST) \
		-Dguava.version=$(GUAVA_VERSION) \
		--settings ../settings.xml \
		-U \
		-DskipTests \
		package

gson:
	$(info Building GSON...)
	@cd gson && $(MAVEN_TEST) \
		-Dprotobuf.version=$(PROTOBUF_VERSION) \
		-Dguava.version=$(GUAVA_VERSION) \
		-Derror-prone.version=$(ERROR_PRONE_VERSION) \
		--settings ../settings.xml \
		-U \
		$(MAVEN_TEST_GOAL)

.PHONY: $(INTEGRATION_TESTS)
