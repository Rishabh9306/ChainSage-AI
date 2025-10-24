#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { BlockscoutClient } from '../core/blockscout-client';
import { AIReasoner } from '../core/ai-reasoner';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { Transaction } from '../types';

const program = new Command();

program.name('chainsage').description('AI-powered blockchain intelligence suite').version('1.0.0');

/**
 * Analyze command
 */
program
  .command('analyze')
  .description('Analyze a smart contract using AI')
  .argument('<address>', 'Contract address to analyze')
  .option('-n, --network <network>', 'Network to use', 'ethereum')
  .option('-d, --detailed', 'Show detailed analysis', false)
  .action(async (address, options) => {
    const spinner = ora('Analyzing contract...').start();

    try {
      // Validate configuration
      const validation = config.validate();
      if (!validation.valid) {
        spinner.fail('Configuration errors:');
        validation.errors.forEach((err) => console.error(chalk.red(`  ✗ ${err}`)));
        process.exit(1);
      }

      const blockscout = new BlockscoutClient();
      const aiReasoner = new AIReasoner();

      spinner.text = `Fetching contract data for ${address}...`;
      const contractInfo = await blockscout.getContract(address, options.network);

      // Try to fetch transactions but don't fail if it doesn't work
      let transactions: Transaction[] = [];
      try {
        spinner.text = 'Fetching transaction history...';
        transactions = await blockscout.getTransactions(address, 50, options.network);
      } catch (error: any) {
        logger.warn(`Could not fetch transactions: ${error.message}`);
        spinner.text = 'Analyzing contract (without transaction history)...';
      }

      spinner.text = 'Running AI analysis...';
      const analysis = await aiReasoner.analyzeContract({
        ...contractInfo,
        transactions,
      });

      spinner.succeed('Analysis complete!');

      // Display results
      console.log(
        '\n' + chalk.bold.blue('═══════════════════════════════════════════════════════')
      );
      console.log(chalk.bold.cyan('📊 CONTRACT ANALYSIS REPORT'));
      console.log(chalk.bold.blue('═══════════════════════════════════════════════════════\n'));

      console.log(chalk.bold('Contract:'), chalk.green(contractInfo.name));
      console.log(chalk.bold('Address:'), chalk.gray(address));
      console.log(
        chalk.bold('Verified:'),
        contractInfo.verified ? chalk.green('✓ Yes') : chalk.red('✗ No')
      );
      console.log(chalk.bold('Transactions:'), chalk.yellow(contractInfo.transactionCount));
      console.log(chalk.bold('Security Score:'), getScoreColor(analysis.securityScore));

      console.log('\n' + chalk.bold.yellow('📝 Summary:'));
      console.log(chalk.gray(analysis.summary));

      if (analysis.functionality.length > 0) {
        console.log('\n' + chalk.bold.green('⚙️  Key Functionality:'));
        analysis.functionality.forEach((func) => {
          console.log(chalk.gray('  • ' + func));
        });
      }

      if (analysis.risks.length > 0) {
        console.log('\n' + chalk.bold.red('⚠️  Security Risks:'));
        analysis.risks.forEach((risk) => {
          const severityColor = getSeverityColor(risk.severity);
          console.log(severityColor(`  [${risk.severity.toUpperCase()}] ${risk.category}`));
          console.log(chalk.gray(`    ${risk.description}`));
          console.log(chalk.blue(`    💡 ${risk.recommendation}`));
        });
      }

      if (analysis.optimizations.length > 0 && options.detailed) {
        console.log('\n' + chalk.bold.cyan('🔧 Optimization Opportunities:'));
        analysis.optimizations.forEach((opt) => {
          console.log(chalk.yellow(`  [${opt.category}] ${opt.description}`));
          console.log(chalk.gray(`    Impact: ${opt.impact}`));
        });
      }

      if (analysis.behaviorInsights.length > 0) {
        console.log('\n' + chalk.bold.magenta('🧠 Behavioral Insights:'));
        analysis.behaviorInsights.forEach((insight) => {
          console.log(chalk.gray('  • ' + insight));
        });
      }

      console.log(
        '\n' + chalk.bold.blue('═══════════════════════════════════════════════════════\n')
      );
    } catch (error: any) {
      spinner.fail('Analysis failed');
      console.error(chalk.red('Error:'), error.message);
      logger.error('Analyze command failed', error);
      process.exit(1);
    }
  });

/**
 * Simulate command
 */
