#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as readline from 'readline';
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

/**
 * Batch analyze command
 */
program
  .command('batch')
  .description('Batch analyze multiple contracts from a file')
  .argument('<file>', 'File containing contract addresses (one per line)')
  .option('-n, --network <network>', 'Network to use', 'ethereum')
  .option('-o, --output <file>', 'Output file for results', 'batch-results.json')
  .action(async (file, options) => {
    const spinner = ora('Starting batch analysis...').start();

    try {
      // Read addresses from file
      const addresses = fs
        .readFileSync(file, 'utf-8')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && line.startsWith('0x'));

      if (addresses.length === 0) {
        spinner.fail('No valid addresses found in file');
        process.exit(1);
      }

      spinner.text = `Found ${addresses.length} contracts to analyze`;

      const blockscout = new BlockscoutClient();
      const aiReasoner = new AIReasoner();
      const results: any[] = [];

      for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        spinner.text = `Analyzing ${i + 1}/${addresses.length}: ${address}`;

        try {
          const contractInfo = await blockscout.getContract(address, options.network);
          const analysis = await aiReasoner.analyzeContract(contractInfo);

          results.push({
            address,
            name: contractInfo.name,
            verified: contractInfo.verified,
            securityScore: analysis.securityScore,
            criticalRisks: analysis.risks.filter((r) => r.severity === 'critical').length,
            highRisks: analysis.risks.filter((r) => r.severity === 'high').length,
            success: true,
          });
        } catch (error: any) {
          results.push({
            address,
            error: error.message,
            success: false,
          });
        }
      }

      // Save results
      fs.writeFileSync(options.output, JSON.stringify(results, null, 2));

      spinner.succeed('Batch analysis complete!');

      // Display summary
      console.log('\n' + chalk.bold.blue('═══════════════════════════════════════════════════════'));
      console.log(chalk.bold.cyan('📊 BATCH ANALYSIS SUMMARY'));
      console.log(chalk.bold.blue('═══════════════════════════════════════════════════════\n'));

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      console.log(chalk.bold('Total Contracts:'), chalk.yellow(addresses.length));
      console.log(chalk.bold('Successful:'), chalk.green(successful));
      console.log(chalk.bold('Failed:'), chalk.red(failed));

      const avgScore =
        results.filter((r) => r.success).reduce((sum, r) => sum + (r.securityScore || 0), 0) /
        successful;
      console.log(chalk.bold('Average Security Score:'), getScoreColor(Math.round(avgScore)));

      const totalCritical = results.reduce((sum, r) => sum + (r.criticalRisks || 0), 0);
      const totalHigh = results.reduce((sum, r) => sum + (r.highRisks || 0), 0);

      console.log(chalk.bold('Total Critical Issues:'), chalk.red(totalCritical));
      console.log(chalk.bold('Total High Issues:'), chalk.yellow(totalHigh));

      console.log('\n' + chalk.gray(`Results saved to: ${options.output}`));
      console.log(chalk.bold.blue('═══════════════════════════════════════════════════════\n'));
    } catch (error: any) {
      spinner.fail('Batch analysis failed');
      console.error(chalk.red('Error:'), error.message);
      logger.error('Batch command failed', error);
      process.exit(1);
    }
  });

/**
 * Interactive mode command
 */
program
  .command('interactive')
  .description('Start interactive analysis wizard')
  .action(async () => {
    console.log(chalk.bold.cyan('\n🧠 ChainSage AI - Interactive Mode\n'));

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (prompt: string): Promise<string> =>
      new Promise((resolve) => rl.question(prompt, resolve));

    try {
      // Step 1: What to analyze
      console.log(chalk.bold('What would you like to analyze?'));
      console.log('1. Smart Contract');
      console.log('2. Transaction');
      console.log('3. Compare Simulation vs Reality\n');

      const choice = await question(chalk.yellow('Enter your choice (1-3): '));

      if (choice === '1') {
        // Analyze contract
        const address = await question(
          chalk.yellow('\nEnter contract address: ')
        );
        const network = await question(
          chalk.yellow('Enter network (ethereum/sepolia/optimism/base/arbitrum): ')
        );

        rl.close();

        console.log(chalk.gray('\n🔍 Starting analysis...\n'));

        const spinner = ora('Analyzing contract...').start();
        const blockscout = new BlockscoutClient();
        const aiReasoner = new AIReasoner();

        const contractInfo = await blockscout.getContract(address.trim(), network.trim() || 'ethereum');
        const analysis = await aiReasoner.analyzeContract(contractInfo);

        spinner.succeed('Analysis complete!');

        // Display results (simplified)
        console.log('\n' + chalk.bold.green('✓ Contract:'), contractInfo.name);
        console.log(chalk.bold.green('✓ Security Score:'), getScoreColor(analysis.securityScore));
        console.log(
          chalk.bold.yellow('⚠ Risks:'),
          analysis.risks.length,
          'found'
        );
      } else if (choice === '2') {
        await question(chalk.yellow('\nEnter transaction hash: '));
        await question(
          chalk.yellow('Enter network (ethereum/sepolia/optimism/base/arbitrum): ')
        );

        rl.close();
        console.log(chalk.gray('\n🔍 Explaining transaction...\n'));
        console.log(chalk.yellow('Transaction explanation feature coming soon!'));
      } else {
        rl.close();
        console.log(chalk.yellow('\nInvalid choice. Exiting.'));
      }
    } catch (error: any) {
      rl.close();
      console.error(chalk.red('\nError:'), error.message);
      process.exit(1);
    }
  });

