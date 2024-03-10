#
# JPMS Attic: Samples
#

include ../tools/common.mk

all: modular-guava
	@echo "Samples ready."

modular-guava: modular-guava/app/build
modular-guava/app/build:
	@echo "Building Modular Guava sample..."
	$(RULE)cd modular-guava && ./gradlew :app:build -x test -x check
