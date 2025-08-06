#!/bin/bash

# Verify NPM Package Provenance Script
# This script helps verify that a package was published with provenance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔒 NPM Package Provenance Verification${NC}"
echo "=================================="

# Check if npm version supports provenance
NPM_VERSION=$(npm --version)
REQUIRED_VERSION="9.5.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NPM_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo -e "${RED}❌ Error: npm version $NPM_VERSION is too old.${NC}"
    echo "Provenance verification requires npm version $REQUIRED_VERSION or higher."
    echo "Please update npm: npm install -g npm@latest"
    exit 1
fi

echo -e "${GREEN}✅ npm version $NPM_VERSION supports provenance verification${NC}"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the root of your project."
    exit 1
fi

# Get package name from package.json
PACKAGE_NAME=$(node -p "require('./package.json').name")

if [ -z "$PACKAGE_NAME" ]; then
    echo -e "${RED}❌ Error: Could not determine package name from package.json${NC}"
    exit 1
fi

echo -e "${GREEN}📦 Package: $PACKAGE_NAME${NC}"

# Check if package is installed
if ! npm list "$PACKAGE_NAME" >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Package not found in node_modules${NC}"
    echo "Installing package for verification..."
    npm install "$PACKAGE_NAME"
fi

echo ""
echo -e "${YELLOW}🔍 Verifying package provenance...${NC}"
echo ""

# Run npm audit signatures
if npm audit signatures; then
    echo ""
    echo -e "${GREEN}✅ Provenance verification successful!${NC}"
    echo "The package was signed by a trusted GitHub Actions environment."
    echo "This confirms the package was built from the source code in the repository."
else
    echo ""
    echo -e "${RED}❌ Provenance verification failed!${NC}"
    echo ""
    echo "Possible reasons:"
    echo "1. Package was not published with the --provenance flag"
    echo "2. Repository is private (provenance requires public repos)"
    echo "3. GitHub Actions workflow failed"
    echo "4. Package was published from a different CI/CD platform"
    echo ""
    echo "To verify manually, run: npm audit signatures"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Package provenance verification complete!${NC}" 