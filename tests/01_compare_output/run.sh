#!/usr/bin/env bash

log='./run.log'

./js/compare_output.js &> "$log"
