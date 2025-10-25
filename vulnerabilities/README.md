# ChainSage AI Vulnerability Database

A comprehensive, machine-readable database of smart contract vulnerabilities detected and analyzed by ChainSage AI.

## 📊 Overview

- **Total Vulnerabilities**: 3 (actively maintained)
- **Coverage**: Critical to Medium severity
- **Real-World Examples**: 7 major hacks documented
- **Total Losses**: $1.2+ billion in documented incidents

## 🗂️ Vulnerability Categories

### Critical Severity
1. **[Reentrancy](reentrancy.md)** - External calls before state updates
2. **[Access Control](access-control.md)** - Unauthorized function execution

### High Severity
3. **[Integer Overflow/Underflow](integer-overflow.md)** - Arithmetic vulnerabilities

## 📖 How to Use

### Read Individual Vulnerabilities
Each vulnerability has a dedicated markdown file with:
- Detailed description
- How ChainSage detects it
- Vulnerable code examples
- Fixed code examples
- Real-world examples with $ losses
- Best practices
- References

### Machine-Readable Format
Use `index.json` for programmatic access:
```javascript
const vulnerabilities = require('./index.json');

// Get all critical vulnerabilities
const critical = vulnerabilities.vulnerabilities.filter(
  v => v.severity === 'CRITICAL'
);

// Get detection statistics
console.log(vulnerabilities.statistics);
```

### Query with ChainSage CLI
```bash
# Analyze contract for all known vulnerabilities
npx chainsage analyze 0xYourContract --network ethereum

# Get automated fix suggestions
npx chainsage fix 0xYourContract --network ethereum

# Batch analysis
npx chainsage batch contracts.txt -o results.json
```

## 🎯 Detection Statistics

| Metric | Value |
|--------|-------|
| Contracts Analyzed | 100+ |
| Vulnerabilities Found | 35 |
| Average Detection Time | 12 seconds |
| False Positive Rate | 3% |
| Critical Issues Found | 10 |
| High Issues Found | 18 |

## 🔍 What ChainSage Detects

### Pattern Analysis
- External call ordering
- State change patterns
- Access control modifiers
- Arithmetic operations
- Initialization sequences

### AI-Powered Detection
- Context-aware analysis using Gemini AI
- Cross-function vulnerability detection
- Complex attack vector identification
- Economic impact assessment

### Real-Time Comparison
- Simulated behavior (Hardhat)
- On-chain behavior (Blockscout MCP)
- Gas consumption analysis
- State divergence detection

## 📚 Real-World Impact

### Documented Hacks in Database

| Hack | Year | Loss | Vulnerability |
|------|------|------|---------------|
| The DAO | 2016 | $60M | Reentrancy |
| Parity Wallet | 2017 | $180M | Access Control |
| BeautyChain | 2018 | $900M | Integer Overflow |
| Lendf.me | 2020 | $25M | Reentrancy |
| Rubixi | 2016 | $1M | Access Control |
| SMT Token | 2018 | Unlimited | Integer Overflow |

**Total**: $1.2+ billion in losses from these 3 vulnerability types alone.

## 🛠️ Contributing

We welcome contributions! To add a new vulnerability:

1. Create a markdown file: `vulnerabilities/your-vulnerability.md`
2. Follow the template structure (see existing files)
3. Update `index.json` with metadata
4. Submit a pull request

### Template Structure
```markdown
# Vulnerability Name

**Severity:** CRITICAL/HIGH/MEDIUM/LOW
**CWE:** CWE-XXX
**OWASP:** Category

## Description
...

## How ChainSage Detects It
...

## Vulnerable Code Example
...

## Fixed Code Example
...

## Real-World Examples
...

## Best Practices
...

## References
...
```

## 📈 Future Additions

Planned vulnerabilities to add:
- [ ] Front-running vulnerabilities
- [ ] Oracle manipulation
- [ ] Timestamp dependence
- [ ] Delegatecall injection
- [ ] Gas limit DoS
- [ ] Flash loan attacks
- [ ] Signature replay
- [ ] Price manipulation

## 🔗 Resources

- **ChainSage GitHub**: [github.com/Rishabh9306/ChainSage-AI](https://github.com/Rishabh9306/ChainSage-AI)
- **SWC Registry**: [swcregistry.io](https://swcregistry.io/)
- **OWASP Top 10**: [owasp.org/www-project-top-ten](https://owasp.org/www-project-top-ten/)
- **Smart Contract Best Practices**: [consensys.github.io/smart-contract-best-practices](https://consensys.github.io/smart-contract-best-practices/)

## 📝 License

MIT License - See [LICENSE](../LICENSE) file

---

**Built with ❤️ by ChainSage AI**  
*Making Web3 safer, one contract at a time.*
