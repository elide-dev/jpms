#
# JPMS Attic: Samples
#

include ../tools/common.mk

all: modular-guava modular-guava-repo modular-guava-maven
	@echo "Samples ready."

modular-guava: modular-guava/app/build
modular-guava/app/build:
	@echo "Building Modular Guava sample (Gradle, local repo)..."
	$(RULE)cd modular-guava && ./gradlew :app:build -x test -x check

modular-guava-repo: modular-guava-repo/app/build
modular-guava-repo/app/build:
	@echo "Building Modular Guava sample (Gradle, remote repo)..."
	$(RULE)cd modular-guava-repo && ./gradlew :app:build -x test -x check --refresh-dependencies

modular-guava-maven: modular-guava-maven/target
modular-guava-maven/target:
	@echo "Building Modular Guava sample (Maven, remote repo)..."
	$(RULE)cd modular-guava-maven && mvnw clean package exec:exec@modular
