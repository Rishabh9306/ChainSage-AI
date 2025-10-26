import * as vscode from 'vscode';
import * as path from 'path';

export class ContractsTreeProvider implements vscode.TreeDataProvider<ContractItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ContractItem | undefined | null | void> = new vscode.EventEmitter<ContractItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ContractItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor() {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ContractItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ContractItem): Promise<ContractItem[]> {
        if (!element) {
            // Root level - show all contracts
            const contracts = await this.findSolidityContracts();
            return contracts.map(contract => new ContractItem(
                contract.name,
                contract.path,
                contract.relativePath,
                vscode.TreeItemCollapsibleState.None
            ));
        }
        return [];
    }

    private async findSolidityContracts(): Promise<any[]> {
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

export class ContractItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly filePath: string,
        public readonly relativePath: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
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

export class ResultsTreeProvider implements vscode.TreeDataProvider<ResultItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ResultItem | undefined | null | void> = new vscode.EventEmitter<ResultItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ResultItem | undefined | null | void> = this._onDidChangeTreeData.event;
    
    private results: Map<string, any> = new Map();

    constructor() {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    addResult(filePath: string, result: any): void {
        this.results.set(filePath, result);
        this.refresh();
    }

    clearResults(): void {
        this.results.clear();
        this.refresh();
    }

    getTreeItem(element: ResultItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ResultItem): Promise<ResultItem[]> {
        if (!element) {
            // Root level - show all analyzed contracts
            const items: ResultItem[] = [];
            for (const [filePath, result] of this.results) {
                const fileName = path.basename(filePath);
                const item = new ResultItem(
                    fileName,
                    filePath,
                    result,
                    vscode.TreeItemCollapsibleState.Collapsed
                );
                items.push(item);
            }
            return items;
        } else if (element.contextValue === 'risks' && element.result && element.result.risks) {
            // Show individual risks
            return element.result.risks.map((risk: any) => 
                new ResultItem(
                    `[${risk.severity.toUpperCase()}] ${risk.description}`,
                    element.filePath,
                    null,
                    vscode.TreeItemCollapsibleState.None,
                    'risk-item'
                )
            );
        } else if (element.result) {
            // Show result details
            const children: ResultItem[] = [];
            
            // Security Score
            children.push(new ResultItem(
                `Security Score: ${element.result.securityScore}/100`,
                element.filePath,
                null,
                vscode.TreeItemCollapsibleState.None,
                'score'
            ));

            // Risks
            if (element.result.risks && element.result.risks.length > 0) {
                const risksItem = new ResultItem(
                    `Risks (${element.result.risks.length})`,
                    element.filePath,
                    { risks: element.result.risks },
                    vscode.TreeItemCollapsibleState.Expanded,
                    'risks'
                );
                children.push(risksItem);
            }

            return children;
        }
        
        return [];
    }
}

export class ResultItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly filePath: string,
        public readonly result: any,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue?: string
    ) {
        super(label, collapsibleState);
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
        } else if (contextValue === 'risks') {
            this.iconPath = new vscode.ThemeIcon('warning');
        } else if (contextValue === 'risk-item') {
            if (label.includes('[CRITICAL]') || label.includes('[HIGH]')) {
                this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
            } else {
                this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('testing.iconQueued'));
            }
        } else {
            this.iconPath = new vscode.ThemeIcon('file-code');
            // Only add command for root result items, not for child items
            if (filePath && !contextValue) {
                try {
                    this.command = {
                        command: 'vscode.open',
                        title: 'Open File',
                        arguments: [vscode.Uri.file(filePath)]
                    };
                } catch (error) {
                    // Silently handle any URI errors
                }
            }
        }
    }
}
