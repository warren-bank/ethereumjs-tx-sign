#!/usr/bin/env bash

# lxterminal -e testrpc --account="0xe922354a3e5902b5ac474f3ff08a79cff43533826b8f451ae2190b65a9d26158,ffffffffffffffffff"

# ----------------------------------------

log='./run.log'

./js/deploy_and_validate.js &> "$log"
