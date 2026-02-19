#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════╗
# ║   Voyager AI - Travel Agent Demo Startup Script                   ║
# ╚═══════════════════════════════════════════════════════════════════╝

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GOLD='\033[0;33m'
NC='\033[0m' # No Color

# Configuration
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen3:8b}"
SERVER_PORT="${PORT:-3001}"
CLIENT_PORT="${CLIENT_PORT:-3000}"

echo -e "${GOLD}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║    ✈  VOYAGER AI - Travel Agent Demo                            ║"
echo "║       Your Intelligent Travel Concierge                          ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Check Node.js
echo -e "${BLUE}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js 18+ is required. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check Ollama
echo -e "${BLUE}Checking Ollama...${NC}"
if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}⚠ Ollama is not installed.${NC}"
    echo -e "  Install from: https://ollama.ai"
    echo -e "  Or run: curl -fsSL https://ollama.ai/install.sh | sh"
else
    echo -e "${GREEN}✓ Ollama is installed${NC}"

    # Check if Ollama is running
    if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠ Ollama is not running. Starting...${NC}"
        ollama serve &
        sleep 3
    fi
    echo -e "${GREEN}✓ Ollama is running${NC}"

    # Check if model is available
    if ollama list | grep -q "$OLLAMA_MODEL"; then
        echo -e "${GREEN}✓ Model $OLLAMA_MODEL is available${NC}"
    else
        echo -e "${YELLOW}⚠ Model $OLLAMA_MODEL not found. Pulling...${NC}"
        echo -e "  This may take a few minutes..."
        ollama pull "$OLLAMA_MODEL"
        echo -e "${GREEN}✓ Model $OLLAMA_MODEL downloaded${NC}"
    fi
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install
fi

# Create logs directory
mkdir -p logs

# Clean up any existing processes
echo -e "${BLUE}Cleaning up existing processes...${NC}"
pkill -f "node server/index.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1

# Start the development servers
echo -e "${BLUE}Starting Voyager AI...${NC}"
echo ""

# Use npm run dev which runs both server and client
npm run dev &

# Wait for servers to start
echo -e "${YELLOW}Waiting for servers to start...${NC}"
sleep 5

# Check if servers are running
if curl -s "http://localhost:$SERVER_PORT/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend server is running on port $SERVER_PORT${NC}"
else
    echo -e "${YELLOW}⚠ Backend server may still be starting...${NC}"
fi

echo ""
echo -e "${GOLD}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Voyager AI is ready!${NC}"
echo ""
echo -e "  ${BLUE}Frontend:${NC}  http://localhost:$CLIENT_PORT"
echo -e "  ${BLUE}Backend:${NC}   http://localhost:$SERVER_PORT"
echo -e "  ${BLUE}WebSocket:${NC} ws://localhost:$SERVER_PORT/ws"
echo -e "  ${BLUE}API Docs:${NC}  http://localhost:$SERVER_PORT/api/health"
echo ""
echo -e "  ${GOLD}Press Ctrl+C to stop the servers${NC}"
echo -e "${GOLD}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Keep script running
wait