/**
 * Automated fix suggestions command
 */
program
  .command('fix')
  .description('Generate automated fix suggestions for contract vulnerabilities')
  .argument('<address>', 'Contract address to analyze')
  .option('-n, --network <network>', 'Network to use', 'ethereum')
  .option('-o, --output <file>', 'Output file for fix suggestions')
  .action(async (address, options) => {
    const spinner = ora('Analyzing contract for vulnerabilities...').start();

    try {
      const blockscout = new BlockscoutClient();
      const aiReasoner = new AIReasoner();

      // Get contract info
      spinner.text = 'Fetching contract...';
      const contractInfo = await blockscout.getContract(address, options.network);

      if (!contractInfo.verified || !contractInfo.sourceCode) {
        spinner.fail('Contract must be verified on Blockscout to generate fixes');
        process.exit(1);
      }

      // Analyze for vulnerabilities
      spinner.text = 'Analyzing vulnerabilities...';
      const analysis = await aiReasoner.analyzeContract(contractInfo);

      // Generate fixes
      spinner.text = 'Generating automated fix suggestions...';
      
      const fixPrompt = `You are a Solidity security expert. Analyze the following vulnerabilities and provide specific code fixes.

Contract: ${contractInfo.name}
Source Code:
${contractInfo.sourceCode}

Identified Vulnerabilities:
${analysis.risks.map((r: any) => `- [${r.severity.toUpperCase()}] ${r.title}: ${r.description}`).join('\n')}

For each vulnerability, provide:
1. Brief explanation of the issue
2. Original vulnerable code snippet
3. Fixed code snippet with comments
4. Security best practices

Format as JSON with this structure:
{
  "fixes": [
    {
      "vulnerability": "Vulnerability name",
      "severity": "critical/high/medium/low",
      "explanation": "Why this is a problem",
      "originalCode": "// vulnerable code",
      "fixedCode": "// secure code with comments",
      "bestPractices": ["practice 1", "practice 2"]
    }
  ]
}`;

      const fixResponse = await aiReasoner.generateText(fixPrompt);
      
      let fixSuggestions: any;
      try {
        fixSuggestions = JSON.parse(fixResponse);
      } catch {
        // If JSON parsing fails, create structured output
        fixSuggestions = {
          fixes: analysis.risks.map((r: any) => ({
            vulnerability: r.title,
            severity: r.severity,
            explanation: r.description,
            originalCode: '// Refer to contract source code',
            fixedCode: '// Manual review recommended',
            bestPractices: ['Follow OpenZeppelin patterns', 'Add comprehensive tests'],
          })),
        };
      }

      spinner.succeed('Fix suggestions generated!');

      // Display fixes
      console.log('\n' + chalk.bold.blue('═══════════════════════════════════════════════════════'));
      console.log(chalk.bold.cyan('🔧 AUTOMATED FIX SUGGESTIONS'));
      console.log(chalk.bold.blue('═══════════════════════════════════════════════════════\n'));

      console.log(chalk.bold('Contract:'), chalk.yellow(contractInfo.name));
      console.log(chalk.bold('Address:'), chalk.gray(address));
      console.log(chalk.bold('Security Score:'), getScoreColor(analysis.securityScore));
      console.log('');

      fixSuggestions.fixes.forEach((fix: any, index: number) => {
        const severityColor =
          fix.severity === 'critical'
            ? chalk.red
            : fix.severity === 'high'
            ? chalk.yellow
            : chalk.blue;

        console.log(chalk.bold(`${index + 1}. ${fix.vulnerability}`));
        console.log(severityColor(`   Severity: ${fix.severity.toUpperCase()}`));
        console.log(chalk.gray(`   ${fix.explanation}`));
        console.log('');

        if (fix.originalCode && fix.originalCode !== '// Refer to contract source code') {
          console.log(chalk.bold('   Original Code:'));
          console.log(chalk.red('   ' + fix.originalCode.replace(/\n/g, '\n   ')));
          console.log('');
          console.log(chalk.bold('   Fixed Code:'));
          console.log(chalk.green('   ' + fix.fixedCode.replace(/\n/g, '\n   ')));
          console.log('');
        }

        if (fix.bestPractices && fix.bestPractices.length > 0) {
          console.log(chalk.bold('   Best Practices:'));
          fix.bestPractices.forEach((practice: string) => {
            console.log(chalk.gray(`   • ${practice}`));
          });
          console.log('');
        }
      });

      // Save to file if requested
      if (options.output) {
        const fullReport = {
          contract: {
            name: contractInfo.name,
            address,
            network: options.network,
          },
          analysis: {
            securityScore: analysis.securityScore,
            risks: analysis.risks,
          },
          fixes: fixSuggestions.fixes,
        };

        fs.writeFileSync(options.output, JSON.stringify(fullReport, null, 2));
        console.log(chalk.gray(`Fix suggestions saved to: ${options.output}\n`));
      }

      console.log(chalk.bold.blue('═══════════════════════════════════════════════════════\n'));
    } catch (error: any) {
      spinner.fail('Failed to generate fix suggestions');
      console.error(chalk.red('Error:'), error.message);
      logger.error('Fix command failed', error);
      process.exit(1);
    }
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
