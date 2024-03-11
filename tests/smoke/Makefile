#
# JPMS Attic: Smoke Tests
#

include ../../tools/common.mk

all: smoke-tests

smoke-tests:
	$(info Smoke testing all libraries...)
	$(RULE)testlibs="$(shell find $(LIBS) -type f | xargs)"; for lib in $$testlibs; do \
		bash ./testjar.sh "$$lib"; \
		echo ""; \
		done
