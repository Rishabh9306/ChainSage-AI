# 🛡️ ChainSage AI - Secure Smart Contract Templates

Production-ready, security-audited smart contract templates that have been analyzed and approved by ChainSage AI.

## 📊 Templates Overview

| Template | Score | Description | Use Case |
|----------|-------|-------------|----------|
| [ERC20-safe.sol](ERC20-safe.sol) | 95/100 | Secure ERC20 token | Tokens, currencies, governance |
| [ERC721-safe.sol](ERC721-safe.sol) | 93/100 | Secure NFT contract | NFT collections, digital art |
| [Staking-safe.sol](Staking-safe.sol) | 96/100 | Secure staking contract | DeFi staking, yield farming |

## ✅ Why These Templates Are Safe

All templates have been:
- ✅ **Analyzed by ChainSage AI** - Passed comprehensive security analysis
- ✅ **Built with OpenZeppelin** - Uses audited, battle-tested contracts
- ✅ **Solidity 0.8.20+** - Built-in overflow/underflow protection
- ✅ **Best Practices** - Follows Checks-Effects-Interactions pattern
- ✅ **Gas Optimized** - Efficient implementation
- ✅ **Well Documented** - Comprehensive NatSpec comments

## 🔒 Security Features

### All Templates Include:

1. **Reentrancy Protection**
   - ReentrancyGuard from OpenZeppelin
   - Checks-Effects-Interactions pattern
   - State updates before external calls

2. **Access Control**
   - Ownable pattern for admin functions
   - Explicit function visibility
   - Protected initialization

3. **Overflow Protection**
   - Solidity 0.8.20+ built-in checks
   - SafeMath not needed
   - Validated arithmetic operations

4. **Emergency Controls**
   - Pausable functionality
   - Emergency withdrawal
   - Owner-only administrative functions

5. **Safe External Calls**
   - SafeERC20 for token transfers
   - Return value checks
   - Gas limit considerations

## 🚀 Quick Start

### 1. ERC20 Token

Create a secure ERC20 token:

```bash
# Copy template
cp templates/ERC20-safe.sol contracts/MyToken.sol

# Install dependencies
npm install @openzeppelin/contracts

# Compile
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy.js --network mainnet
```

**Example Deployment:**
```javascript
const SafeERC20Token = await ethers.getContractFactory("SafeERC20Token");
const token = await SafeERC20Token.deploy(
    "My Token",           // name
    "MTK",               // symbol
    1000000 * 10**18,    // initial supply
    10000000 * 10**18    // max supply
);
```

### 2. NFT Collection

Create a secure NFT collection:

```bash
cp templates/ERC721-safe.sol contracts/MyNFT.sol
```

**Example Deployment:**
```javascript
const SafeERC721NFT = await ethers.getContractFactory("SafeERC721NFT");
const nft = await SafeERC721NFT.deploy(
    "My NFT Collection",                    // name
    "MNFT",                                 // symbol
    "https://api.example.com/metadata/",    // base URI
    10000,                                  // max supply
    ethers.utils.parseEther("0.1")         // mint price
);
```

### 3. Staking Contract

Create a secure staking contract:

```bash
cp templates/Staking-safe.sol contracts/MyStaking.sol
```

**Example Deployment:**
```javascript
const SafeStakingContract = await ethers.getContractFactory("SafeStakingContract");
const staking = await SafeStakingContract.deploy(
    stakingTokenAddress,  // token to stake
    rewardTokenAddress,   // reward token
    100,                  // reward rate per second
    86400                 // minimum stake duration (1 day)
);
```

## 📖 Template Details

### ERC20-safe.sol

**Features:**
- Maximum supply cap
- Pausable transfers
- Burnable tokens
- ERC20Permit (gasless approvals)
- Owner-only minting

**Security Score: 95/100**

**ChainSage Analysis:**
```
✓ No reentrancy vulnerabilities
✓ Proper access control
✓ No integer overflow/underflow
✓ Safe external calls
✓ Emergency pause mechanism
✓ Standard ERC20 compliance
```

**Use Cases:**
- Governance tokens
- Utility tokens
- Stablecoins
- Reward tokens

---

### ERC721-safe.sol

