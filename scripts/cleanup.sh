#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════╗
# ║   Voyager AI - Travel Agent Demo Cleanup Script                   ║
# ╚═══════════════════════════════════════════════════════════════════╝

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║   Voyager AI - Cleanup                                            ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Stop Node.js processes
echo -e "${BLUE}Stopping Node.js servers...${NC}"
pkill -f "node server/index.js" 2>/dev/null && echo -e "${GREEN}✓ Backend server stopped${NC}" || echo -e "${YELLOW}⚠ Backend server was not running${NC}"
pkill -f "vite" 2>/dev/null && echo -e "${GREEN}✓ Vite dev server stopped${NC}" || echo -e "${YELLOW}⚠ Vite was not running${NC}"

# Kill any processes on common ports
for port in 3000 3001; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        kill -9 $pid 2>/dev/null
        echo -e "${GREEN}✓ Killed process on port $port${NC}"
    fi
done

# Optional: Clean build artifacts
read -p "Clean build artifacts and logs? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Cleaning build artifacts...${NC}"
    rm -rf dist 2>/dev/null && echo -e "${GREEN}✓ Removed dist/${NC}"
    rm -rf logs/*.log 2>/dev/null && echo -e "${GREEN}✓ Cleared logs${NC}"
fi

# Optional: Clean node_modules
read -p "Remove node_modules? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Removing node_modules...${NC}"
    rm -rf node_modules
    echo -e "${GREEN}✓ Removed node_modules${NC}"
fi

echo ""
echo -e "${GREEN}✓ Cleanup complete!${NC}"
echo ""
