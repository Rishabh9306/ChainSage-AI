import * as dotenv from 'dotenv';
import {
  Config,
  BlockchainConfig,
  LLMConfig,
  CacheConfig,
  LoggingConfig,
  NetworkConfig,
} from '../types';

dotenv.config();

/**
 * Configuration manager for ChainSage AI
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfig(): Config {
    return {
      blockchain: this.loadBlockchainConfig(),
      llm: this.loadLLMConfig(),
      cache: this.loadCacheConfig(),
      logging: this.loadLoggingConfig(),
    };
  }

  /**
   * Load blockchain configuration
   */
  private loadBlockchainConfig(): BlockchainConfig {
    return {
      networks: {
        mainnet: {
          name: 'Ethereum Mainnet',
          chainId: 1,
          rpcUrl: process.env.MAINNET_RPC_URL || '',
          explorerUrl: 'https://etherscan.io',
          explorerApiKey: process.env.ETHERSCAN_API_KEY,
        },
        sepolia: {
          name: 'Sepolia Testnet',
          chainId: 11155111,
          rpcUrl: process.env.SEPOLIA_RPC_URL || '',
          explorerUrl: 'https://sepolia.etherscan.io',
          explorerApiKey: process.env.ETHERSCAN_API_KEY,
        },
        optimism: {
          name: 'Optimism',
          chainId: 10,
          rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
          explorerUrl: 'https://optimistic.etherscan.io',
          explorerApiKey: process.env.OPTIMISM_ETHERSCAN_API_KEY,
        },
        base: {
          name: 'Base',
          chainId: 8453,
          rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
          explorerUrl: 'https://basescan.org',
          explorerApiKey: process.env.BASESCAN_API_KEY,
        },
        arbitrum: {
          name: 'Arbitrum One',
          chainId: 42161,
          rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
          explorerUrl: 'https://arbiscan.io',
          explorerApiKey: process.env.ARBISCAN_API_KEY,
        },
      },
      defaultNetwork: process.env.HARDHAT_NETWORK || 'sepolia',
      blockscout: {
        baseUrl: process.env.BLOCKSCOUT_MCP_URL || 'https://mcp.blockscout.com',
        apiKey: process.env.BLOCKSCOUT_API_KEY,
        timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
        retries: 3,
      },
    };
  }

  /**
   * Load LLM configuration
   */
  private loadLLMConfig(): LLMConfig {
    const provider = (process.env.LLM_PROVIDER || 'openai') as LLMConfig['provider'];

    return {
      provider,
      model: this.getDefaultModel(provider),
      apiKey: this.getLLMApiKey(provider),
      baseUrl: this.getLLMBaseUrl(provider),
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4096'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    };
  }

  /**
   * Get default model for provider
   */
  private getDefaultModel(provider: string): string {
    const modelMap: Record<string, string> = {
      gemini: process.env.GEMINI_MODEL || 'gemini-1.5-pro-latest',
      openai: process.env.OPENAI_MODEL || 'gpt-4',
      anthropic: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      deepseek: process.env.DEEPSEEK_MODEL || 'deepseek-coder',
      ollama: process.env.OLLAMA_MODEL || 'llama2',
    };
    return modelMap[provider] || 'gemini-1.5-pro-latest';
  }

  /**
   * Get API key for LLM provider
   */
  private getLLMApiKey(provider: string): string | undefined {
    const keyMap: Record<string, string | undefined> = {
      gemini: process.env.GEMINI_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      deepseek: process.env.DEEPSEEK_API_KEY,
      ollama: undefined,
    };
    return keyMap[provider];
  }

  /**
   * Get base URL for LLM provider
   */
  private getLLMBaseUrl(provider: string): string | undefined {
    const urlMap: Record<string, string | undefined> = {
      gemini: undefined, // Gemini SDK handles its own endpoint
      openai: 'https://api.openai.com/v1',
      anthropic: 'https://api.anthropic.com/v1',
      deepseek: 'https://api.deepseek.com/v1',
      ollama: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    };
    return urlMap[provider];
  }

  /**
   * Load cache configuration
   */
  private loadCacheConfig(): CacheConfig {
    return {
      enabled: process.env.ENABLE_CACHE === 'true',
      ttl: parseInt(process.env.CACHE_TTL || '900'),
      maxSize: 1000,
    };
  }

  /**
   * Load logging configuration
   */
  private loadLoggingConfig(): LoggingConfig {
    return {
      level: (process.env.LOG_LEVEL || 'info') as LoggingConfig['level'],
      format: 'text',
      outputFile: undefined,
    };
  }

  /**
   * Get full configuration
   */
  public getConfig(): Config {
    return this.config;
  }

  /**
   * Get blockchain configuration
   */
  public getBlockchainConfig(): BlockchainConfig {
    return this.config.blockchain;
  }

  /**
   * Get network configuration
   */
  public getNetworkConfig(network: string): NetworkConfig {
    const networkConfig = this.config.blockchain.networks[network];
    if (!networkConfig) {
      throw new Error(`Network "${network}" not configured`);
    }
    return networkConfig;
  }

  /**
   * Get LLM configuration
   */
  public getLLMConfig(): LLMConfig {
    return this.config.llm;
  }

  /**
   * Get cache configuration
   */
  public getCacheConfig(): CacheConfig {
    return this.config.cache;
  }

  /**
   * Get logging configuration
   */
  public getLoggingConfig(): LoggingConfig {
    return this.config.logging;
  }

  /**
   * Validate configuration
   */
  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate LLM configuration
    const llmConfig = this.config.llm;
    if (!llmConfig.apiKey && llmConfig.provider !== 'ollama') {
      errors.push(`API key required for ${llmConfig.provider}`);
    }

    // Validate network configuration
    const defaultNetwork = this.config.blockchain.defaultNetwork;
    if (!this.config.blockchain.networks[defaultNetwork]) {
      errors.push(`Default network "${defaultNetwork}" not configured`);
    }

    // Validate RPC URLs
    Object.entries(this.config.blockchain.networks).forEach(([name, network]) => {
      if (!network.rpcUrl) {
        errors.push(`RPC URL not configured for network "${name}"`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Export singleton instance
 */
export const config = ConfigManager.getInstance();
