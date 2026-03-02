#!/usr/bin/env bash
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ___       _       __  __"
echo " / _ \  ___| |_ ___|  \/  | __ _ _ __   __ _  __ _  ___ _ __"
echo "| | | |/ __| __/ _ \ |\/| |/ _\` | '_ \ / _\` |/ _\` |/ _ \ '__|"
echo "| |_| | (__| || (_) | |  | | (_| | | | | (_| | (_| |  __/ |"
echo " \___/ \___|\__\___/_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|"
echo "                                               |___/"
echo -e "${NC}"
echo "OctoManager — Setup Script"
echo "─────────────────────────────────────────────────"

# 1. Check for Bun
if ! command -v bun &>/dev/null; then
  echo -e "${YELLOW}⚠  Bun is not installed. Install it from https://bun.sh${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Bun $(bun --version) found"

# 2. Install dependencies
echo ""
echo "Installing dependencies..."
bun install
echo -e "${GREEN}✓${NC} Dependencies installed"

# 3. Create .env.local from example
if [ ! -f ".env.local" ]; then
  cp .env.local.example .env.local
  echo -e "${GREEN}✓${NC} Created .env.local from .env.local.example"
else
  echo -e "${YELLOW}⚠  .env.local already exists — skipping copy${NC}"
fi

# 4. Done
echo ""
echo "─────────────────────────────────────────────────"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Open .env.local and fill in your values:"
echo "     • AUTH_SECRET      — run: openssl rand -base64 32"
echo "     • AUTH_GITHUB_ID   — from https://github.com/settings/developers"
echo "     • AUTH_GITHUB_SECRET"
echo "     • NEXTAUTH_URL     — http://localhost:3000"
echo ""
echo "  2. Start the development server:"
echo "     ./scripts/start.sh"
echo "     — or —"
echo "     bun run dev"
echo ""
