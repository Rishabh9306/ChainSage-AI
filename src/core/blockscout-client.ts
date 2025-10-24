import axios, { AxiosInstance } from 'axios';
import { config } from '../utils/config';
import { cache } from '../utils/cache';
import { logger } from '../utils/logger';
import {
  ContractInfo,
  SourceCode,
  Transaction,
  InternalTransaction,
  TokenInfo,
  TokenTransfer,
  BigNumber,
} from '../types';

// BigNumber type is defined in types
// ethers v6 uses native bigint
// Helper function to convert strings to bigint
const toBigNumber = (value: string | number): BigNumber => {
  return BigInt(value || 0);
};

/**
 * Blockscout MCP Client for fetching on-chain data
 */
export class BlockscoutClient {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    const blockscoutConfig = config.getBlockchainConfig().blockscout;
    this.baseUrl = blockscoutConfig.baseUrl;
    this.apiKey = blockscoutConfig.apiKey;

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: blockscoutConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      },
    });
  }

  /**
   * Get contract information
   */
  public async getContract(address: string, network: string = 'ethereum'): Promise<ContractInfo> {
    const cacheKey = `contract:${network}:${address}`;
    const cached = cache.get<ContractInfo>(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for contract ${address}`);
      return cached;
    }

    try {
      logger.info(`Fetching contract info for ${address} on ${network}`);

      const response = await this.axiosInstance.get(`/api/v2/smart-contracts/${address}`, {
        params: { network },
      });

      const data = response.data;
      const contractInfo: ContractInfo = {
        address: data.address,
        name: data.name || 'Unknown',
        compiler: data.compiler_version || 'Unknown',
        verified: data.is_verified || false,
        abi: data.abi || [],
        sourceCode: data.source_code,
        transactionCount: data.tx_count || 0,
        balance: toBigNumber(data.coin_balance || '0'),
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        creator: data.creator_address_hash,
      };

      cache.set(cacheKey, contractInfo);
      return contractInfo;
    } catch (error: any) {
      logger.error(`Failed to fetch contract ${address}`, error);
      throw new Error(`Failed to fetch contract information: ${error.message}`);
    }
  }

  /**
   * Get contract source code
   */
  public async getSourceCode(address: string, network: string = 'ethereum'): Promise<SourceCode> {
    const cacheKey = `source:${network}:${address}`;
    const cached = cache.get<SourceCode>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.axiosInstance.get(
        `/api/v2/smart-contracts/${address}/source-code`,
        {
          params: { network },
        }
      );

      const data = response.data;
      const sourceCode: SourceCode = {
        sourceCode: data.source_code || '',
        abi: data.abi || [],
        contractName: data.name || 'Unknown',
        compilerVersion: data.compiler_version || '',
        optimizationUsed: data.optimization_enabled || false,
        runs: data.optimization_runs || 200,
        constructorArguments: data.constructor_args || '',
        evmVersion: data.evm_version || '',
        library: data.external_libraries || '',
        licenseType: data.license_type || '',
        proxy: data.is_proxy || false,
        implementation: data.implementation_address,
        swarmSource: data.swarm_source || '',
      };

      cache.set(cacheKey, sourceCode);
      return sourceCode;
    } catch (error: any) {
      logger.error(`Failed to fetch source code for ${address}`, error);
      throw new Error(`Failed to fetch source code: ${error.message}`);
    }
  }

  /**
   * Get transactions for an address
   */
  public async getTransactions(
    address: string,
    limit: number = 100,
    network: string = 'ethereum'
  ): Promise<Transaction[]> {
    try {
      logger.info(`Fetching transactions for ${address} on ${network}`);

      const response = await this.axiosInstance.get(`/api/v2/addresses/${address}/transactions`, {
        params: { network, limit },
      });

      const transactions = response.data.items.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from.hash,
        to: tx.to?.hash || '',
        value: toBigNumber(tx.value || '0'),
        gasPrice: toBigNumber(tx.gas_price || '0'),
        gasUsed: toBigNumber(tx.gas_used || '0'),
        input: tx.input || '0x',
        blockNumber: tx.block || 0,
        timestamp: new Date(tx.timestamp),
        status: tx.status === 'ok' ? 'success' : 'failed',
        functionName: tx.method,
        methodId: tx.method_id,
      }));

      return transactions;
    } catch (error: any) {
      logger.error(`Failed to fetch transactions for ${address}`, error);
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

  /**
   * Get internal transactions
   */
  public async getInternalTransactions(
    txHash: string,
    network: string = 'ethereum'
  ): Promise<InternalTransaction[]> {
    try {
      const response = await this.axiosInstance.get(
        `/api/v2/transactions/${txHash}/internal-transactions`,
        { params: { network } }
      );

      const internalTxs = response.data.items.map((tx: any) => ({
        from: tx.from.hash,
        to: tx.to?.hash || '',
        value: toBigNumber(tx.value || '0'),
        type: tx.type,
        gas: toBigNumber(tx.gas || '0'),
        gasUsed: toBigNumber(tx.gas_used || '0'),
        isError: tx.error !== null,
        errCode: tx.error,
      }));

      return internalTxs;
    } catch (error: any) {
      logger.error(`Failed to fetch internal transactions for ${txHash}`, error);
      return [];
    }
  }

  /**
   * Get balance of an address
   */
  public async getBalance(address: string, network: string = 'ethereum'): Promise<BigNumber> {
    try {
      const response = await this.axiosInstance.get(`/api/v2/addresses/${address}`, {
        params: { network },
      });

      return toBigNumber(response.data.coin_balance || '0');
    } catch (error: any) {
      logger.error(`Failed to fetch balance for ${address}`, error);
      return toBigNumber('0');
    }
  }

  /**
   * Get token information
   */
  public async getTokenInfo(address: string, network: string = 'ethereum'): Promise<TokenInfo> {
    const cacheKey = `token:${network}:${address}`;
    const cached = cache.get<TokenInfo>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.axiosInstance.get(`/api/v2/tokens/${address}`, {
        params: { network },
      });

      const data = response.data;
      const tokenInfo: TokenInfo = {
        address: data.address,
        name: data.name || 'Unknown',
        symbol: data.symbol || 'UNKNOWN',
        decimals: data.decimals || 18,
        totalSupply: toBigNumber(data.total_supply || '0'),
        type: data.type || 'ERC20',
        holders: data.holders_count,
      };

      cache.set(cacheKey, tokenInfo);
      return tokenInfo;
    } catch (error: any) {
      logger.error(`Failed to fetch token info for ${address}`, error);
      throw new Error(`Failed to fetch token information: ${error.message}`);
    }
  }

  /**
   * Get token transfers for an address
   */
  public async getTokenTransfers(
    address: string,
    limit: number = 100,
    network: string = 'ethereum'
  ): Promise<TokenTransfer[]> {
    try {
      const response = await this.axiosInstance.get(
        `/api/v2/addresses/${address}/token-transfers`,
        { params: { network, limit } }
      );

      const transfers = response.data.items.map((transfer: any) => ({
        from: transfer.from.hash,
        to: transfer.to.hash,
        value: toBigNumber(transfer.total.value || '0'),
        tokenAddress: transfer.token.address,
        tokenName: transfer.token.name,
        tokenSymbol: transfer.token.symbol,
        timestamp: new Date(transfer.timestamp),
        transactionHash: transfer.tx_hash,
      }));

      return transfers;
    } catch (error: any) {
      logger.error(`Failed to fetch token transfers for ${address}`, error);
      return [];
    }
  }

  /**
   * Get transaction details
   */
  public async getTransaction(txHash: string, network: string = 'ethereum'): Promise<Transaction> {
    try {
      const response = await this.axiosInstance.get(`/api/v2/transactions/${txHash}`, {
        params: { network },
      });

      const tx = response.data;
      return {
        hash: tx.hash,
        from: tx.from.hash,
        to: tx.to?.hash || '',
        value: toBigNumber(tx.value || '0'),
        gasPrice: toBigNumber(tx.gas_price || '0'),
        gasUsed: toBigNumber(tx.gas_used || '0'),
        input: tx.input || '0x',
        blockNumber: tx.block || 0,
        timestamp: new Date(tx.timestamp),
        status: tx.status === 'ok' ? 'success' : 'failed',
        functionName: tx.method,
        methodId: tx.method_id,
      };
    } catch (error: any) {
      logger.error(`Failed to fetch transaction ${txHash}`, error);
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }
  }
}
