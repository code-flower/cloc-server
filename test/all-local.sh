#!/bin/bash

echo 'WS tests'
node test/oddballs
node test/battery

echo $'\nHTTP tests'
node test/oddballs --http
node test/battery --http