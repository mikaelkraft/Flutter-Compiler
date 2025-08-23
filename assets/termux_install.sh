#!/bin/bash
# Flutter Compiler Installer for Termux
# Enhanced Version - Mikael Kraft (@mikaelkraft)

set -e # Exit immediately if any command fails

# Colors for better UX
RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Version Configuration
FLUTTER_VERSION="3.35.1"
FLUTTER_URL="https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz"

# Dependency Check
required_pkgs=("git" "wget" "openjdk-17" "dart" "cmake" "ninja" "clang")
missing_pkgs=()

echo -e "${YELLOW}🔍 Checking dependencies...${NC}"
for pkg in "${required_pkgs[@]}"; do
    if ! pkg show "$pkg" &>/dev/null; then
        missing_pkgs+=("$pkg")
    fi
done

# Installation
if [ ${#missing_pkgs[@]} -gt 0 ]; then
    echo -e "${YELLOW}⬇️ Installing missing packages: ${missing_pkgs[*]}${NC}"
    pkg update -y && pkg install -y "${missing_pkgs[@]}" || {
        echo -e "${RED}❌ Failed to install packages${NC}"
        exit 1
    }
fi

# Flutter Installation
echo -e "${YELLOW}🚀 Downloading Flutter v${FLUTTER_VERSION}...${NC}"
if wget -q "$FLUTTER_URL"; then
    echo -e "${GREEN}✔ Download completed${NC}"
else
    echo -e "${RED}❌ Download failed${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Extracting archive...${NC}"
if tar xf flutter_linux_*.tar.xz; then
    rm flutter_linux_*.tar.xz
    echo -e "${GREEN}✔ Extraction successful${NC}"
else
    echo -e "${RED}❌ Extraction failed${NC}"
    exit 1
fi

# Environment Setup
echo -e "${YELLOW}⚙️ Configuring paths...${NC}"
if ! grep -q 'flutter/bin' ~/.bashrc; then
    echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
    echo 'export PATH="$PATH:$HOME/.pub-cache/bin"' >> ~/.bashrc
fi

# Immediate PATH update
export PATH="$PATH:$HOME/flutter/bin"
export PATH="$PATH:$HOME/.pub-cache/bin"

# Verification
echo -e "${YELLOW}✅ Verifying installation...${NC}"
if flutter doctor --no-upgrade; then
    echo -e "\n${GREEN}🎉 Flutter installed successfully!${NC}"
    echo -e "Restart Termux or run: ${YELLOW}source ~/.bashrc${NC}"
else
    echo -e "${RED}⚠️ Flutter installed but doctor reported issues${NC}"
    echo "Check manually with: flutter doctor"
fi

# Cleanup
unset RED GREEN YELLOW NC FLUTTER_VERSION FLUTTER_URL required_pkgs missing_pkgs