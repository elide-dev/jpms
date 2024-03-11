#
# JPMS Attic: Tests
#

include ../tools/common.mk

all: smoke-tests integration-tests

smoke-tests:
	$(RULE)$(MAKE) -C smoke PROJECT=$(PROJECT) LIBS=$(LIBS)

integration-tests:
	$(RULE)$(MAKE) -C integration PROJECT=$(PROJECT) LIBS=$(LIBS)
