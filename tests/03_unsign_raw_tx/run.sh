#!/usr/bin/env bash

log='./run.log'

./js/unsign_raw_tx.js &> "$log"
