# ChainSage AI v1.0.0 - VS Code Extension Release 🚀

## 📦 Installation

Download `chainsage-ai-1.0.0.vsix` from the assets below and install:

### **Method 1: Command Line**
```bash
code --install-extension chainsage-ai-1.0.0.vsix
```

### **Method 2: VS Code UI**
1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type: `Extensions: Install from VSIX...`
4. Browse to the downloaded `.vsix` file
5. Click Install and reload VS Code

## 🔑 Setup

After installation, configure your Gemini API key:

1. Press `Ctrl+Shift+P`
2. Type: `ChainSage: Configure API Key`
3. Enter your Gemini API key (get one free at https://makersuite.google.com/app/apikey)

## ✨ Features

### **VS Code Extension**
- 🔍 **Analyze Solidity Files**: Right-click any `.sol` file → `ChainSage: Analyze Contract`
- 📊 **Inline Diagnostics**: See security issues directly in the Problems panel
- 🔧 **Generate Fixes**: Right-click → `ChainSage: Generate Fixes` for AI-powered solutions
- 📁 **Workspace Analysis**: Analyze all contracts in your project at once
- 💾 **Auto-analyze on Save**: Optional feature to analyze contracts automatically when saved

### **AI-Powered Analysis**
- Security vulnerability detection (Critical/High/Medium/Low severity)
- Gas optimization recommendations
- Best practices enforcement
- Reentrancy attack detection
- Access control vulnerability checks
- Integer overflow/underflow detection

### **Web Interface**
- Clean, modern UI with animated progress bar
- Color-coded security scores (Red/Orange/Green)
- Detailed risk breakdowns with recommendations
- Gas optimization suggestions
- Behavior insights for deployed contracts

## 🎯 Usage Examples

### Analyze a Single Contract
1. Open any `.sol` file in VS Code
2. Right-click in the editor
3. Select `ChainSage: Analyze Contract`
4. View results in the Problems panel

### Analyze Entire Workspace
1. Press `Ctrl+Shift+P`
2. Type: `ChainSage: Analyze All Contracts`
3. Wait for all files to be analyzed
4. Check the Problems panel for all issues

### Generate Fix Suggestions
1. Right-click on a contract with issues
2. Select `ChainSage: Generate Fixes`
3. View AI-generated fixes in a new document

## 📋 What's Included

- ✅ VS Code Extension (v1.0.0)
- ✅ CLI Tool for terminal usage
- ✅ Web Interface for browser-based analysis
- ✅ Smart Contract Templates (3 secure templates)
- ✅ Vulnerability Database (5 common vulnerabilities)
- ✅ Comprehensive Documentation

## 🔧 Requirements

- VS Code 1.80.0 or higher
- Node.js 18+ (for CLI/Web usage)
- Gemini API Key (free tier available)

## 🐛 Known Issues

- Line number mapping in diagnostics currently defaults to line 1 (improvement coming)
- Package.json activation event warnings (cosmetic only)

## 🤝 Contributing

Found a bug or have a feature request? Open an issue on GitHub!

## 📄 License

MIT License - See LICENSE file for details

---

**Built for ETHGlobal Hackathon** 🏆

Made with ❤️ by the ChainSage AI Team
