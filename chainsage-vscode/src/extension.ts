import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChainSageWebviewProvider } from './webviewProvider';

let diagnosticCollection: vscode.DiagnosticCollection;
let webviewProvider: ChainSageWebviewProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log('ChainSage AI extension is now active!');

    // Create diagnostic collection for inline warnings
    diagnosticCollection = vscode.languages.createDiagnosticCollection('chainsage');
    context.subscriptions.push(diagnosticCollection);

    // Register webview provider
    webviewProvider = new ChainSageWebviewProvider(context.extensionUri, context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ChainSageWebviewProvider.viewType,
            webviewProvider
        )
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('chainsage.analyzeFile', analyzeFile),
        vscode.commands.registerCommand('chainsage.analyzeWorkspace', analyzeWorkspace),
        vscode.commands.registerCommand('chainsage.generateFixes', generateFixes),
        vscode.commands.registerCommand('chainsage.configure', configureApiKey),
        vscode.commands.registerCommand('chainsage.clearResults', () => {
            webviewProvider.clearResults();
        })
    );

    // Register on-save handler if auto-analyze is enabled
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((document) => {
            const config = vscode.workspace.getConfiguration('chainsage');
            if (config.get('autoAnalyze') && document.languageId === 'solidity') {
                analyzeFile();
            }
        })
    );

    // Reset rate limits daily
    const now = new Date();
    const lastReset = context.globalState.get<number>('lastRateLimitReset') || 0;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (now.getTime() - lastReset > oneDayMs) {
        webviewProvider.resetRateLimits();
        context.globalState.update('lastRateLimitReset', now.getTime());
    }

    // Show welcome message
    vscode.window.showInformationMessage('🧠 ChainSage AI is ready to analyze your smart contracts!');
}

