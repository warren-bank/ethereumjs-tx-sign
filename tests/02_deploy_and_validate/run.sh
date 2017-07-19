#!/usr/bin/env bash

# lxterminal -e testrpc --account="0xcc30c22d832c308b23b3885b79501a704f372950f3cd596f8c9150500405badf,ffffffffffffffffff"

# ----------------------------------------

log='./run.log'

./js/deploy_and_validate.js &> "$log"
