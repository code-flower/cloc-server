#!/bin/bash

echo 'WS tests'
node test/oddballs --remote
node test/battery --remote

echo $'\nHTTP tests'
node test/oddballs --http --remote
node test/battery --http --remote