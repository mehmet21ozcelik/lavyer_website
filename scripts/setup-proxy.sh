#!/bin/bash

# GSD METHODOLOGY - Mission Control Rules
# Project: Lavyer Website - Nginx Proxy Manager Migration

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}>>> Starting Nginx Proxy Manager Migration Setup...${NC}"

# 1. Clean up orphan containers
echo -e "${GREEN}>>> Step 1: Cleaning up orphan Nginx containers...${NC}"
# This removes containers associated with lavyer_website project that are not in the current compose
docker compose down --remove-orphans

# 2. Create the external network
echo -e "${GREEN}>>> Step 2: Creating Docker network 'web-network'...${NC}"
if docker network ls | grep -q "web-network"; then
    echo "Network 'web-network' already exists."
else
    docker network create web-network
    echo "Network 'web-network' created successfully."
fi

# 3. Setup NPM directory
echo -e "${GREEN}>>> Step 3: Setting up Nginx Proxy Manager...${NC}"
mkdir -p ~/nginx-proxy-manager
cd ~/nginx-proxy-manager

cat <<EOF > docker-compose.yml
version: '3.8'
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'
      - '81:81'
      - '443:443'
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks:
      - web-network

networks:
  web-network:
    external: true
EOF

# 4. Starting NPM
echo -e "${GREEN}>>> Step 4: Starting Nginx Proxy Manager...${NC}"
docker compose up -d

echo -e "${GREEN}>>> Setup Complete!${NC}"
echo -e "${GREEN}>>> 1. Open NPM Admin at http://YOUR_SERVER_IP:81${NC}"
echo -e "${GREEN}>>> 2. Default login: admin@example.com / changeme${NC}"
echo -e "${GREEN}>>> 3. Configure Proxy Host for lavyer.com to point to 'app' on port 3000.${NC}"
