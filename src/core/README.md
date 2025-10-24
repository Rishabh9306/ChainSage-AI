# Comparison Engine

The Comparison Engine analyzes differences between simulated contract behavior (Hardhat) and real on-chain execution (Blockscout).

## Features

- Gas usage comparison
- Event emission analysis
- State change detection
- Execution path tracing
- Bytecode diff analysis

## Usage

```typescript
import { ComparisonEngine } from './comparison-engine';

const engine = new ComparisonEngine();
const result = await engine.compare(simulationData, onChainData);

console.log(`Match: ${result.functionBehaviorMatch}%`);
console.log(`Gas deviation: ${result.gasDeviation}%`);
```

## Metrics

- **Function Behavior Match**: 0-100% similarity
- **Gas Deviation**: Percentage difference
- **Event Structure Match**: Boolean match
- **State Changes Match**: Boolean match
- **Execution Path Differences**: Array of differences
