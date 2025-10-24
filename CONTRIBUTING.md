# Contributing to ChainSage AI

Thank you for your interest in contributing to ChainSage AI! This document provides guidelines and instructions for contributing.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Pull Request Process](#pull-request-process)

---

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the best outcome for the community
- Show empathy towards other community members

---

## Getting Started

### Prerequisites
- Node.js >= 20
- Git
- TypeScript knowledge
- Solidity basics
- Understanding of blockchain concepts

### Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/chainsage-ai.git
cd chainsage-ai

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Run tests
npm test

# Build the project
npm run build
```

---

## Development Workflow

### Branch Naming Convention
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Message Format
```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Example:**
```
feat(cli): add explain command for transaction analysis

Implemented new command to analyze and explain transaction
behavior using AI reasoning engine.

Closes #123
```

---

## Coding Standards

### TypeScript
- Use strict mode
- Prefer interfaces over types for objects
- Use async/await over promises
- Document public APIs with JSDoc

```typescript
/**
 * Analyzes a smart contract using AI reasoning
 * @param address - Contract address on blockchain
 * @param options - Analysis configuration options
 * @returns Analysis result with insights
 */
async function analyzeContract(
  address: string,
  options: AnalysisOptions
): Promise<AnalysisResult> {
  // Implementation
}
```

### File Structure
- One class/interface per file
- Index files for module exports
- Group related functionality

### Naming Conventions
- Classes: `PascalCase`
- Functions/Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces: `PascalCase` (prefix with `I` if ambiguous)
- Types: `PascalCase`

---

## Testing Guidelines

### Unit Tests
- Test each function independently
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe('HardhatSimulator', () => {
  it('should compile valid Solidity contract', async () => {
    // Arrange
    const simulator = new HardhatSimulator();
    const contractPath = './contracts/SimpleToken.sol';
    
    // Act
    const result = await simulator.compile(contractPath);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.artifacts).toBeDefined();
  });
});
```

### Integration Tests
- Test module interactions
- Use test fixtures
- Mock external services

### Running Tests
```bash
# All tests
npm test

# Specific test file
npm test -- hardhat-simulator.test.ts

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

---

## Pull Request Process

### Before Submitting
1. ✅ Run tests: `npm test`
2. ✅ Run linter: `npm run lint`
3. ✅ Build successfully: `npm run build`
4. ✅ Update documentation if needed
5. ✅ Add/update tests for new features

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process
1. Automated CI checks must pass
2. At least one maintainer approval required
3. Address review feedback
4. Squash commits before merge

---

## Adding New Features

### New CLI Command
1. Add command handler in `src/cli/commands/`
2. Register in `src/cli/index.ts`
3. Add tests in `test/cli/`
4. Update README with usage example

### New LLM Provider
1. Implement `LLMProvider` interface
2. Add configuration in `src/utils/config.ts`
3. Update environment variables
4. Add integration test

### New Blockchain Network
1. Add network config in `hardhat.config.ts`
2. Update Blockscout client for chain-specific APIs
3. Add network to documentation
4. Test with sample contracts

---

## Documentation

### Code Documentation
- JSDoc for public APIs
- Inline comments for complex logic
- README for major modules

### User Documentation
- Update README.md for new features
- Add examples to docs/
- Update ARCHITECTURE.md for structural changes

---

## Questions?

- Open an issue for bugs
- Start a discussion for feature requests
- Join our Discord/Telegram for chat

---

**Thank you for contributing to ChainSage AI! 🚀**
