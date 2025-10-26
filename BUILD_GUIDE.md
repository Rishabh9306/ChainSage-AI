# 🔧 ChainSage AI - Build & Installation Guide

## ✅ Issue Fixed!

The "ChainSage CLI not found" error has been resolved. Here's what was done:

### Root Cause
The TypeScript project wasn't compiled, so the `dist/cli/index.js` file didn't exist.

### Solution Applied
1. ✅ Fixed the `clean` script in `package.json` to work on Windows (PowerShell)
2. ✅ Fixed `tsconfig.json` to remove unused jest types
3. ✅ Built the main project: `npm run build`
4. ✅ Installed VS Code extension dependencies
5. ✅ Rebuilt and repackaged the VS Code extension
6. ✅ Reinstalled the updated extension

---

## 🚀 Build Instructions

### For the Main Project

```powershell
# Navigate to project root
cd ChainSage-AI

# Install dependencies (first time only)
npm install

# Build the project
npm run build

# This creates the dist folder with:
# - dist/cli/index.js (CLI entry point)
# - dist/core/* (Core modules)
# - dist/utils/* (Utility functions)
# - dist/types/* (TypeScript types)
```

### For the VS Code Extension

```powershell
# Navigate to extension folder
cd chainsage-vscode

# Install dependencies (first time only)
npm install

# Compile the extension
npm run compile

# Package the extension (includes dependencies!)
npm run package

# Install the extension
code --install-extension chainsage-ai-1.0.0.vsix

# Reload VS Code
# Press Ctrl+Shift+P -> "Reload Window"
```

**Note**: The `.vscodeignore` file is configured to include production dependencies (`@google/generative-ai`, `axios`) while excluding dev dependencies. The packaged extension should be ~400KB.

---

## 📝 Available Scripts

### Main Project

| Script | Command | Description |
|--------|---------|-------------|
| Build | `npm run build` | Compile TypeScript to JavaScript |
| Dev | `npm run dev` | Run CLI in development mode with ts-node |
| Start | `npm run start` | Run the compiled CLI |
| Clean | `npm run clean` | Remove build artifacts |
| Lint | `npm run lint` | Check code quality |
| Format | `npm run format` | Format code with Prettier |

### VS Code Extension

| Script | Command | Description |
|--------|---------|-------------|
| Compile | `npm run compile` | Compile TypeScript |
| Watch | `npm run watch` | Watch for changes and recompile |
| Package | `npm run package` | Create VSIX package |

### Web App

```powershell
cd web
npm install
npm run dev    # Development server
npm run build  # Production build
npm run start  # Start production server
```

---

## 🔄 Development Workflow

### Making Changes to the CLI

1. Edit files in `src/`
2. Run `npm run build` to compile
3. Test with `npm start` or `npm run dev`

### Making Changes to the Extension

1. Edit files in `chainsage-vscode/src/`
2. Run `npm run compile` in the extension folder
3. Press F5 in VS Code to test (or reload window)
4. Package and reinstall if needed

### Making Changes to the Web App

1. Edit files in `web/app/`
2. Changes are auto-reloaded in dev mode
3. Build for production: `npm run build`

---

## 🐛 Troubleshooting

### "ChainSage CLI not found" Error

**Solution:**
```powershell
cd ChainSage-AI
npm run build
```

### Extension Not Working After Update

**Solution:**
```powershell
cd chainsage-vscode
npm run package
code --uninstall-extension chainsage.chainsage-ai
code --install-extension chainsage-ai-1.0.0.vsix
# Reload VS Code window: Ctrl+Shift+P -> "Reload Window"
```

### TypeScript Compilation Errors

**Solution:**
```powershell
# Clean and rebuild
npm run clean
npm install
npm run build
```

### "API key not configured" (Web App)

**Solution:**
```powershell
cd web
# Create .env.local with your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env.local
npm run dev
```

---

## 📦 Project Structure

```
ChainSage-AI/
├── src/                    # Main project source
│   ├── cli/               # CLI implementation
│   ├── core/              # Core analysis modules
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript types
├── dist/                  # Compiled JavaScript (generated)
│   ├── cli/
│   │   └── index.js      # CLI entry point
│   ├── core/
│   └── utils/
├── chainsage-vscode/      # VS Code extension
│   ├── src/
│   │   └── extension.ts  # Extension entry point
│   ├── out/              # Compiled extension (generated)
│   └── *.vsix            # Packaged extension (generated)
├── web/                   # Next.js web app
│   ├── app/
│   ├── .env.local        # Your API keys (not in git)
│   └── .next/            # Build output (generated)
├── contracts/             # Solidity contracts
├── scripts/               # Utility scripts
└── package.json
```

---

## ✨ First Time Setup

```powershell
# 1. Clone the repository
git clone https://github.com/Rishabh9306/ChainSage-AI.git
cd ChainSage-AI

# 2. Install dependencies for main project
npm install

# 3. Build the main project
npm run build

# 4. Set up the web app
cd web
cp .env.example .env.local
# Edit .env.local and add your Gemini API key
npm install
cd ..

# 5. Install VS Code extension
cd chainsage-vscode
npm install
npm run package
code --install-extension chainsage-ai-1.0.0.vsix
cd ..

# 6. You're ready to go!
```

---

## 🎯 Quick Commands

```powershell
# Build everything
npm run build                              # Main project
cd chainsage-vscode && npm run package     # Extension
cd web && npm run build                    # Web app

# Run everything
npm start                                  # CLI
cd web && npm run dev                      # Web app (http://localhost:3000)

# Clean everything
npm run clean                              # Main project
rm -r chainsage-vscode/out                # Extension
rm -r web/.next                           # Web app
```

---

## 💡 Tips

1. **Always build after pulling changes**: `npm run build`
2. **Use dev mode for testing**: `npm run dev` (no build needed)
3. **Reload VS Code after extension updates**: Ctrl+Shift+P -> "Reload Window"
4. **Check environment variables**: Web app needs `GEMINI_API_KEY` in `.env.local`
5. **Clean before rebuilding if issues persist**: `npm run clean && npm run build`

---

## 📚 Additional Documentation

- Main README: [`../README.md`](../README.md)
- Web App Setup: [`../web/SETUP.md`](../web/SETUP.md)
- Extension Development: [`../chainsage-vscode/DEVELOPMENT.md`](../chainsage-vscode/DEVELOPMENT.md)
- Contributing Guide: [`../CONTRIBUTING.md`](../CONTRIBUTING.md)