**Features:**
- Configurable max supply
- Adjustable mint price
- URI storage for metadata
- Owner minting (airdrops)
- Automatic refunds for overpayment
- Pausable transfers

**Security Score: 93/100**

**ChainSage Analysis:**
```
✓ No reentrancy vulnerabilities
✓ Proper access control
✓ No integer overflow/underflow
✓ Safe external calls
✓ Emergency pause mechanism
✓ Standard ERC721 compliance
✓ Refund mechanism for excess payment
```

**Use Cases:**
- NFT collections
- Digital art
- Gaming assets
- Membership tokens

---

### Staking-safe.sol

**Features:**
- Reward distribution system
- Minimum staking duration
- Emergency withdrawal
- Adjustable reward rate
- Safe token handling
- ReentrancyGuard protection

**Security Score: 96/100**

**ChainSage Analysis:**
```
✓ No reentrancy vulnerabilities
✓ Proper access control
✓ No integer overflow/underflow
✓ Safe external calls
✓ Emergency pause mechanism
✓ Checks-Effects-Interactions pattern
✓ SafeERC20 usage
```

**Use Cases:**
- Yield farming
- Liquidity mining
- Governance staking
- Reward distribution

## 🧪 Testing

Before deploying to mainnet, always:

1. **Run ChainSage Analysis:**
```bash
# Analyze your contract
npx chainsage analyze <contract-address> --network sepolia

# Get automated fix suggestions
npx chainsage fix <contract-address> --network sepolia
```

2. **Write Comprehensive Tests:**
```javascript
describe("SafeERC20Token", function() {
    it("Should prevent minting beyond max supply", async function() {
        // Test implementation
    });
    
    it("Should prevent unauthorized minting", async function() {
        // Test implementation
    });
    
    it("Should handle pausing correctly", async function() {
        // Test implementation
    });
});
```

3. **Run Security Tools:**
```bash
# Slither
slither contracts/

# Mythril
myth analyze contracts/MyContract.sol

# ChainSage AI
npx chainsage analyze <address>
```

4. **Get Professional Audit:**
   - Consider OpenZeppelin Defender
   - Consult professional auditors
   - Use bug bounty programs

## ⚠️ Important Notes

### Before Mainnet Deployment:

- [ ] Run full test suite
- [ ] Analyze with ChainSage AI
- [ ] Run multiple security tools
- [ ] Test on testnet first
- [ ] Consider professional audit
- [ ] Verify contract on Etherscan
- [ ] Set up monitoring/alerts
- [ ] Prepare emergency response plan

### Customization:

These templates are starting points. Customize them for your needs:
- Add custom logic carefully
- Maintain security patterns
- Re-analyze after changes
- Document modifications
- Test thoroughly

### Gas Optimization:

These templates prioritize security over gas optimization. Consider:
- Immutable variables where possible
- Efficient data structures
- Batch operations
- Storage vs memory usage

## 📚 Additional Resources

### OpenZeppelin Contracts
- [Documentation](https://docs.openzeppelin.com/contracts)
- [GitHub](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Wizard](https://wizard.openzeppelin.com/)

### Security Best Practices
- [Consensys Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [SWC Registry](https://swcregistry.io/)
- [Solidity Security](https://github.com/sigp/solidity-security-blog)

### ChainSage AI
- [GitHub](https://github.com/Rishabh9306/ChainSage-AI)
- [Documentation](https://github.com/Rishabh9306/ChainSage-AI#readme)
- [Vulnerability Database](../vulnerabilities/)

## 🤝 Contributing

Found a security issue? Have a template idea?
1. Open an issue on GitHub
2. Submit a pull request
3. Run ChainSage analysis on your template
4. Include test coverage

## 📄 License

MIT License - See [LICENSE](../LICENSE) file

---

**Built with ❤️ by ChainSage AI**  
*Making Web3 safer, one contract at a time.*

## 🔐 Security Disclaimer

These templates have been analyzed by ChainSage AI and follow best practices, but:
- No code is 100% secure
- Always perform your own security review
- Test thoroughly before mainnet deployment
- Consider professional audits for high-value contracts
- Monitor deployed contracts continuously
- Have an emergency response plan

**Use at your own risk. The authors are not responsible for any losses incurred from using these templates.**
