#
# JPMS Attic: Samples
#

include ../tools/common.mk

all: modular-guava modular-guava-repo
	@echo "Samples ready."

modular-guava: modular-guava/app/build
modular-guava/app/build:
	@echo "Building Modular Guava sample..."
	$(RULE)cd modular-guava && ./gradlew :app:build -x test -x check

modular-guava-repo: modular-guava-repo/app/build
modular-guava-repo/app/build:
	@echo "Building Modular Guava sample (remote repo)..."
	$(RULE)cd modular-guava-repo && ./gradlew :app:build -x test -x check --refresh-dependencies
