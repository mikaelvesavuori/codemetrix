#!/bin/bash

# Colors
GREEN='\033[0;32m'
RESET='\033[0m' # Reset color to default

# Presentation
echo -e "${GREEN}--- Codemetrix: Understand the level of coupling and changeability of your code in a second. ---${RESET}"

# Main function
start() {
  node ~/.codemetrix/index.mjs $1
}

start "$@"
