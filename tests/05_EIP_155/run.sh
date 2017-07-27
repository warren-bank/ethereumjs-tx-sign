#!/usr/bin/env bash

log='./run.log'

./js/compare_output.js &> "$log"

echo -e "--------------------------------------------------\n" &>> "$log"

./js/compare_RLP_encoded_values.js &>> "$log"
