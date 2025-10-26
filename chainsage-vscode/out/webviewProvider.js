"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainSageWebviewProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class ChainSageWebviewProvider {
    constructor(_extensionUri, _context) {
        this._extensionUri = _extensionUri;
        this._context = _context;
        this.analysisResults = new Map();
    }
    addAnalysisResult(filePath, result) {
        this.analysisResults.set(filePath, result);
        // Wait a bit to ensure webview is ready
        setTimeout(() => {
            this.sendAnalysisResults();
        }, 100);
    }
    clearResults() {
        this.analysisResults.clear();
        this.sendAnalysisResults();
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'analyzeAll':
                    await vscode.commands.executeCommand('chainsage.analyzeWorkspace');
                    break;
                case 'analyzeContract':
                    await this.analyzeSpecificContract(message.filePath);
                    break;
                case 'openContract':
                    await this.openContract(message.filePath);
                    break;
                case 'saveApiKey':
                    await this.saveApiKey(message.apiKey);
                    break;
                case 'selectModel':
                    await this.selectModel(message.model);
                    break;
                case 'getContracts':
                    await this.sendContractsList();
                    break;
                case 'openSettings':
                    await vscode.commands.executeCommand('workbench.action.openSettings', 'chainsage');
                    break;
            }
        });
        // Send initial data with slight delays to ensure webview is ready
        setTimeout(() => this.sendApiKeyStatus(), 50);
        setTimeout(() => this.sendModelStatus(), 100);
        setTimeout(() => this.sendContractsList(), 150);
        setTimeout(() => this.sendAnalysisResults(), 200);
    }
    async sendAnalysisResults() {
        const results = [];
        for (const [filePath, result] of this.analysisResults) {
            results.push({
                filePath,
                fileName: path.basename(filePath),
                ...result
            });
        }
        if (this._view) {
            this._view.webview.postMessage({
                command: 'updateAnalysisResults',
                results: results
            });
        }
    }
    async selectModel(model) {
        const config = vscode.workspace.getConfiguration('chainsage');
        await config.update('selectedModel', model, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`✅ Model switched to ${model}`);
        this.sendModelStatus();
    }
    async sendModelStatus() {
        const config = vscode.workspace.getConfiguration('chainsage');
        const selectedModel = config.get('selectedModel') || 'gemini-2.5-flash';
        const rateLimits = this._context.globalState.get('rateLimits') || {
            'gemini-2.5-pro': { used: 0, limit: 2 },
            'gemini-2.5-flash': { used: 0, limit: 10 },
            'gemini-2.0-flash-exp': { used: 0, limit: 10 }
        };
        this._view?.webview.postMessage({
            command: 'updateModelStatus',
            selectedModel,
            rateLimits
        });
    }
    async incrementRateLimit(model) {
        const rateLimits = this._context.globalState.get('rateLimits') || {
            'gemini-2.5-pro': { used: 0, limit: 2 },
            'gemini-2.5-flash': { used: 0, limit: 10 },
            'gemini-2.0-flash-exp': { used: 0, limit: 10 }
        };
        if (rateLimits[model]) {
            rateLimits[model].used = Math.min(rateLimits[model].used + 1, rateLimits[model].limit);
        }
        await this._context.globalState.update('rateLimits', rateLimits);
        this.sendModelStatus();
    }
    async resetRateLimits() {
        const rateLimits = {
            'gemini-2.5-pro': { used: 0, limit: 2 },
            'gemini-2.5-flash': { used: 0, limit: 10 },
            'gemini-2.0-flash-exp': { used: 0, limit: 10 }
        };
        await this._context.globalState.update('rateLimits', rateLimits);
        this.sendModelStatus();
    }
    async openContract(filePath) {
        try {
            const decodedPath = decodeURIComponent(filePath);
            const uri = vscode.Uri.file(decodedPath);
            const document = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(document);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to open contract: ${error.message}`);
        }
    }
    async analyzeSpecificContract(filePath) {
        try {
            // Decode URI if it's encoded
            const decodedPath = decodeURIComponent(filePath);
            const uri = vscode.Uri.file(decodedPath);
            const document = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(document);
            await vscode.commands.executeCommand('chainsage.analyzeFile');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to analyze contract: ${error.message}`);
        }
    }
    async saveApiKey(apiKey) {
        const config = vscode.workspace.getConfiguration('chainsage');
        await config.update('geminiApiKey', apiKey, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('✅ API Key saved successfully!');
        this.sendApiKeyStatus();
    }
    async sendContractsList() {
        const contracts = await this.findSolidityContracts();
        this._view?.webview.postMessage({
            command: 'updateContracts',
            contracts: contracts
        });
    }
    async sendApiKeyStatus() {
        const config = vscode.workspace.getConfiguration('chainsage');
        const apiKey = config.get('geminiApiKey');
        this._view?.webview.postMessage({
            command: 'updateApiKeyStatus',
            hasApiKey: !!apiKey && apiKey.length > 0
        });
    }
    async findSolidityContracts() {
        const files = await vscode.workspace.findFiles('**/*.sol', '**/node_modules/**');
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        return files.map(file => {
            const relativePath = workspaceFolder
                ? path.relative(workspaceFolder.uri.fsPath, file.fsPath)
                : file.fsPath;
            return {
                name: path.basename(file.fsPath),
                path: file.fsPath,
                relativePath: relativePath
            };
        });
    }
    _getHtmlForWebview(_webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChainSage AI Dashboard</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
        }

        .logo {
            font-size: 48px;
            margin-bottom: 10px;
        }

        h1 {
            color: white;
            font-size: 24px;
            margin-bottom: 5px;
        }

        .tagline {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
        }

        .card {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .card h2 {
            font-size: 18px;
            margin-bottom: 15px;
            color: var(--vscode-foreground);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .icon {
            font-size: 20px;
        }

        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            width: 100%;
            margin-bottom: 10px;
            transition: background-color 0.2s;
        }

        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .api-key-section {
            margin-bottom: 20px;
        }

        .api-key-status {
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 10px;
            text-align: center;
            font-weight: 500;
        }

        .api-key-status.configured {
            background-color: rgba(76, 175, 80, 0.2);
            color: #4caf50;
        }

        .api-key-status.not-configured {
            background-color: rgba(244, 67, 54, 0.2);
            color: #f44336;
        }

        input {
            width: 100%;
            padding: 10px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
            margin-bottom: 10px;
            font-size: 14px;
        }

        input:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }

        .contracts-list {
            max-height: 300px;
            overflow-y: auto;
        }

        .contract-item {
            padding: 12px;
            margin-bottom: 8px;
            background-color: var(--vscode-list-inactiveSelectionBackground);
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.2s;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .contract-item:hover {
            background-color: var(--vscode-list-hoverBackground);
        }

        .contract-info {
            flex: 1;
            cursor: pointer;
        }

        .contract-info:hover .contract-name {
            color: #667eea;
        }

        .contract-name {
            font-weight: 500;
            margin-bottom: 4px;
            transition: color 0.2s;
        }

        .contract-path {
            font-size: 12px;
            opacity: 0.7;
        }

        .analyze-btn {
            padding: 6px 12px;
            font-size: 12px;
            background-color: #667eea;
            margin: 0;
            width: auto;
        }

        .analyze-btn:hover {
            background-color: #5568d3;
        }

        .empty-state {
            text-align: center;
            padding: 40px 20px;
            opacity: 0.6;
        }

        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }

        .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 15px;
        }

        .stat-card {
            background-color: var(--vscode-editor-background);
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }

        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 12px;
            opacity: 0.7;
        }

        .settings-toggle {
            margin-top: 10px;
            font-size: 12px;
        }

        .api-key-input-section {
            display: none;
            margin-top: 10px;
        }

        .api-key-input-section.active {
            display: block;
        }

        .quick-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .loading {
            text-align: center;
            padding: 20px;
            opacity: 0.6;
        }

        .spinner {
            animation: spin 1s linear infinite;
            display: inline-block;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .model-selector {
            margin-bottom: 15px;
        }

        .model-dropdown {
            width: 100%;
            padding: 12px 15px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            outline: none;
            font-family: inherit;
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"%3E%3Cpath fill="%23666" d="M6 9L1 4h10z"/%3E%3C/svg%3E');
            background-repeat: no-repeat;
            background-position: right 12px center;
            padding-right: 40px;
        }

        .model-dropdown:hover {
            border-color: #667eea;
            background-color: var(--vscode-input-background);
        }

        .model-dropdown:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
            background-color: var(--vscode-input-background);
        }

        .model-dropdown option {
            background-color: var(--vscode-dropdown-background);
            color: var(--vscode-dropdown-foreground);
            padding: 8px;
        }

        .limit-bar {
            width: 100%;
            height: 4px;
            background-color: var(--vscode-editor-background);
            border-radius: 2px;
            overflow: hidden;
            margin-top: 8px;
        }

        .limit-fill {
            height: 100%;
            background: linear-gradient(90deg, #4caf50 0%, #ff9800 70%, #f44336 100%);
            transition: width 0.3s;
        }

        .analysis-results {
            max-height: 400px;
            overflow-y: auto;
        }

        .result-item {
            background-color: var(--vscode-editor-background);
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 10px;
            border-left: 4px solid #667eea;
        }

        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .result-file {
            font-weight: 500;
            font-size: 14px;
        }

        .security-score {
            font-size: 20px;
            font-weight: bold;
            padding: 5px 12px;
            border-radius: 6px;
        }

        .score-high {
            background-color: rgba(76, 175, 80, 0.2);
            color: #4caf50;
        }

        .score-medium {
            background-color: rgba(255, 152, 0, 0.2);
            color: #ff9800;
        }

        .score-low {
            background-color: rgba(244, 67, 54, 0.2);
            color: #f44336;
        }

        .risks-section {
            margin-top: 10px;
        }

        .risk-item {
            padding: 8px 10px;
            margin-top: 6px;
            border-radius: 4px;
            font-size: 13px;
        }

        .risk-critical {
            background-color: rgba(244, 67, 54, 0.15);
            border-left: 3px solid #f44336;
        }

        .risk-high {
            background-color: rgba(255, 152, 0, 0.15);
            border-left: 3px solid #ff9800;
        }

        .risk-medium {
            background-color: rgba(255, 193, 7, 0.15);
            border-left: 3px solid #ffc107;
        }

        .severity-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
            margin-right: 8px;
        }

        .badge-critical {
            background-color: #f44336;
            color: white;
        }

        .badge-high {
            background-color: #ff9800;
            color: white;
        }

        .badge-medium {
            background-color: #ffc107;
            color: #333;
        }

        .empty-results {
            text-align: center;
            padding: 30px 20px;
            opacity: 0.6;
        }
    </style>
