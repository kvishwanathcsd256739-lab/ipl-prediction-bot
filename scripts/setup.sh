#!/bin/bash
# =============================================================
# IPL Prediction Bot - Automated Setup Script (Unix/macOS/Linux)
# =============================================================
# Usage: chmod +x scripts/setup.sh && ./scripts/setup.sh

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   IPL Prediction Bot - Setup Script        ${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# -------------------------------------------------------
# Step 1: Check Node.js
# -------------------------------------------------------
echo -e "${YELLOW}[1/6] Checking Node.js...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo "Please install Node.js v16+ from https://nodejs.org"
    echo ""
    echo "Quick install on Ubuntu/Debian:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    echo ""
    echo "Quick install on macOS:"
    echo "  brew install node"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js found: $NODE_VERSION${NC}"

# Check version is >= 16
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | tr -d 'v')
if [ "$NODE_MAJOR" -lt 16 ]; then
    echo -e "${RED}❌ Node.js v16+ required. Found: $NODE_VERSION${NC}"
    exit 1
fi

# -------------------------------------------------------
# Step 2: Check npm
# -------------------------------------------------------
echo -e "${YELLOW}[2/6] Checking npm...${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found!${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm found: v$NPM_VERSION${NC}"

# -------------------------------------------------------
# Step 3: Install Node.js dependencies
# -------------------------------------------------------
echo -e "${YELLOW}[3/6] Installing Node.js dependencies...${NC}"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found! Run this script from the project root directory.${NC}"
    exit 1
fi

npm install

echo -e "${GREEN}✅ Node.js dependencies installed${NC}"

# -------------------------------------------------------
# Step 4: Set up environment file
# -------------------------------------------------------
echo -e "${YELLOW}[4/6] Setting up environment configuration...${NC}"

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env from .env.example${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env with your credentials:${NC}"
        echo "   - TELEGRAM_BOT_TOKEN"
        echo "   - MONGODB_URI"
        echo "   - RAZORPAY_KEY_ID"
        echo "   - RAZORPAY_KEY_SECRET"
        echo "   - ADMIN_USER_ID"
    else
        echo -e "${YELLOW}⚠️  No .env.example found. Create .env manually.${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# -------------------------------------------------------
# Step 5: Check Python (optional, for ML pipeline)
# -------------------------------------------------------
echo -e "${YELLOW}[5/6] Checking Python (optional ML pipeline)...${NC}"

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ Python found: $PYTHON_VERSION${NC}"

    if [ -f "requirements.txt" ]; then
        read -p "Install Python ML dependencies? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            pip3 install -r requirements.txt
            echo -e "${GREEN}✅ Python dependencies installed${NC}"
        else
            echo -e "${YELLOW}⏭️  Skipping Python ML dependencies${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Python3 not found — ML pipeline unavailable (bot still works)${NC}"
fi

# -------------------------------------------------------
# Step 6: Check PM2 (optional, for production)
# -------------------------------------------------------
echo -e "${YELLOW}[6/6] Checking PM2 (optional production tool)...${NC}"

if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✅ PM2 found${NC}"
else
    read -p "Install PM2 process manager for production? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g pm2
        echo -e "${GREEN}✅ PM2 installed${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipping PM2 (use 'npm start' for development)${NC}"
    fi
fi

# -------------------------------------------------------
# Done!
# -------------------------------------------------------
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}   ✅ Setup Complete!                       ${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Edit your .env file with real credentials:"
echo "   nano .env"
echo ""
echo "2. Start the bot:"
echo "   npm start"
echo ""
echo "3. (Production) Start with PM2:"
echo "   pm2 start server.js --name ipl-bot"
echo ""
echo "4. Verify the bot:"
echo "   curl http://localhost:8000/health"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "   SETUP_GUIDE.md    - Detailed setup instructions"
echo "   TROUBLESHOOTING.md - Common issues and solutions"
echo ""
