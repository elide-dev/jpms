#!/bin/bash

RED="\033[31m";
GRAY="\033[90m";
ENDCOLOR="\033[0m";

success="✅";
failure="⚠️";

bash -c "$2" 2> /dev/null > /dev/null;
_ret=$?

if [ $_ret -ne 0 ] ; then
    echo -e "$failure $1 ${GRAY}${2}${ENDCOLOR}"
    exit $_ret
else
    echo -e "$success $1 ${GRAY}${2}${ENDCOLOR}";
fi