</head>
<body>
    <div class="card api-key-section">
        <h2><span class="icon">🔑</span> API Configuration</h2>
        <div id="apiKeyStatus" class="api-key-status not-configured">
            ⚠️ API Key Not Configured
        </div>
        <button onclick="toggleApiKeyInput()" class="secondary">
            Configure API Key
        </button>
        <div id="apiKeyInputSection" class="api-key-input-section">
            <input 
                type="password" 
                id="apiKeyInput" 
                placeholder="Enter your Gemini API Key"
            />
            <button onclick="saveApiKey()">
                Save API Key
            </button>
            <div class="settings-toggle">
                <a href="#" onclick="openSettings()">Open Extension Settings</a>
            </div>
        </div>
    </div>

    <div class="card">
        <h2><span class="icon">🤖</span> Select a Model</h2>
        <select id="modelSelector" class="model-dropdown" onchange="selectModel(this.value)">
            <!-- Models will be populated here -->
        </select>
    </div>

    <div class="card">
        <h2><span class="icon">⚡</span> Quick Actions</h2>
        <div class="quick-actions">
            <button onclick="analyzeAll()">
                🔍 Analyze All
            </button>
            <button onclick="refreshContracts()" class="secondary">
                🔄 Refresh
            </button>
        </div>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value" id="contractCount">0</div>
                <div class="stat-label">Contracts Found</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="analysisCount">0</div>
                <div class="stat-label">Analyzed</div>
            </div>
        </div>
    </div>

    <div class="card">
        <h2><span class="icon">📁</span> Smart Contracts</h2>
        <div id="contractsList" class="contracts-list">
            <div class="loading">
                <div class="spinner">⌛</div>
                <div>Loading contracts...</div>
            </div>
        </div>
    </div>

    <div class="card">
        <h2><span class="icon">📊</span> Analysis Results</h2>
        <div id="analysisResults" class="analysis-results">
            <div class="empty-results">
                <div style="font-size: 36px; margin-bottom: 10px;">📋</div>
                <div>No analysis results yet</div>
                <div style="font-size: 12px; margin-top: 8px;">
                    Analyze contracts to see results here
                </div>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let contracts = [];
        let hasApiKey = false;
        let analyzedContracts = new Set();
        let selectedModel = 'gemini-2.5-flash';
        let rateLimits = {
            'gemini-2.5-pro': { used: 0, limit: 2 },
            'gemini-2.5-flash': { used: 0, limit: 10 },
            'gemini-2.0-flash-exp': { used: 0, limit: 10 }
        };
        let analysisResults = [];

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateContracts':
                    contracts = message.contracts;
                    updateContractsList();
                    break;
                case 'updateApiKeyStatus':
                    hasApiKey = message.hasApiKey;
                    updateApiKeyStatus();
                    break;
                case 'updateModelStatus':
                    selectedModel = message.selectedModel || 'gemini-2.5-flash';
                    rateLimits = message.rateLimits || {
                        'gemini-2.5-pro': { used: 0, limit: 2 },
                        'gemini-2.5-flash': { used: 0, limit: 10 },
                        'gemini-2.0-flash-exp': { used: 0, limit: 10 }
                    };
                    updateModelSelector();
                    break;
                case 'updateAnalysisResults':
                    analysisResults = message.results || [];
                    updateAnalysisResults();
                    break;
            }
        });

        function updateApiKeyStatus() {
            const statusDiv = document.getElementById('apiKeyStatus');
            if (hasApiKey) {
                statusDiv.className = 'api-key-status configured';
                statusDiv.textContent = '✅ API Key Configured';
            } else {
                statusDiv.className = 'api-key-status not-configured';
                statusDiv.textContent = '⚠️ API Key Not Configured';
            }
        }

        function toggleApiKeyInput() {
            const section = document.getElementById('apiKeyInputSection');
            section.classList.toggle('active');
        }

        function saveApiKey() {
            const input = document.getElementById('apiKeyInput');
            const apiKey = input.value.trim();
            
            if (!apiKey) {
                alert('Please enter a valid API key');
                return;
            }

            vscode.postMessage({
                command: 'saveApiKey',
                apiKey: apiKey
            });

            input.value = '';
            document.getElementById('apiKeyInputSection').classList.remove('active');
        }

        function updateContractsList() {
            const listDiv = document.getElementById('contractsList');
            const countDiv = document.getElementById('contractCount');
            
            countDiv.textContent = contracts.length;

            if (contracts.length === 0) {
                listDiv.innerHTML = \`
                    <div class="empty-state">
                        <div class="empty-state-icon">📄</div>
                        <div>No Solidity contracts found</div>
                        <div style="font-size: 12px; margin-top: 10px;">
                            Add .sol files to your workspace
                        </div>
                    </div>
                \`;
                return;
            }

            listDiv.innerHTML = contracts.map((contract, index) => \`
                <div class="contract-item">
                    <div class="contract-info" onclick="openContract(\${index})">
                        <div class="contract-name">📄 \${contract.name}</div>
                        <div class="contract-path">\${contract.relativePath}</div>
                    </div>
                    <button class="analyze-btn" onclick="analyzeContract(\${index}); event.stopPropagation();">
                        Analyze
                    </button>
                </div>
            \`).join('');
        }

        function openContract(index) {
            const contract = contracts[index];
            if (!contract) return;
            
            vscode.postMessage({
                command: 'openContract',
                filePath: contract.path
            });
        }

        function analyzeAll() {
            if (!hasApiKey) {
                alert('Please configure your Gemini API key first');
                return;
            }
            vscode.postMessage({ command: 'analyzeAll' });
        }

        function analyzeContract(index) {
            if (!hasApiKey) {
                alert('Please configure your Gemini API key first');
                return;
            }
            const contract = contracts[index];
            if (!contract) return;
            
            analyzedContracts.add(contract.path);
            document.getElementById('analysisCount').textContent = analyzedContracts.size;
            vscode.postMessage({
                command: 'analyzeContract',
                filePath: contract.path
            });
        }

        function refreshContracts() {
            vscode.postMessage({ command: 'getContracts' });
        }

        function openSettings() {
            vscode.postMessage({ command: 'openSettings' });
            return false;
        }

        function updateModelSelector() {
            const models = [
                { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Advanced)' },
                { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)' },
                { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental' }
            ];

            const selectorDropdown = document.getElementById('modelSelector');
            if (!selectorDropdown) {
                return;
            }
            
            selectorDropdown.innerHTML = models.map(model => {
                const isSelected = selectedModel === model.id;
                return \`<option value="\${model.id}" \${isSelected ? 'selected' : ''}>\${model.name}</option>\`;
            }).join('');
            
            // Ensure the correct model is selected
            selectorDropdown.value = selectedModel;
        }

        function selectModel(model) {
            vscode.postMessage({
                command: 'selectModel',
                model: model
            });
        }

        function updateAnalysisResults() {
            const resultsDiv = document.getElementById('analysisResults');
            
            // Update the analyzed counter based on actual results
            const analysisCountEl = document.getElementById('analysisCount');
            if (analysisCountEl) {
                analysisCountEl.textContent = analysisResults.length;
            }
            
            // Update the analyzedContracts set with all analyzed file paths
            analysisResults.forEach(result => {
                if (result.filePath) {
                    analyzedContracts.add(result.filePath);
                }
            });
            
            if (analysisResults.length === 0) {
                resultsDiv.innerHTML = \`
                    <div class="empty-results">
                        <div style="font-size: 36px; margin-bottom: 10px;">📋</div>
                        <div>No analysis results yet</div>
                        <div style="font-size: 12px; margin-top: 8px;">
                            Analyze contracts to see results here
                        </div>
                    </div>
                \`;
                return;
            }

            resultsDiv.innerHTML = analysisResults.map(result => {
                const score = result.securityScore || 0;
                const scoreClass = score > 80 ? 'score-high' : score > 50 ? 'score-medium' : 'score-low';
                const risks = result.risks || [];
                
                let risksHtml = '';
                if (risks.length > 0) {
                    const riskItems = risks.map(risk => {
                        const severity = risk.severity.toUpperCase();
                        const riskClass = severity === 'CRITICAL' ? 'risk-critical' : 
                                         severity === 'HIGH' ? 'risk-high' : 'risk-medium';
                        const badgeClass = severity === 'CRITICAL' ? 'badge-critical' : 
                                          severity === 'HIGH' ? 'badge-high' : 'badge-medium';
                        
                        return \`
                            <div class="risk-item \${riskClass}">
                                <span class="severity-badge \${badgeClass}">\${severity}</span>
                                \${risk.description}
                            </div>
                        \`;
                    }).join('');
                    
                    risksHtml = \`
                        <div class="risks-section">
                            <div style="font-weight: 500; margin-bottom: 8px; font-size: 13px;">
                                🔍 Found \${risks.length} issue(s):
                            </div>
                            \${riskItems}
                        </div>
                    \`;
                } else {
                    risksHtml = \`
                        <div style="color: #4caf50; font-size: 13px; margin-top: 10px;">
                            ✅ No issues found
                        </div>
                    \`;
                }
                
                return \`
                    <div class="result-item">
                        <div class="result-header">
                            <div class="result-file">📄 \${result.fileName}</div>
                            <div class="security-score \${scoreClass}">\${score}/100</div>
                        </div>
                        \${risksHtml}
                    </div>
                \`;
            }).join('');
        }

        // Initial load
        setTimeout(() => {
            vscode.postMessage({ command: 'getContracts' });
            updateModelSelector(); // Ensure model selector is populated on load
        }, 100);
    </script>
</body>
</html>`;
    }
}
exports.ChainSageWebviewProvider = ChainSageWebviewProvider;
ChainSageWebviewProvider.viewType = 'chainsage.mainView';
//# sourceMappingURL=webviewProvider.js.map