#!/bin/bash
# ChainSage AI Extension - Quick Publish Script

echo "🚀 ChainSage AI - Publishing Checklist"
echo "======================================"
echo ""

# Check if publisher is set
PUBLISHER=$(grep -o '"publisher": "[^"]*"' package.json | cut -d'"' -f4)
echo "✓ Current publisher: $PUBLISHER"

# Check version
VERSION=$(grep -o '"version": "[^"]*"' package.json | head -1 | cut -d'"' -f4)
echo "✓ Current version: $VERSION"
echo ""

echo "📋 Pre-publish checklist:"
echo "  1. ✅ Update version in package.json"
echo "  2. ✅ Update CHANGELOG.md"
echo "  3. ✅ Test extension locally"
echo "  4. ✅ Compile TypeScript: npm run compile"
echo "  5. ✅ Package extension: npm run package"
echo "  6. ✅ Test VSIX: code --install-extension chainsage-ai-$VERSION.vsix"
echo ""

read -p "Have you completed all steps above? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🎯 Publishing commands:"
    echo "━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Login (first time only):"
    echo "  npx @vscode/vsce login $PUBLISHER"
    echo ""
    echo "Publish current version:"
    echo "  npx @vscode/vsce publish"
    echo ""
    echo "Publish with version bump:"
    echo "  npx @vscode/vsce publish patch  # $VERSION → $(echo $VERSION | awk -F. '{$NF = $NF + 1;} 1' | sed 's/ /./g')"
    echo "  npx @vscode/vsce publish minor  # $VERSION → $(echo $VERSION | awk -F. '{$(NF-1) = $(NF-1) + 1; $NF = 0} 1' | sed 's/ /./g')"
    echo "  npx @vscode/vsce publish major  # $VERSION → $(echo $VERSION | awk -F. '{$1 = $1 + 1; $2 = 0; $NF = 0} 1' | sed 's/ /./g')"
    echo ""
    echo "After publishing, check:"
    echo "  https://marketplace.visualstudio.com/items?itemName=$PUBLISHER.chainsage-ai"
    echo ""
else
    echo "❌ Complete the checklist first!"
fi
