#!/bin/bash

# IPL Prediction Bot - Installation Script
# This script automates the installation process

echo "🏏 IPL Prediction Bot - Installation Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "📦 Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo "Please install Node.js 18 or higher from: https://nodejs.org"
    exit 1
fi

# Check Node version
REQUIRED_VERSION=18
CURRENT_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$CURRENT_VERSION" -lt "$REQUIRED_VERSION" ]; then
    echo -e "${RED}❌ Node.js version must be $REQUIRED_VERSION or higher${NC}"
    echo "Current version: $NODE_VERSION"
    echo "Please upgrade Node.js"
    exit 1
fi

# Check if MongoDB is installed
echo ""
echo "💾 Checking MongoDB installation..."
if command -v mongod &> /dev/null; then
    MONGO_VERSION=$(mongod --version | grep "db version" | cut -d'v' -f2)
    echo -e "${GREEN}✅ MongoDB installed: v$MONGO_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB not found locally${NC}"
    echo "You can either:"
    echo "  1. Install MongoDB locally"
    echo "  2. Use MongoDB Atlas (cloud) - recommended"
fi

# Install dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
if npm install; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Check if .env exists
echo ""
echo "🔐 Checking configuration..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo ""
    echo "Would you like to run the interactive setup wizard? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        npm run setup
    else
        echo "Please create .env file manually:"
        echo "  cp .env.example .env"
        echo "  nano .env"
        echo ""
        echo "Then run: npm run check-setup"
    fi
fi

# Verify setup
echo ""
echo "🔍 Verifying configuration..."
if [ -f ".env" ]; then
    if npm run check-setup; then
        echo ""
        echo -e "${GREEN}✅ Setup verification passed!${NC}"
    else
        echo ""
        echo -e "${RED}❌ Setup verification failed${NC}"
        echo "Please fix the errors above"
        exit 1
    fi
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Installation Complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  If you haven't configured .env yet:"
echo "    npm run setup"
echo ""
echo "2️⃣  Start MongoDB (if using locally):"
echo "    mongod"
echo ""
echo "3️⃣  (Optional) Initialize database with sample data:"
echo "    npm run init-db"
echo ""
echo "4️⃣  Start the bot:"
echo "    npm start"
echo ""
echo "5️⃣  For development with auto-reload:"
echo "    npm run dev"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: QUICKSTART.md"
echo "   - Full Docs: README.md"
echo "   - Examples: EXAMPLES.md"
echo "   - Deployment: DEPLOYMENT.md"
echo ""
echo "🆘 Need help? Check the documentation files above!"
echo ""
