#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧠 Setting up ChainSage AI...\n');

// Check Node version
const nodeVersion = process.versions.node;
const majorVersion = parseInt(nodeVersion.split('.')[0]);

if (majorVersion < 20) {
  console.error('❌ Error: Node.js version 20 or higher is required');
  console.error(`   Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log('✅ Node.js version:', nodeVersion);

// Create .env file if it doesn't exist
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
    console.log('   Please edit .env and add your API keys\n');
  } else {
    console.log('⚠️  Warning: .env.example not found');
  }
} else {
  console.log('✅ .env file already exists');
}

// Create necessary directories
const directories = [
  'contracts',
  'test',
  'src/cli',
  'src/core',
  'src/utils',
  'src/types',
  'scripts',
  'reports',
];

directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Check for required environment variables
console.log('\n🔍 Checking environment configuration...\n');

const requiredVars = [
  'OPENAI_API_KEY',
  'SEPOLIA_RPC_URL',
];

const missingVars = [];

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  requiredVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=.+`, 'm');
    if (!regex.test(envContent)) {
      missingVars.push(varName);
    }
  });
}

if (missingVars.length > 0) {
  console.log('⚠️  Missing required environment variables:');
  missingVars.forEach(v => console.log(`   - ${v}`));
  console.log('\n   Please update your .env file with these values\n');
} else {
  console.log('✅ All required environment variables are set\n');
}

// Install OpenZeppelin contracts for Solidity
console.log('📦 Installing OpenZeppelin contracts...\n');
try {
  execSync('npm install @openzeppelin/contracts', { stdio: 'inherit' });
  console.log('\n✅ OpenZeppelin contracts installed\n');
} catch (error) {
  console.error('❌ Failed to install OpenZeppelin contracts');
}

// Compile contracts
console.log('🔨 Compiling smart contracts...\n');
try {
  execSync('npx hardhat compile', { stdio: 'inherit' });
  console.log('\n✅ Contracts compiled successfully\n');
} catch (error) {
  console.log('⚠️  Contract compilation skipped or failed\n');
}

// Build TypeScript
console.log('🏗️  Building TypeScript...\n');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✅ TypeScript build successful\n');
} catch (error) {
  console.log('⚠️  TypeScript build skipped or failed\n');
}

// Final instructions
console.log('═══════════════════════════════════════════════════════');
console.log('🎉 ChainSage AI setup complete!');
console.log('═══════════════════════════════════════════════════════\n');

console.log('Next steps:');
console.log('  1. Update .env with your API keys');
console.log('  2. Run: npm run build');
console.log('  3. Try: npx chainsage config\n');

console.log('Example commands:');
console.log('  npx chainsage analyze 0x1234...');
console.log('  npx chainsage simulate ./contracts/StakingVault.sol');
console.log('  npx chainsage explain 0xabcd...\n');

console.log('For more info, see README.md');
console.log('═══════════════════════════════════════════════════════\n');
