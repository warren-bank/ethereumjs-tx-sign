#!/usr/bin/env bash

# ----------------------------------------

# lxterminal -e testrpc --account="0xe922354a3e5902b5ac474f3ff08a79cff43533826b8f451ae2190b65a9d26158,ffffffffffffffffff"

# ----------------------------------------

if [ ! -d "./js/node_modules" ]; then
  echo 'installing npm dependencies for test...'
  (cd ./js; npm install --production)

  if [ $? -eq 0 ]; then
    echo -e "\n"'installation of dependencies completed successfully.'
  else
    echo -e "\n"'installation of dependencies completed with errors.'
    exit 1
  fi
fi

# ----------------------------------------

log='./run.log'

./js/deploy_and_validate.js &> "$log"
