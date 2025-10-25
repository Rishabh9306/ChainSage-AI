# ChainSage AI - VS Code Extension

![ChainSage AI](https://img.shields.io/badge/ChainSage-AI-purple?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

AI-powered smart contract security analysis directly in Visual Studio Code.

## ✨ Features

### 🔍 Instant Analysis
- Right-click any Solidity file → "ChainSage: Analyze Contract"
- Get security analysis in seconds
- Inline warnings and errors
- Security score display

### 🤖 AI-Powered Fixes
- Automatic vulnerability detection
- AI-generated code fixes
- Step-by-step explanations
- Best practice recommendations

### 📊 Workspace Analysis
- Analyze all contracts at once
- Batch processing support
- Summary reports
- Export results

### ⚙️ Auto-Analysis
- Analyze on save (optional)
- Real-time feedback
- Configurable settings
- Multiple network support

## 🚀 Installation

### From VS Code Marketplace
1. Open VS Code
2. Press `Ctrl+P` (or `Cmd+P` on Mac)
3. Type `ext install chainsage.chainsage-ai`
4. Press Enter

### From VSIX File
1. Download the `.vsix` file from releases
2. Open VS Code
3. Go to Extensions view (`Ctrl+Shift+X`)
4. Click `...` → `Install from VSIX...`
5. Select the downloaded file

## ⚙️ Configuration

### Set up Gemini API Key

**Option 1: Command Palette**
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "ChainSage: Configure API Key"
3. Enter your Gemini API key

**Option 2: Settings**
1. Go to Settings (`Ctrl+,`)
2. Search for "ChainSage"
3. Enter your Gemini API key in `chainsage.geminiApiKey`

### Get a Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key
4. Paste it in VS Code settings

## 📖 Usage

### Analyze a Contract

**Method 1: Right-Click Menu**
1. Open a `.sol` file
2. Right-click in the editor
3. Select "ChainSage: Analyze Contract"

**Method 2: Command Palette**
1. Open a `.sol` file
2. Press `Ctrl+Shift+P`
3. Type "ChainSage: Analyze Contract"
4. Press Enter

**Method 3: Editor Title Icon**
1. Open a `.sol` file
2. Click the shield icon in the editor title bar

### Analyze Entire Workspace

1. Press `Ctrl+Shift+P`
2. Type "ChainSage: Analyze All Contracts"
3. Press Enter
4. Wait for analysis to complete

### Generate Fixes

1. Analyze a contract first
2. Press `Ctrl+Shift+P`
3. Type "ChainSage: Generate Fixes"
4. View fixes in a new tab

### View Results

- **Inline Warnings**: Red underlines for critical issues
- **Problems Panel**: Press `Ctrl+Shift+M` to view all issues
- **Hover**: Hover over warnings for details
- **Security View**: Check the ChainSage sidebar

## 🎯 Features in Detail

### Security Analysis
- ✅ Reentrancy detection
- ✅ Access control issues
- ✅ Integer overflow/underflow
- ✅ Unchecked external calls
- ✅ Gas optimization
- ✅ Best practice violations

### AI-Powered Fixes
- 🤖 Vulnerability-specific fixes
- 🤖 Code examples
- 🤖 Explanations
- 🤖 Best practices

### Multi-Chain Support
- Ethereum Mainnet
- Sepolia Testnet
- Optimism
- Base
- Arbitrum

## ⚙️ Extension Settings

This extension contributes the following settings:

* `chainsage.geminiApiKey`: Your Gemini API key for AI analysis
* `chainsage.autoAnalyze`: Automatically analyze contracts on save (default: `false`)
* `chainsage.showInlineWarnings`: Show inline warnings in editor (default: `true`)
* `chainsage.network`: Default network for contract analysis (default: `ethereum`)

## 📋 Commands

This extension contributes the following commands:

* `ChainSage: Analyze Contract` - Analyze the current Solidity file
* `ChainSage: Analyze All Contracts` - Analyze all contracts in workspace
* `ChainSage: Generate Fixes` - Generate AI-powered fixes for vulnerabilities
* `ChainSage: Configure API Key` - Set up your Gemini API key

## 🔧 Requirements

- VS Code 1.80.0 or higher
- Gemini API key (free tier available)
- Node.js 18+ (for ChainSage CLI)
- Optional: `chainsage-ai` CLI installed globally

## 🐛 Known Issues

- Analysis requires internet connection
- Large contracts may take longer to analyze
- First analysis may be slower due to initialization

## 📝 Release Notes

### 1.0.0

Initial release:
- ✨ Contract analysis
- ✨ AI-powered fixes
- ✨ Inline warnings
- ✨ Workspace analysis
- ✨ Multi-chain support

## 🤝 Contributing

Contributions are welcome! Please see the [contributing guide](https://github.com/Rishabh9306/ChainSage-AI/blob/main/CONTRIBUTING.md).

## 📄 License

MIT License - See [LICENSE](https://github.com/Rishabh9306/ChainSage-AI/blob/main/LICENSE) file

## 🔗 Links

- [GitHub Repository](https://github.com/Rishabh9306/ChainSage-AI)
- [Documentation](https://github.com/Rishabh9306/ChainSage-AI#readme)
- [Report Issue](https://github.com/Rishabh9306/ChainSage-AI/issues)
- [ChainSage CLI](https://www.npmjs.com/package/chainsage-ai)

## 💡 Tips

1. **Enable Auto-Analysis** for real-time feedback:
   ```json
   "chainsage.autoAnalyze": true
   ```

2. **Keyboard Shortcut** - Add custom shortcut for quick analysis:
   - Go to Keyboard Shortcuts (`Ctrl+K Ctrl+S`)
   - Search for "ChainSage: Analyze Contract"
   - Set your preferred keybinding

3. **Ignore False Positives** - Use comments to suppress warnings:
   ```solidity
   // chainsage-disable-next-line
   ```

## 🎯 Use Cases

- **Development**: Catch security issues while coding
- **Code Review**: Quick security checks before merging
- **Auditing**: Preliminary analysis before full audit
- **Learning**: Understand security best practices

## 🌟 Support

If you find this extension helpful:
- ⭐ Star the [GitHub repo](https://github.com/Rishabh9306/ChainSage-AI)
- 📝 Write a review on the marketplace
- 🐛 Report issues
- 💡 Suggest features

---

**Built with ❤️ by the ChainSage AI team**

*Making Web3 safer, one contract at a time.*
