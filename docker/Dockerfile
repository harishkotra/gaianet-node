# syntax=docker/dockerfile:1

FROM ubuntu:22.04
ARG CONFIG_URL=https://raw.githubusercontent.com/GaiaNet-AI/node-configs/main/qwen2-0.5b-instruct/config.json
RUN apt-get update && apt-get install -y curl lsof nodejs npm
RUN curl -sSfL 'https://github.com/GaiaNet-AI/gaianet-node/releases/latest/download/install.sh' | bash
RUN /root/gaianet/bin/gaianet init --config $CONFIG_URL; rm -rf /root/gaianet/qdrant/storage/*; rm -rf /root/gaianet/qdrant/snapshots/*; rm /root/gaianet/nodeid.json
RUN cd /root/gaianet; curl -LO https://raw.githubusercontent.com/GaiaNet-AI/gaianet-node/main/nodeid.json; cd ~

# Copy snapshot updater API files
COPY snapshot_updater_api /opt/snapshot_updater_api

# Install snapshot updater API dependencies
WORKDIR /opt/snapshot_updater_api
RUN npm install --omit=dev

# Reset WORKDIR before copying run.sh
WORKDIR /root 

COPY run.sh .
RUN chmod +x run.sh

ENTRYPOINT ./run.sh "$@"
