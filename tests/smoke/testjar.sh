#!/bin/bash

RED="\033[31m";
GRAY="\033[90m";
ENDCOLOR="\033[0m";

lib="$1";

echo -e "- ${GRAY}Testing${ENDCOLOR} ${lib}";
bash ./smoketest.sh "exists" "file $lib";
bash ./smoketest.sh "valid jar" "jar --validate --file $lib";
bash ./smoketest.sh "valid module" "jar --describe-module --file $lib";