async function analyzeFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }

    // Check if file is a Solidity file by extension or language ID
    const filePath = editor.document.fileName;
    const isSolidityFile = filePath.endsWith('.sol') || editor.document.languageId === 'solidity';
    
    if (!isSolidityFile) {
        vscode.window.showErrorMessage('ChainSage only works with Solidity files (.sol)');
        return;
    }

    const config = vscode.workspace.getConfiguration('chainsage');
    const apiKey = config.get<string>('geminiApiKey');

    if (!apiKey) {
        const action = await vscode.window.showWarningMessage(
            'Gemini API Key not configured',
            'Configure Now'
        );
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
            // Call ChainSage CLI or API
            const result = await analyzeContract(filePath, apiKey);
            
            // Parse and display results
            displayResults(result, editor.document);
            
            // Add result to webview
            webviewProvider.addAnalysisResult(filePath, result);
            
            // Increment rate limit for the model used
            const config = vscode.workspace.getConfiguration('chainsage');
            const selectedModel = config.get<string>('selectedModel') || 'gemini-2.5-flash';
            await webviewProvider.incrementRateLimit(selectedModel);
            
            // Show appropriate message based on results
            if (result.risks && result.risks.length > 0) {
                vscode.window.showWarningMessage(
                    `⚠️ Analysis complete! Found ${result.risks.length} issue(s). Security Score: ${result.securityScore}/100`
                );
            } else {
                vscode.window.showInformationMessage(
                    `✅ Analysis complete! No vulnerabilities found. Security Score: ${result.securityScore}/100`
                );
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(
                `ChainSage analysis failed: ${error.message}`
            );
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
                const apiKey = config.get<string>('geminiApiKey') || '';
                
                const result = await analyzeContract(file.fsPath, apiKey);
                displayResults(result, document);
            }
            
            vscode.window.showInformationMessage(
                `✅ Analyzed ${files.length} contracts!`
            );
        } catch (error: any) {
            vscode.window.showErrorMessage(
                `Workspace analysis failed: ${error.message}`
            );
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
            const apiKey = config.get<string>('geminiApiKey') || '';
            
            // This would call the ChainSage fix command
            const fixes = await generateContractFixes(editor.document.fileName, apiKey);
            
            // Show fixes in a new document
            const doc = await vscode.workspace.openTextDocument({
                content: formatFixes(fixes),
                language: 'markdown'
            });
            
            await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            
            vscode.window.showInformationMessage(
                `✅ Generated ${fixes.length} fix suggestions!`
            );
        } catch (error: any) {
            vscode.window.showErrorMessage(
                `Fix generation failed: ${error.message}`
            );
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

async function analyzeContract(filePath: string, apiKey: string): Promise<any> {
    // Analyze local Solidity file using Gemini API directly
    try {
        // Read the contract file
        const contractContent = fs.readFileSync(filePath, 'utf8');
        const contractName = path.basename(filePath, '.sol');
        
        // Get selected model from configuration
        const config = vscode.workspace.getConfiguration('chainsage');
        const selectedModel = config.get<string>('selectedModel') || 'gemini-2.5-flash';
        
        // Call Gemini API directly for analysis
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: selectedModel });
        
        const prompt = `Analyze this Solidity smart contract for security vulnerabilities, gas optimization opportunities, and best practices.

Contract: ${contractName}

\`\`\`solidity
${contractContent}
\`\`\`

Please provide:
1. Security Score (0-100)
2. Critical vulnerabilities (if any) - mark as [CRITICAL] and include line number like "Line 45:"
3. High-risk issues (if any) - mark as [HIGH] and include line number like "Line 23:"
4. Medium-risk issues (if any) - mark as [MEDIUM] and include line number like "Line 67:"
5. Gas optimization suggestions with line numbers
6. Best practice recommendations

IMPORTANT: 
- For each vulnerability, specify the exact line number where it occurs
- Format: "Line X: [SEVERITY] Description"
- If NO vulnerabilities are found, clearly state "No vulnerabilities found" and give a score of 100
- Only report actual issues, do not create false positives

Format your response with clear sections and severity markers.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const analysisText = response.text();
        
        // Parse the AI response
        return parseAnalysisOutput(analysisText);
    } catch (error: any) {
        throw new Error(`Analysis failed: ${error.message}`);
    }
}

async function generateContractFixes(filePath: string, apiKey: string): Promise<any[]> {
    // Generate fixes using Gemini API directly
    try {
        const contractContent = fs.readFileSync(filePath, 'utf8');
        const contractName = path.basename(filePath, '.sol');
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
        
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
    } catch (error: any) {
        throw new Error(`Fix generation failed: ${error.message}`);
    }
}

function parseAnalysisOutput(output: string): any {
    // Parse ChainSage CLI output
    // This is a simplified version - real implementation would be more robust
    
    const lines = output.split('\n');
    const result: any = {
        securityScore: 0,
        risks: [],
        recommendations: []
    };
    
    // Check if no vulnerabilities found
    if (output.toLowerCase().includes('no vulnerabilities found') || 
        output.toLowerCase().includes('no issues found') ||
        output.toLowerCase().includes('no security issues')) {
        result.securityScore = 100;
        return result;
    }
    
    for (const line of lines) {
        if (line.includes('Security Score:')) {
            const match = line.match(/(\d+)\/100/);
            if (match) {
                result.securityScore = parseInt(match[1]);
            }
        } else if (line.includes('[CRITICAL]') || line.includes('[HIGH]') || line.includes('[MEDIUM]')) {
            // Extract line number if present (format: "Line 45: [SEVERITY] description")
            const lineNumMatch = line.match(/Line\s+(\d+)/i);
            const lineNumber = lineNumMatch ? parseInt(lineNumMatch[1]) : 1;
            
            result.risks.push({
                severity: line.match(/\[(.*?)\]/)?.[1] || 'UNKNOWN',
                description: line.replace(/\[.*?\]/, '').replace(/Line\s+\d+:\s*/i, '').trim(),
                line: lineNumber
            });
        }
    }
    
    return result;
}

function parseFixesOutput(_output: string): any[] {
    // Parse fix suggestions from CLI output
    const fixes: any[] = [];
    // Implementation would parse the actual fix format
    return fixes;
}

function displayResults(result: any, document: vscode.TextDocument) {
    const diagnostics: vscode.Diagnostic[] = [];
    
    // Only create diagnostics if there are actual risks
    if (result.risks && result.risks.length > 0) {
        for (const risk of result.risks) {
            const severity = getSeverity(risk.severity);
            
            // Use the line number from the risk, default to line 0 if not available
            const lineNumber = (risk.line && risk.line > 0) ? risk.line - 1 : 0;
            
            // Get the actual line to create a proper range
            let range: vscode.Range;
            if (lineNumber < document.lineCount) {
                const line = document.lineAt(lineNumber);
                range = new vscode.Range(lineNumber, 0, lineNumber, line.text.length);
            } else {
                range = new vscode.Range(0, 0, 0, 0);
            }
            
            const diagnostic = new vscode.Diagnostic(
                range,
                `ChainSage: ${risk.description}`,
                severity
            );
            diagnostic.source = 'ChainSage AI';
            diagnostics.push(diagnostic);
        }
    }
    
    diagnosticCollection.set(document.uri, diagnostics);
}

function getSeverity(severity: string): vscode.DiagnosticSeverity {
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

function formatFixes(fixes: any[]): string {
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

export function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.dispose();
    }
}
