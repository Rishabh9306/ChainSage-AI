# ChainSage AI VS Code Extension - Development Guide

## Setup

### Prerequisites
- Node.js 18+ installed
- VS Code 1.80.0+
- Gemini API key

### Installation

1. **Install Dependencies**
   ```bash
   cd chainsage-vscode
   npm install
   ```

2. **Install Required Packages**
   ```bash
   npm install --save-dev @types/vscode @types/node typescript
   npm install --save axios
   ```

3. **Compile TypeScript**
   ```bash
   npm run compile
   ```

   Or watch mode for development:
   ```bash
   npm run watch
   ```

## Development

### Testing the Extension

1. **Open in VS Code**
   ```bash
   code chainsage-vscode
   ```

2. **Launch Extension Development Host**
   - Press `F5` (or Run → Start Debugging)
   - A new VS Code window opens with the extension loaded
   - This is the "Extension Development Host"

3. **Test Commands**
   - Open a `.sol` file
   - Press `Ctrl+Shift+P`
   - Type "ChainSage" to see available commands
   - Test each command

4. **View Debug Console**
   - Check the Debug Console in the original VS Code window
   - See console.log output and errors

### Project Structure

```
chainsage-vscode/
├── src/
│   └── extension.ts       # Main extension code
├── package.json            # Extension manifest
├── tsconfig.json          # TypeScript config
├── .vscodeignore          # Files to exclude from package
└── README.md              # User documentation
```

### Key Files

**package.json**
- Extension metadata
- Commands, menus, configuration
- Activation events
- Dependencies

**src/extension.ts**
- `activate()`: Called when extension starts
- `deactivate()`: Called when extension stops
- Command handlers
- API integration

## Building

### Create VSIX Package

1. **Install vsce**
   ```bash
   npm install -g @vscode/vsce
   ```

2. **Package Extension**
   ```bash
   cd chainsage-vscode
   vsce package
   ```

3. **Output**
   - Creates `chainsage-ai-1.0.0.vsix`
   - Can be shared or published

### Install VSIX Locally

```bash
code --install-extension chainsage-ai-1.0.0.vsix
```

## Publishing

### Publish to Marketplace

1. **Create Publisher Account**
   - Go to [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
   - Create a publisher ID
   - Get a Personal Access Token from Azure DevOps

2. **Login**
   ```bash
   vsce login <your-publisher-name>
   ```

3. **Publish**
   ```bash
   vsce publish
   ```

### Update Version

```bash
# Patch version (1.0.0 → 1.0.1)
vsce publish patch

# Minor version (1.0.0 → 1.1.0)
vsce publish minor

# Major version (1.0.0 → 2.0.0)
vsce publish major
```

## Debugging

### Enable Debug Logging

Add to `extension.ts`:
```typescript
const DEBUG = true;

function log(...args: any[]) {
  if (DEBUG) {
    console.log('[ChainSage]', ...args);
  }
}
```

### Common Issues

**Issue: "Cannot find module 'vscode'"**
- Solution: Run `npm install --save-dev @types/vscode`

**Issue: "Command not found"**
- Check `package.json` - command IDs must match
- Verify activation events include the command

**Issue: "Extension not activating"**
- Check activation events in `package.json`
- Add `"*"` to activate on startup (testing only)

## Testing

### Manual Testing Checklist

- [ ] Extension activates on Solidity file open
- [ ] "Analyze Contract" command works
- [ ] "Analyze All Contracts" command works
- [ ] "Generate Fixes" command works
- [ ] "Configure API Key" command works
- [ ] Inline diagnostics appear
- [ ] Context menu items appear
- [ ] Configuration settings work
- [ ] Auto-analyze on save works (if enabled)

### Add Unit Tests

Create `src/test/suite/extension.test.ts`:
```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('chainsage.chainsage-ai'));
  });
});
```

Run tests:
```bash
npm test
```

## Configuration

### Add New Settings

1. **Update package.json**
   ```json
   "configuration": {
     "properties": {
       "chainsage.newSetting": {
         "type": "boolean",
         "default": false,
         "description": "New setting description"
       }
     }
   }
   ```

2. **Use in Code**
   ```typescript
   const config = vscode.workspace.getConfiguration('chainsage');
   const value = config.get('newSetting');
   ```

## Commands

### Add New Command

1. **Register in package.json**
   ```json
   "contributes": {
     "commands": [
       {
         "command": "chainsage.newCommand",
         "title": "ChainSage: New Command"
       }
     ]
   }
   ```

2. **Implement in extension.ts**
   ```typescript
   let disposable = vscode.commands.registerCommand(
     'chainsage.newCommand',
     async () => {
       // Command implementation
     }
   );
   context.subscriptions.push(disposable);
   ```

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guides](https://code.visualstudio.com/api/extension-guides/overview)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Samples](https://github.com/microsoft/vscode-extension-samples)

## License

MIT License - See LICENSE file for details
