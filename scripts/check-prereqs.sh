#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════╗
# ║   Voyager AI - Check Prerequisites Script                         ║
# ╚═══════════════════════════════════════════════════════════════════╝

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Checking prerequisites for Voyager AI...${NC}"
echo ""

ERRORS=0

# Check Node.js
echo -n "Node.js: "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo -e "${GREEN}✓ $NODE_VERSION${NC}"
    else
        echo -e "${RED}✗ Version 18+ required (found $NODE_VERSION)${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗ Not installed${NC}"
    echo "  Install: https://nodejs.org/"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
echo -n "npm: "
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓ $(npm -v)${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check Ollama
echo -n "Ollama: "
if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✓ Installed${NC}"

    # Check if running
    echo -n "  └─ Server: "
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Running${NC}"

        # Check for qwen3:8b model
        echo -n "  └─ qwen3:8b: "
        if ollama list 2>/dev/null | grep -q "qwen3:8b"; then
            echo -e "${GREEN}✓ Available${NC}"
        else
            echo -e "${YELLOW}⚠ Not pulled (run: ollama pull qwen3:8b)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Not running (run: ollama serve)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Not installed${NC}"
    echo "  Install: https://ollama.ai"
fi

# Check ports
echo ""
echo "Port availability:"
for port in 3000 3001 11434; do
    echo -n "  Port $port: "
    if ! lsof -i:$port > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Available${NC}"
    else
        PROC=$(lsof -ti:$port 2>/dev/null | head -1)
        echo -e "${YELLOW}⚠ In use (PID: $PROC)${NC}"
    fi
done

echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All prerequisites met!${NC}"
    echo "  Run: npm run start"
else
    echo -e "${RED}✗ $ERRORS prerequisite(s) missing${NC}"
    exit 1
fi
