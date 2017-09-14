#!/bin/bash

# run the app in production mode

NODE_ENV=production
NODE_LOCATION=remote
pm2 start config/pm2.config.js
pm2 trigger pm2-autohook start
pm2 trigger pm2-health-check start