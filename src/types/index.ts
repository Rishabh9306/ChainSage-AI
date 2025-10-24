import { BigNumberish } from 'ethers';

// Type alias for BigNumber (ethers v6 uses bigint)
export type BigNumber = bigint | BigNumberish;

// ===============================================
// Contract Types
// ===============================================

export interface ContractInfo {
  address: string;
  name: string;
  compiler: string;
  verified: boolean;
  abi: any[];
  sourceCode?: string;
  transactionCount: number;
  balance: BigNumber;
  createdAt?: Date;
  creator?: string;
}

export interface SourceCode {
  sourceCode: string;
  abi: any[];
  contractName: string;
  compilerVersion: string;
  optimizationUsed: boolean;
  runs: number;
  constructorArguments: string;
  evmVersion: string;
  library: string;
  licenseType: string;
  proxy: boolean;
  implementation?: string;
  swarmSource: string;
}

// ===============================================
// Transaction Types
// ===============================================

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: BigNumber;
  gasPrice: BigNumber;
  gasUsed: BigNumber;
  input: string;
  blockNumber: number;
  timestamp: Date;
  status: 'success' | 'failed';
  functionName?: string;
  methodId?: string;
}

export interface InternalTransaction {
  from: string;
  to: string;
  value: BigNumber;
  type: string;
  gas: BigNumber;
  gasUsed: BigNumber;
  isError: boolean;
  errCode?: string;
}

export interface TransactionTrace {
  type: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasUsed: string;
  input: string;
  output: string;
  calls?: TransactionTrace[];
  error?: string;
}

// ===============================================
// Token Types
// ===============================================

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: BigNumber;
  type: 'ERC20' | 'ERC721' | 'ERC1155';
  holders?: number;
}

export interface TokenTransfer {
  from: string;
  to: string;
  value: BigNumber;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  timestamp: Date;
  transactionHash: string;
}

// ===============================================
// Simulation Types
// ===============================================

export interface CompilationResult {
  success: boolean;
  artifacts: any[];
  errors: CompilationError[];
  warnings: string[];
  contractName: string;
  bytecode: string;
  abi: any[];
}

export interface CompilationError {
  severity: 'error' | 'warning';
  message: string;
  sourceLocation?: {
    file: string;
    start: number;
    end: number;
  };
}

export interface DeploymentResult {
  success: boolean;
  address: string;
  transactionHash: string;
  gasUsed: BigNumber;
  deploymentCost: BigNumber;
  contract: any;
}

export interface TestResults {
  success: boolean;
  passed: number;
  failed: number;
  total: number;
  tests: TestCase[];
  duration: number;
}

export interface TestCase {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  gasUsed?: BigNumber;
}

export interface GasReport {
  contract: string;
  methods: GasMethodReport[];
  deploymentGas: BigNumber;
  avgGasPrice: BigNumber;
  totalGasUsed: BigNumber;
}

export interface GasMethodReport {
  name: string;
  calls: number;
  min: BigNumber;
  max: BigNumber;
  avg: BigNumber;
}

// ===============================================
// Comparison Types
// ===============================================

export interface ComparisonResult {
  functionBehaviorMatch: number;
  gasDeviation: number;
  eventStructureMatch: boolean;
  stateChangesMatch: boolean;
  executionPathDifferences: string[];
  unexpectedReverts: RevertInfo[];
  summary: string;
  recommendations: string[];
}

export interface RevertInfo {
  function: string;
  reason: string;
  expected: boolean;
  location: 'simulation' | 'onchain';
}

export interface ComparisonMetrics {
  similarity: number;
  differences: Difference[];
  insights: string[];
}

export interface Difference {
  type: 'gas' | 'event' | 'state' | 'execution' | 'revert';
  description: string;
  severity: 'low' | 'medium' | 'high';
  simulation?: any;
  onchain?: any;
}

// ===============================================
// AI Analysis Types
// ===============================================

export interface ContractAnalysis {
  contractAddress: string;
  contractName: string;
  summary: string;
  functionality: string[];
  risks: Risk[];
  optimizations: Optimization[];
  behaviorInsights: string[];
  securityScore: number;
}

export interface Risk {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  recommendation: string;
  affectedFunctions?: string[];
}

export interface Optimization {
  category: 'gas' | 'security' | 'design' | 'readability';
  description: string;
  impact: 'low' | 'medium' | 'high';
  implementation: string;
}

export interface TransactionAnalysis {
  transactionHash: string;
  summary: string;
  intent: string;
  valueFlow: ValueFlow[];
  functionsInvoked: FunctionInvocation[];
  risks: string[];
  explanation: string;
}

export interface ValueFlow {
  from: string;
  to: string;
  amount: BigNumber;
  token?: string;
  description: string;
}

export interface FunctionInvocation {
  contract: string;
  function: string;
  parameters: any[];
  returnValue?: any;
  gasUsed: BigNumber;
}

// ===============================================
// Configuration Types
// ===============================================

export interface Config {
  blockchain: BlockchainConfig;
  llm: LLMConfig;
  cache: CacheConfig;
  logging: LoggingConfig;
}

export interface BlockchainConfig {
  networks: Record<string, NetworkConfig>;
  defaultNetwork: string;
  blockscout: BlockscoutConfig;
}

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  explorerApiKey?: string;
}

export interface BlockscoutConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
  retries: number;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'deepseek' | 'ollama';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens: number;
  temperature: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  outputFile?: string;
}

// ===============================================
// CLI Types
// ===============================================

export interface CLIOptions {
  network?: string;
  verbose?: boolean;
  output?: string;
  format?: 'text' | 'json' | 'markdown';
}

export interface AnalyzeOptions extends CLIOptions {
  address: string;
  detailed?: boolean;
}

export interface SimulateOptions extends CLIOptions {
  contractPath: string;
  deployArgs?: string[];
  test?: boolean;
}

export interface CompareOptions extends CLIOptions {
  address: string;
  contractPath?: string;
}

export interface ExplainOptions extends CLIOptions {
  txHash: string;
}

// ===============================================
// Report Types
// ===============================================

export interface Report {
  id: string;
  type: 'analysis' | 'simulation' | 'comparison' | 'explanation';
  timestamp: Date;
  data: any;
  summary: string;
  metadata: ReportMetadata;
}

export interface ReportMetadata {
  network: string;
  contractAddress?: string;
  duration: number;
  aiModel: string;
  version: string;
}
