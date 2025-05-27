#!/bin/bash

echo "Starting Snapshot Updater API..."
export GAIANET_CONFIG_PATH="/root/gaianet/config.json"
node /opt/snapshot_updater_api/server.js &

/root/gaianet/bin/gaianet init
/root/gaianet/bin/gaianet start
tail -f /root/gaianet/log/start-llamaedge.log
