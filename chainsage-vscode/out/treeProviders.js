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
exports.ResultItem = exports.ResultsTreeProvider = exports.ContractItem = exports.ContractsTreeProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class ContractsTreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (!element) {
            // Root level - show all contracts
            const contracts = await this.findSolidityContracts();
            return contracts.map(contract => new ContractItem(contract.name, contract.path, contract.relativePath, vscode.TreeItemCollapsibleState.None));
        }
        return [];
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
}
exports.ContractsTreeProvider = ContractsTreeProvider;
class ContractItem extends vscode.TreeItem {
    constructor(label, filePath, relativePath, collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.filePath = filePath;
        this.relativePath = relativePath;
        this.collapsibleState = collapsibleState;
        this.tooltip = relativePath;
        this.description = path.dirname(relativePath);
        this.resourceUri = vscode.Uri.file(filePath);
        this.contextValue = 'contract';
        this.iconPath = new vscode.ThemeIcon('file-code');
        this.command = {
            command: 'vscode.open',
            title: 'Open Contract',
            arguments: [vscode.Uri.file(filePath)]
        };
    }
}
exports.ContractItem = ContractItem;
class ResultsTreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.results = new Map();
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    addResult(filePath, result) {
        this.results.set(filePath, result);
        this.refresh();
    }
    clearResults() {
        this.results.clear();
        this.refresh();
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (!element) {
            // Root level - show all analyzed contracts
            const items = [];
            for (const [filePath, result] of this.results) {
                const fileName = path.basename(filePath);
                const item = new ResultItem(fileName, filePath, result, vscode.TreeItemCollapsibleState.Collapsed);
                items.push(item);
            }
            return items;
        }
        else if (element.contextValue === 'risks' && element.result && element.result.risks) {
            // Show individual risks
            return element.result.risks.map((risk) => new ResultItem(`[${risk.severity.toUpperCase()}] ${risk.description}`, element.filePath, null, vscode.TreeItemCollapsibleState.None, 'risk-item'));
        }
        else if (element.result) {
            // Show result details
            const children = [];
            // Security Score
            children.push(new ResultItem(`Security Score: ${element.result.securityScore}/100`, element.filePath, null, vscode.TreeItemCollapsibleState.None, 'score'));
            // Risks
            if (element.result.risks && element.result.risks.length > 0) {
                const risksItem = new ResultItem(`Risks (${element.result.risks.length})`, element.filePath, { risks: element.result.risks }, vscode.TreeItemCollapsibleState.Expanded, 'risks');
                children.push(risksItem);
            }
            return children;
        }
        return [];
    }
}
exports.ResultsTreeProvider = ResultsTreeProvider;
class ResultItem extends vscode.TreeItem {
    constructor(label, filePath, result, collapsibleState, contextValue) {
        super(label, collapsibleState);
        this.label = label;
        this.filePath = filePath;
        this.result = result;
        this.collapsibleState = collapsibleState;
        this.contextValue = contextValue;
        this.contextValue = contextValue || 'result';
        // Set tooltip
        this.tooltip = label;
        if (contextValue === 'score') {
            const score = parseInt(label.split('/')[0].split(':')[1].trim());
            this.iconPath = score > 80
                ? new vscode.ThemeIcon('pass', new vscode.ThemeColor('testing.iconPassed'))
                : score > 50
                    ? new vscode.ThemeIcon('warning', new vscode.ThemeColor('testing.iconQueued'))
                    : new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
        }
        else if (contextValue === 'risks') {
            this.iconPath = new vscode.ThemeIcon('warning');
        }
        else if (contextValue === 'risk-item') {
            if (label.includes('[CRITICAL]') || label.includes('[HIGH]')) {
                this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
            }
            else {
                this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('testing.iconQueued'));
            }
        }
        else {
            this.iconPath = new vscode.ThemeIcon('file-code');
            // Only add command for root result items, not for child items
            if (filePath && !contextValue) {
                try {
                    this.command = {
                        command: 'vscode.open',
                        title: 'Open File',
                        arguments: [vscode.Uri.file(filePath)]
                    };
                }
                catch (error) {
                    // Silently handle any URI errors
                    console.error('Failed to create URI for:', filePath);
                }
            }
        }
    }
}
exports.ResultItem = ResultItem;
//# sourceMappingURL=treeProviders.js.map