program
  .command('simulate')
  .description('Simulate contract deployment and testing with Hardhat')
  .argument('<contract>', 'Path to contract file')
  .option('-t, --test', 'Run tests after deployment', false)
  .option('-g, --gas-report', 'Generate gas report', false)
  .action(async (contractPath, options) => {
    const spinner = ora('Setting up Hardhat simulation...').start();

    try {
      spinner.info(chalk.yellow('Simulation feature coming soon!'));
      console.log(chalk.gray('This will compile, deploy, and test your contract using Hardhat 3.'));
      console.log(chalk.gray(`Contract: ${contractPath}`));
      console.log(chalk.gray(`Run tests: ${options.test}`));
      console.log(chalk.gray(`Gas report: ${options.gasReport}`));
    } catch (error: any) {
      spinner.fail('Simulation failed');
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Compare command
 */
program
  .command('compare')
  .description('Compare simulation results with on-chain deployment')
  .argument('<address>', 'Deployed contract address')
  .option('-n, --network <network>', 'Network to use', 'ethereum')
  .action(async (address, options) => {
    const spinner = ora('Comparing simulation with on-chain data...').start();

    try {
      spinner.info(chalk.yellow('Comparison feature coming soon!'));
      console.log(
        chalk.gray('This will compare your Hardhat simulation with the deployed contract.')
      );
      console.log(chalk.gray(`Address: ${address}`));
      console.log(chalk.gray(`Network: ${options.network}`));
    } catch (error: any) {
      spinner.fail('Comparison failed');
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Explain command
 */
program
  .command('explain')
  .description('Explain a transaction using AI')
  .argument('<txHash>', 'Transaction hash to explain')
  .option('-n, --network <network>', 'Network to use', 'ethereum')
  .action(async (txHash, options) => {
    const spinner = ora('Fetching transaction data...').start();

    try {
      const blockscout = new BlockscoutClient();
      const aiReasoner = new AIReasoner();

      spinner.text = 'Analyzing transaction...';
      const txData = await blockscout.getTransaction(txHash, options.network);
      const internalTxs = await blockscout.getInternalTransactions(txHash, options.network);

      spinner.text = 'Generating AI explanation...';
      const analysis = await aiReasoner.analyzeTransaction({
        ...txData,
        internalTransactions: internalTxs,
      });

      spinner.succeed('Transaction analyzed!');

      console.log(
        '\n' + chalk.bold.blue('═══════════════════════════════════════════════════════')
      );
      console.log(chalk.bold.cyan('🔍 TRANSACTION EXPLANATION'));
      console.log(chalk.bold.blue('═══════════════════════════════════════════════════════\n'));

      console.log(chalk.bold('Transaction:'), chalk.gray(txHash));
      console.log(
        chalk.bold('Status:'),
        txData.status === 'success' ? chalk.green('✓ Success') : chalk.red('✗ Failed')
      );
      console.log(chalk.bold('From:'), chalk.gray(txData.from));
      console.log(chalk.bold('To:'), chalk.gray(txData.to));
      console.log(chalk.bold('Value:'), chalk.yellow(txData.value.toString()), 'wei');
      console.log(chalk.bold('Gas Used:'), chalk.yellow(txData.gasUsed.toString()));

      console.log('\n' + chalk.bold.yellow('📝 Summary:'));
      console.log(chalk.gray(analysis.summary));

      console.log('\n' + chalk.bold.green('🎯 Intent:'));
      console.log(chalk.gray(analysis.intent));

      if (analysis.valueFlow.length > 0) {
        console.log('\n' + chalk.bold.cyan('💸 Value Flow:'));
        analysis.valueFlow.forEach((flow) => {
          console.log(
            chalk.gray(`  ${flow.from} → ${flow.to}: ${flow.amount} ${flow.token || 'ETH'}`)
          );
          console.log(chalk.gray(`  ${flow.description}`));
        });
      }

      console.log('\n' + chalk.bold.magenta('🔧 Explanation:'));
      console.log(chalk.gray(analysis.explanation));

      console.log(
        '\n' + chalk.bold.blue('═══════════════════════════════════════════════════════\n')
      );
    } catch (error: any) {
      spinner.fail('Transaction explanation failed');
      console.error(chalk.red('Error:'), error.message);
      logger.error('Explain command failed', error);
      process.exit(1);
    }
  });

/**
 * Config command
 */
program
  .command('config')
  .description('Validate and display configuration')
  .action(() => {
    console.log(chalk.bold.cyan('\n🔧 ChainSage Configuration\n'));

    const validation = config.validate();

    if (validation.valid) {
      console.log(chalk.green('✓ Configuration is valid\n'));
    } else {
      console.log(chalk.red('✗ Configuration has errors:\n'));
      validation.errors.forEach((err) => {
        console.log(chalk.red(`  • ${err}`));
      });
      console.log('');
      return;
    }

    const llmConfig = config.getLLMConfig();
    const blockchainConfig = config.getBlockchainConfig();

    console.log(chalk.bold('LLM Provider:'), chalk.yellow(llmConfig.provider));
    console.log(chalk.bold('Model:'), chalk.yellow(llmConfig.model));
    console.log(
      chalk.bold('API Key:'),
      llmConfig.apiKey ? chalk.green('✓ Set') : chalk.red('✗ Not set')
    );
    console.log(chalk.bold('Default Network:'), chalk.yellow(blockchainConfig.defaultNetwork));
    console.log('');
  });

// Helper functions
function getSeverityColor(severity: string): (text: string) => string {
  switch (severity) {
    case 'critical':
      return chalk.red.bold;
    case 'high':
      return chalk.red;
    case 'medium':
      return chalk.yellow;
    case 'low':
      return chalk.blue;
    default:
      return chalk.gray;
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return chalk.green(`${score}/100`);
  if (score >= 60) return chalk.yellow(`${score}/100`);
  return chalk.red(`${score}/100`);
}

program.parse();
