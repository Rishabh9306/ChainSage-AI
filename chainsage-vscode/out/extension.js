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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const execPromise = (0, util_1.promisify)(child_process_1.exec);
let diagnosticCollection;
function activate(context) {
    console.log('ChainSage AI extension is now active!');
    // Create diagnostic collection for inline warnings
    diagnosticCollection = vscode.languages.createDiagnosticCollection('chainsage');
    context.subscriptions.push(diagnosticCollection);
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('chainsage.analyzeFile', analyzeFile), vscode.commands.registerCommand('chainsage.analyzeWorkspace', analyzeWorkspace), vscode.commands.registerCommand('chainsage.generateFixes', generateFixes), vscode.commands.registerCommand('chainsage.configure', configureApiKey));
    // Register on-save handler if auto-analyze is enabled
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((document) => {
        const config = vscode.workspace.getConfiguration('chainsage');
        if (config.get('autoAnalyze') && document.languageId === 'solidity') {
            analyzeFile();
        }
    }));
    // Show welcome message
    vscode.window.showInformationMessage('🧠 ChainSage AI is ready to analyze your smart contracts!');
}
async function analyzeFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }
    if (editor.document.languageId !== 'solidity') {
        vscode.window.showErrorMessage('ChainSage only works with Solidity files');
        return;
    }
    const filePath = editor.document.fileName;
    const config = vscode.workspace.getConfiguration('chainsage');
    const apiKey = config.get('geminiApiKey');
    if (!apiKey) {
        const action = await vscode.window.showWarningMessage('Gemini API Key not configured', 'Configure Now');
        if (action === 'Configure Now') {
            await configureApiKey();
        }
        return;
    }
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'ChainSage AI',
        cancellable: false
    }, async (progress) => {
        progress.report({ message: 'Analyzing contract...' });
        try {
            // Read the contract content
            const content = editor.document.getText();
            // Call ChainSage CLI or API
            const result = await analyzeContract(filePath, apiKey);
            // Parse and display results
            displayResults(result, editor.document);
            vscode.window.showInformationMessage(`✅ Analysis complete! Security Score: ${result.securityScore}/100`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`ChainSage analysis failed: ${error.message}`);
        }
    });
}
async function analyzeWorkspace() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'ChainSage AI',
        cancellable: false
    }, async (progress) => {
        progress.report({ message: 'Finding Solidity files...' });
        try {
            // Find all .sol files
            const files = await vscode.workspace.findFiles('**/*.sol', '**/node_modules/**');
            progress.report({ message: `Analyzing ${files.length} contracts...` });
            // Analyze each file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                progress.report({
                    message: `Analyzing ${path.basename(file.fsPath)} (${i + 1}/${files.length})`
                });
                const document = await vscode.workspace.openTextDocument(file);
                const config = vscode.workspace.getConfiguration('chainsage');
                const apiKey = config.get('geminiApiKey') || '';
                const result = await analyzeContract(file.fsPath, apiKey);
                displayResults(result, document);
            }
            vscode.window.showInformationMessage(`✅ Analyzed ${files.length} contracts!`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Workspace analysis failed: ${error.message}`);
        }
    });
}
async function generateFixes() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'ChainSage AI',
        cancellable: false
    }, async (progress) => {
        progress.report({ message: 'Generating fixes...' });
        try {
            const config = vscode.workspace.getConfiguration('chainsage');
            const apiKey = config.get('geminiApiKey') || '';
            // This would call the ChainSage fix command
            const fixes = await generateContractFixes(editor.document.fileName, apiKey);
            // Show fixes in a new document
            const doc = await vscode.workspace.openTextDocument({
                content: formatFixes(fixes),
                language: 'markdown'
            });
            await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            vscode.window.showInformationMessage(`✅ Generated ${fixes.length} fix suggestions!`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Fix generation failed: ${error.message}`);
        }
    });
}
async function configureApiKey() {
    const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your Gemini API Key',
        placeHolder: 'AIzaSy...',
        password: true,
        ignoreFocusOut: true
    });
    if (apiKey) {
        const config = vscode.workspace.getConfiguration('chainsage');
        await config.update('geminiApiKey', apiKey, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('✅ API Key configured successfully!');
    }
}
async function analyzeContract(filePath, apiKey) {
    // Analyze local Solidity file using Gemini API directly
    try {
        const fs = require('fs');
        // Read the contract file
        const contractContent = fs.readFileSync(filePath, 'utf8');
        const contractName = path.basename(filePath, '.sol');
        // Call Gemini API directly for analysis
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });
        const prompt = `Analyze this Solidity smart contract for security vulnerabilities, gas optimization opportunities, and best practices.

Contract: ${contractName}

\`\`\`solidity
${contractContent}
\`\`\`

Please provide:
1. Security Score (0-100)
2. Critical vulnerabilities (if any) - mark as [CRITICAL]
3. High-risk issues (if any) - mark as [HIGH]
4. Medium-risk issues (if any) - mark as [MEDIUM]
5. Gas optimization suggestions
6. Best practice recommendations

Format your response with clear sections and severity markers.`;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const analysisText = response.text();
        // Parse the AI response
        return parseAnalysisOutput(analysisText);
    }
    catch (error) {
        throw new Error(`Analysis failed: ${error.message}`);
    }
}
async function generateContractFixes(filePath, apiKey) {
    // Generate fixes using Gemini API directly
    try {
        const fs = require('fs');
        const contractContent = fs.readFileSync(filePath, 'utf8');
        const contractName = path.basename(filePath, '.sol');
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });
        const prompt = `Analyze this Solidity contract and provide specific fix suggestions for any vulnerabilities or issues found.

Contract: ${contractName}

\`\`\`solidity
${contractContent}
\`\`\`

For each issue found, provide:
1. Vulnerability name
2. Severity level
3. Detailed explanation
4. Original problematic code snippet
5. Fixed code snippet
6. Best practices to follow

Format fixes clearly with code snippets.`;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const fixesText = response.text();
        return parseFixesOutput(fixesText);
    }
    catch (error) {
        throw new Error(`Fix generation failed: ${error.message}`);
    }
}
function parseAnalysisOutput(output) {
    // Parse ChainSage CLI output
    // This is a simplified version - real implementation would be more robust
    const lines = output.split('\n');
    const result = {
        securityScore: 0,
        risks: [],
        recommendations: []
    };
    for (const line of lines) {
        if (line.includes('Security Score:')) {
            const match = line.match(/(\d+)\/100/);
            if (match) {
                result.securityScore = parseInt(match[1]);
            }
        }
        else if (line.includes('[CRITICAL]') || line.includes('[HIGH]') || line.includes('[MEDIUM]')) {
            result.risks.push({
                severity: line.match(/\[(.*?)\]/)?.[1] || 'UNKNOWN',
                description: line.replace(/\[.*?\]/, '').trim()
            });
        }
    }
    return result;
}
function parseFixesOutput(output) {
    // Parse fix suggestions from CLI output
    const fixes = [];
    // Implementation would parse the actual fix format
    return fixes;
}
function displayResults(result, document) {
    const diagnostics = [];
    // Create diagnostics for each risk
    for (const risk of result.risks) {
        const severity = getSeverity(risk.severity);
        const diagnostic = new vscode.Diagnostic(new vscode.Range(0, 0, 0, 0), // Would need actual line numbers
        `ChainSage: ${risk.description}`, severity);
        diagnostic.source = 'ChainSage AI';
        diagnostics.push(diagnostic);
    }
    diagnosticCollection.set(document.uri, diagnostics);
}
function getSeverity(severity) {
    switch (severity.toUpperCase()) {
        case 'CRITICAL':
        case 'HIGH':
            return vscode.DiagnosticSeverity.Error;
        case 'MEDIUM':
            return vscode.DiagnosticSeverity.Warning;
        default:
            return vscode.DiagnosticSeverity.Information;
    }
}
function formatFixes(fixes) {
    let markdown = '# ChainSage AI - Fix Suggestions\n\n';
    for (let i = 0; i < fixes.length; i++) {
        const fix = fixes[i];
        markdown += `## ${i + 1}. ${fix.vulnerability}\n\n`;
        markdown += `**Severity:** ${fix.severity}\n\n`;
        markdown += `**Explanation:** ${fix.explanation}\n\n`;
        markdown += `### Original Code\n\`\`\`solidity\n${fix.originalCode}\n\`\`\`\n\n`;
        markdown += `### Fixed Code\n\`\`\`solidity\n${fix.fixedCode}\n\`\`\`\n\n`;
        markdown += `### Best Practices\n`;
        for (const practice of fix.bestPractices || []) {
            markdown += `- ${practice}\n`;
        }
        markdown += '\n---\n\n';
    }
    return markdown;
}
function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.dispose();
    }
}
//# sourceMappingURL=extension.js.map