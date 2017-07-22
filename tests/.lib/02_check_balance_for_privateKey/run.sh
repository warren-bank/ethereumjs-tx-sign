#!/usr/bin/env bash

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

./js/check_balance_for_privateKey.js &> "$log"
