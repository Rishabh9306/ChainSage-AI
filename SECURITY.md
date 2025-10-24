# Security Policy

## Supported Versions

Currently supported versions of ChainSage AI:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in ChainSage AI, please report it responsibly.

### 🔒 How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report via one of these methods:

1. **Email**: Send details to [your-security-email@example.com]
2. **GitHub Security Advisories**: Use GitHub's private vulnerability reporting
3. **Direct Message**: Contact maintainers directly on [Discord/Telegram]

### 📋 What to Include

Please include the following information:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### ⏱️ Response Timeline

- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 72 hours
- **Fix Timeline**: Varies by severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Next release

### 🏆 Recognition

We appreciate security researchers who help keep ChainSage AI secure:

- Public acknowledgment in release notes (if desired)
- Listed in SECURITY_HALL_OF_FAME.md
- Potential bug bounty (as program develops)

## Security Best Practices

### For Users

1. **API Keys**: Never commit API keys to Git
   ```bash
   # Always use .env file
   echo ".env" >> .gitignore
   ```

2. **Network Safety**: Be cautious with mainnet operations
   ```bash
   # Test on testnet first
   npx chainsage analyze ADDRESS --network sepolia
   ```

3. **Updates**: Keep ChainSage updated
   ```bash
   npm update -g chainsage-ai
   ```

### For Developers

1. **Input Validation**: Always validate user inputs
2. **Error Handling**: Never expose sensitive data in errors
3. **Dependencies**: Regularly audit with `npm audit`
4. **Testing**: Write security-focused tests

## Known Security Considerations

### API Key Storage

- API keys are stored in `.env` files (not committed)
- Keys are never logged in plain text
- Use environment-specific keys (dev/staging/prod)

### Network Requests

- All requests use HTTPS
- Timeout mechanisms prevent hanging
- Rate limiting prevents abuse
- Retry logic with exponential backoff

### AI Analysis

- AI responses are sanitized before display
- No execution of AI-suggested code without review
- Rate limits prevent prompt injection abuse

### Smart Contract Interactions

- Read-only operations by default
- No private key handling in CLI
- Explicit user confirmation for write operations

## Security Audit Status

- ✅ **Code Review**: Internal review completed
- ⏳ **External Audit**: Pending
- ⏳ **Formal Verification**: Planned for core modules
- ✅ **Dependency Audit**: No critical vulnerabilities

## Security-Related Configuration

### Recommended .env Settings

```bash
# Minimum recommended settings
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-key-here
LOG_LEVEL=info
ENABLE_CACHE=true
REQUEST_TIMEOUT=30000
```

### Network Configuration

```bash
# Use your own RPC endpoints for production
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
```

## Vulnerability Disclosure Timeline

We follow responsible disclosure:

1. **Day 0**: Vulnerability reported
2. **Day 1**: Acknowledged
3. **Day 3**: Assessment complete
4. **Day 7-30**: Fix developed and tested
5. **Day 30**: Fix released
6. **Day 60**: Public disclosure (if appropriate)

## Security Checklist for Contributors

Before submitting code:

- [ ] No hardcoded secrets or API keys
- [ ] Input validation on all user data
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies are up-to-date
- [ ] Tests cover security edge cases
- [ ] Documentation mentions security considerations

## Contact

For security inquiries:
- **Email**: security@chainsage.ai (if available)
- **PGP Key**: [Link to public key]
- **Response Time**: 24-48 hours

## Legal

ChainSage AI is provided "as is" without warranty. Users are responsible for:
- Securing their API keys
- Validating AI analysis results
- Following security best practices
- Complying with applicable laws

---

*Last Updated: October 25, 2025*
*Version: 1.0.0*
