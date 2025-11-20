#!/bin/bash

# ================================================
# QUIENTETO.CA - Setup Script
# ================================================
# This script helps set up quienteto.ca for development with Supabase
# ================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   🎁 QUIENTETO.CA SETUP WIZARD 🎁      ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# ================================================
# Check Prerequisites
# ================================================

echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js found ($NODE_VERSION)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm found (v$NPM_VERSION)${NC}"

# ================================================
# Setup Environment Files
# ================================================

echo ""
echo -e "${YELLOW}🔧 Setting up environment files...${NC}"

# Root .env (legacy, might not be needed)
if [ ! -f ".env" ]; then
    echo -e "${BLUE}Creating .env from .env.example...${NC}"
    cp .env.example .env 2>/dev/null || echo -e "${YELLOW}⚠️  No .env.example in root (optional)${NC}"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    echo -e "${BLUE}Creating frontend/.env from .env.example...${NC}"
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
else
    echo -e "${GREEN}✓ frontend/.env already exists${NC}"
fi

# ================================================
# Configure Supabase
# ================================================

echo ""
echo -e "${YELLOW}⚙️  Configure Supabase credentials now? (y/n)${NC}"
echo -e "${BLUE}   (You'll need a Supabase project. See docs/SUPABASE_SETUP.md)${NC}"
read -r configure_supabase

if [ "$configure_supabase" = "y" ] || [ "$configure_supabase" = "Y" ]; then
    echo ""
    echo -e "${BLUE}Please enter your Supabase credentials:${NC}"

    # Supabase URL
    echo -e "${YELLOW}Supabase URL (e.g., https://xxxxx.supabase.co):${NC}"
    read -r supabase_url
    if [ -n "$supabase_url" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=$supabase_url|" frontend/.env
        else
            # Linux
            sed -i "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=$supabase_url|" frontend/.env
        fi
        echo -e "${GREEN}✓ Supabase URL updated${NC}"
    fi

    # Supabase Anon Key
    echo -e "${YELLOW}Supabase Anon Key:${NC}"
    read -r supabase_key
    if [ -n "$supabase_key" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|VITE_SUPABASE_ANON_KEY=.*|VITE_SUPABASE_ANON_KEY=$supabase_key|" frontend/.env
        else
            # Linux
            sed -i "s|VITE_SUPABASE_ANON_KEY=.*|VITE_SUPABASE_ANON_KEY=$supabase_key|" frontend/.env
        fi
        echo -e "${GREEN}✓ Supabase Anon Key updated${NC}"
    fi

    echo -e "${GREEN}✓ Configuration saved to frontend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping Supabase configuration.${NC}"
    echo -e "${BLUE}   You can manually edit frontend/.env later.${NC}"
fi

# ================================================
# Install Frontend Dependencies
# ================================================

echo ""
echo -e "${YELLOW}📦 Install frontend dependencies now? (y/n)${NC}"
read -r install_deps

if [ "$install_deps" = "y" ] || [ "$install_deps" = "Y" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}Skipping npm install. Run 'cd frontend && npm install' later.${NC}"
fi

# ================================================
# Success Message
# ================================================

echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════╗"
echo "║     🎉 SETUP COMPLETE! 🎉              ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}Your quienteto.ca installation is ready!${NC}"
echo ""
echo -e "${YELLOW}🚀 Next steps:${NC}"
echo ""
echo -e "${BLUE}1. Configure Supabase (if not done):${NC}"
echo -e "   • Create Supabase project: ${GREEN}https://supabase.com${NC}"
echo -e "   • Follow guide: ${GREEN}docs/SUPABASE_SETUP.md${NC}"
echo -e "   • Update ${BLUE}frontend/.env${NC} with credentials"
echo ""
echo -e "${BLUE}2. Start development server:${NC}"
echo -e "   ${GREEN}cd frontend && npm run dev${NC}"
echo ""
echo -e "${BLUE}3. Access your app:${NC}"
echo -e "   ${GREEN}http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo -e "   • Supabase setup:    ${BLUE}docs/SUPABASE_SETUP.md${NC}"
echo -e "   • Architecture:      ${BLUE}ARCHITECTURE.md${NC}"
echo -e "   • Testing guide:     ${BLUE}TESTING.md${NC}"
echo -e "   • Self-hosting:      ${BLUE}docs/SELF_HOSTING.md${NC}"
echo ""
echo -e "${YELLOW}🧪 Run tests:${NC}"
echo -e "   ${GREEN}cd frontend && npm test${NC}"
echo ""
echo -e "${GREEN}Happy gifting! 🎁${NC}"
echo ""
