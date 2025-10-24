import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import {
  ContractAnalysis,
  TransactionAnalysis,
  Risk,
  Optimization,
  ComparisonResult,
} from '../types';

/**
 * AI Reasoning Engine for analyzing blockchain data
 */
export class AIReasoner {
  private apiKey: string;
  private model: string;
  private baseUrl: string;
  private provider: string;

  constructor() {
    const llmConfig = config.getLLMConfig();
    this.provider = llmConfig.provider;
    this.apiKey = llmConfig.apiKey || '';
    this.model = llmConfig.model;
    this.baseUrl = llmConfig.baseUrl || '';
  }

  /**
   * Analyze a smart contract
   */
  public async analyzeContract(contractData: any): Promise<ContractAnalysis> {
    const prompt = this.buildContractAnalysisPrompt(contractData);

    try {
      const response = await this.complete(prompt);
      return this.parseContractAnalysis(response, contractData.address);
    } catch (error: any) {
      logger.error('Failed to analyze contract', error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze a transaction
   */
  public async analyzeTransaction(txData: any): Promise<TransactionAnalysis> {
    const prompt = this.buildTransactionAnalysisPrompt(txData);

    try {
      const response = await this.complete(prompt);
      return this.parseTransactionAnalysis(response, txData.hash);
    } catch (error: any) {
      logger.error('Failed to analyze transaction', error);
      throw new Error(`Transaction analysis failed: ${error.message}`);
    }
  }

  /**
   * Compare simulation with on-chain data
   */
  public async compareResults(simData: any, onChainData: any): Promise<ComparisonResult> {
    const prompt = this.buildComparisonPrompt(simData, onChainData);

    try {
      const response = await this.complete(prompt);
      return this.parseComparisonResult(response);
    } catch (error: any) {
      logger.error('Failed to compare results', error);
      throw new Error(`Comparison failed: ${error.message}`);
    }
  }

  /**
   * Identify risks in a contract
   */
  public async identifyRisks(contract: any): Promise<Risk[]> {
    const prompt = this.buildRiskAssessmentPrompt(contract);

    try {
      const response = await this.complete(prompt);
      return this.parseRisks(response);
    } catch (error: any) {
      logger.error('Failed to identify risks', error);
      return [];
    }
  }

  /**
   * Suggest optimizations
   */
  public async suggestOptimizations(gasReport: any): Promise<Optimization[]> {
    const prompt = this.buildOptimizationPrompt(gasReport);

    try {
      const response = await this.complete(prompt);
      return this.parseOptimizations(response);
    } catch (error: any) {
      logger.error('Failed to suggest optimizations', error);
      return [];
    }
  }

  /**
   * Complete an LLM request
   */
  private async complete(prompt: string): Promise<string> {
    if (this.provider === 'gemini') {
      return this.completeGemini(prompt);
    } else if (this.provider === 'openai') {
      return this.completeOpenAI(prompt);
    } else if (this.provider === 'ollama') {
      return this.completeOllama(prompt);
    } else {
      throw new Error(`Unsupported LLM provider: ${this.provider}`);
    }
  }

  /**
   * Complete Gemini request (FREE!)
   */
  private async completeGemini(prompt: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(this.apiKey);
    // Remove "models/" prefix if present
    const modelName = this.model.replace(/^models\//, '');
    const model = genAI.getGenerativeModel({ model: modelName });

    const fullPrompt = `${this.getSystemPrompt()}\n\n${prompt}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;

    return response.text();
  }

  /**
   * Complete OpenAI request
   */
  private async completeOpenAI(prompt: string): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * Complete Ollama request
   */
  private async completeOllama(prompt: string): Promise<string> {
    const response = await axios.post(`${this.baseUrl}/api/generate`, {
      model: this.model,
      prompt: `${this.getSystemPrompt()}\n\n${prompt}`,
      stream: false,
    });

    return response.data.response;
  }

  /**
   * Get system prompt
   */
  private getSystemPrompt(): string {
    return `You are ChainSage, an AI blockchain researcher connected to the Hardhat 3 Simulator and Blockscout MCP Server.

Your role is to:
1. Analyze smart contracts and explain their functionality
2. Interpret blockchain transactions and trace value flows
3. Compare simulated behavior with on-chain reality
4. Identify security risks and suggest optimizations
5. Provide clear, actionable insights in natural language

Always be precise, technical when needed, but explain complex concepts clearly.`;
  }

  /**
   * Build contract analysis prompt
   */
  private buildContractAnalysisPrompt(contractData: any): string {
    return `Analyze this smart contract and provide a comprehensive report:

**Contract Address:** ${contractData.address}
**Name:** ${contractData.name}
**Verified:** ${contractData.verified}
**Transactions:** ${contractData.transactionCount}

**ABI Functions:**
${JSON.stringify(
  contractData.abi.filter((item: any) => item.type === 'function').map((f: any) => f.name),
  null,
  2
)}

**Recent Transactions:** ${contractData.transactions?.length || 0}

Please provide:
1. A summary of what this contract does
2. Key functionality and features
3. Potential security risks (rate severity: low/medium/high/critical)
4. Gas optimization opportunities
5. Behavioral insights based on transaction patterns

Format your response as JSON with these fields:
{
  "summary": "...",
  "functionality": ["...", "..."],
  "risks": [{"severity": "...", "category": "...", "description": "...", "recommendation": "..."}],
  "optimizations": [{"category": "...", "description": "...", "impact": "...", "implementation": "..."}],
  "behaviorInsights": ["...", "..."],
  "securityScore": 0-100
}`;
  }

  /**
   * Build transaction analysis prompt
   */
  private buildTransactionAnalysisPrompt(txData: any): string {
    return `Analyze this blockchain transaction and explain what it does:

**Transaction Hash:** ${txData.hash}
**From:** ${txData.from}
**To:** ${txData.to}
**Value:** ${txData.value} wei
**Function:** ${txData.functionName || 'N/A'}
**Status:** ${txData.status}
**Gas Used:** ${txData.gasUsed}

**Input Data:**
${txData.input}

Provide:
1. Summary of what this transaction does
2. The likely intent/purpose
3. Value flows (who paid whom, how much)
4. Functions invoked
5. Any unusual patterns or risks

Format as JSON:
{
  "summary": "...",
  "intent": "...",
  "valueFlow": [{"from": "...", "to": "...", "amount": "...", "description": "..."}],
  "functionsInvoked": [{"contract": "...", "function": "...", "gasUsed": "..."}],
  "risks": ["..."],
  "explanation": "detailed explanation"
}`;
  }

  /**
   * Build comparison prompt
   */
  private buildComparisonPrompt(simData: any, onChainData: any): string {
    return `Compare the Hardhat simulation with on-chain reality:

**Simulation Data:**
- Gas Used: ${simData.gasUsed}
- Events Emitted: ${simData.events?.length || 0}
- State Changes: ${simData.stateChanges?.length || 0}
- Status: ${simData.status}

**On-Chain Data:**
- Gas Used: ${onChainData.gasUsed}
- Events Emitted: ${onChainData.events?.length || 0}
- State Changes: ${onChainData.stateChanges?.length || 0}
- Status: ${onChainData.status}

Analyze the differences and provide insights:

Format as JSON:
{
  "functionBehaviorMatch": 0-100,
  "gasDeviation": percentage,
  "eventStructureMatch": boolean,
  "stateChangesMatch": boolean,
  "executionPathDifferences": ["..."],
  "unexpectedReverts": [],
  "summary": "...",
  "recommendations": ["..."]
}`;
  }

  /**
   * Build risk assessment prompt
   */
  private buildRiskAssessmentPrompt(contract: any): string {
    return `Identify security risks in this smart contract:

${JSON.stringify(contract, null, 2)}

List all potential risks with severity levels.`;
  }

  /**
   * Build optimization prompt
   */
  private buildOptimizationPrompt(gasReport: any): string {
    return `Based on this gas report, suggest optimizations:

${JSON.stringify(gasReport, null, 2)}

Provide specific, actionable optimization suggestions.`;
  }

  /**
   * Parse contract analysis response
   */
  private parseContractAnalysis(response: string, address: string): ContractAnalysis {
    try {
      const parsed = JSON.parse(response);
      return {
        contractAddress: address,
        contractName: parsed.contractName || 'Unknown',
        summary: parsed.summary || '',
        functionality: parsed.functionality || [],
        risks: parsed.risks || [],
        optimizations: parsed.optimizations || [],
        behaviorInsights: parsed.behaviorInsights || [],
        securityScore: parsed.securityScore || 50,
      };
    } catch (error) {
      logger.warn('Failed to parse AI response as JSON, using raw text');
      return {
        contractAddress: address,
        contractName: 'Unknown',
        summary: response,
        functionality: [],
        risks: [],
        optimizations: [],
        behaviorInsights: [],
        securityScore: 50,
      };
    }
  }

  /**
   * Parse transaction analysis response
   */
  private parseTransactionAnalysis(response: string, txHash: string): TransactionAnalysis {
    try {
      const parsed = JSON.parse(response);
      return {
        transactionHash: txHash,
        summary: parsed.summary || '',
        intent: parsed.intent || '',
        valueFlow: parsed.valueFlow || [],
        functionsInvoked: parsed.functionsInvoked || [],
        risks: parsed.risks || [],
        explanation: parsed.explanation || response,
      };
    } catch (error) {
      return {
        transactionHash: txHash,
        summary: response,
        intent: '',
        valueFlow: [],
        functionsInvoked: [],
        risks: [],
        explanation: response,
      };
    }
  }

  /**
   * Parse comparison result
   */
  private parseComparisonResult(response: string): ComparisonResult {
    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        functionBehaviorMatch: 0,
        gasDeviation: 0,
        eventStructureMatch: false,
        stateChangesMatch: false,
        executionPathDifferences: [],
        unexpectedReverts: [],
        summary: response,
        recommendations: [],
      };
    }
  }

  /**
   * Parse risks
   */
  private parseRisks(response: string): Risk[] {
    try {
      const parsed = JSON.parse(response);
      return parsed.risks || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Parse optimizations
   */
  private parseOptimizations(response: string): Optimization[] {
    try {
      const parsed = JSON.parse(response);
      return parsed.optimizations || [];
    } catch (error) {
      return [];
    }
  }
}
