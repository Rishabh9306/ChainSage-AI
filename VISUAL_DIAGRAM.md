# ChainSage AI - Visual System Diagram

## 🏗️ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION LAYER                         │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │
│  │  chainsage      │  │  chainsage      │  │  chainsage      │       │
│  │  analyze        │  │  simulate       │  │  compare        │       │
│  │  <address>      │  │  <contract>     │  │  <address>      │       │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘       │
│           │                    │                     │                 │
└───────────┼────────────────────┼─────────────────────┼─────────────────┘
            │                    │                     │
            ▼                    ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLI COMMAND LAYER                               │
│                         (src/cli/index.ts)                              │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │   analyze    │  │   simulate   │  │   compare    │  │   explain  ││
│  │   command    │  │   command    │  │   command    │  │   command  ││
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘│
│         │                 │                  │                 │       │
└─────────┼─────────────────┼──────────────────┼─────────────────┼───────┘
          │                 │                  │                 │
          ▼                 ▼                  ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CORE ENGINE LAYER                                │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────┐ │
│  │ BlockscoutClient     │  │   AI Reasoner        │  │  Comparison  │ │
│  │ (blockscout-client)  │  │   (ai-reasoner)      │  │   Engine     │ │
│  │                      │  │                      │  │ (comparison- │ │
│  │ • getContract()      │  │ • analyzeContract()  │  │   engine)    │ │
│  │ • getTransactions()  │  │ • analyzeTransaction│  │              │ │
│  │ • getSourceCode()    │  │ • compareResults()   │  │ • compare()  │ │
│  │ • getTokenInfo()     │  │ • identifyRisks()    │  │ • calculate  │ │
│  │ • getBalance()       │  │ • suggestOptimize()  │  │   Deviation  │ │
│  └──────────┬───────────┘  └──────────┬───────────┘  └──────┬───────┘ │
│             │                         │                      │         │
└─────────────┼─────────────────────────┼──────────────────────┼─────────┘
              │                         │                      │
              ▼                         ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        UTILITY LAYER                                    │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │   Config    │  │   Logger    │  │   Cache     │  │    Types     │ │
│  │  Manager    │  │  (winston)  │  │  Manager    │  │ (TypeScript) │ │
│  │             │  │             │  │             │  │              │ │
│  │ • networks  │  │ • info()    │  │ • get()     │  │ • Contract   │ │
│  │ • llm       │  │ • error()   │  │ • set()     │  │ • Transaction│ │
│  │ • validate()│  │ • debug()   │  │ • clear()   │  │ • Analysis   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
              │                         │                      │
              ▼                         ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES LAYER                              │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐ │
│  │  Blockscout MCP  │  │  OpenAI API      │  │   Ethereum RPC       │ │
│  │                  │  │  (or Ollama)     │  │   Providers          │ │
│  │ • Contract data  │  │                  │  │                      │ │
│  │ • Transactions   │  │ • GPT-4          │  │ • Alchemy            │ │
│  │ • Token info     │  │ • Claude         │  │ • Infura             │ │
│  │ • Source code    │  │ • DeepSeek       │  │ • Public RPCs        │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Examples

### Example 1: Analyzing a Contract

```
User Input:
npx chainsage analyze 0xUSDC --network mainnet
         │
         ▼
┌────────────────────┐
│   CLI Parser       │  Parse command & options
│   (Commander.js)   │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Analyze Command    │  Validate address & network
│ Handler            │
└─────────┬──────────┘
          │
          ├─────────────────────┐
          ▼                     ▼
┌──────────────────┐   ┌──────────────────┐
│ BlockscoutClient │   │  Config Manager  │
│                  │   │                  │
│ Fetch:           │   │ Get:             │
│ • Contract info  │   │ • Network RPC    │
│ • Transactions   │   │ • API keys       │
│ • Source code    │   │ • Settings       │
└─────────┬────────┘   └──────────────────┘
          │
          ▼
┌────────────────────┐
│   Cache Check      │  Check if cached
│                    │
└─────────┬──────────┘
          │ (if not cached)
          ▼
┌────────────────────┐
│  Blockscout API    │  Fetch from blockchain
│  Request           │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│   AI Reasoner      │  Analyze with LLM
│                    │
│ • Build prompt     │
│ • Call OpenAI API  │
│ • Parse response   │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Format & Display  │  Beautiful CLI output
│  (Chalk + Ora)     │
└─────────┬──────────┘
          │
          ▼
        USER
  ┌─────────────────┐
  │ Security: 85/100│
  │ Risks: 2        │
  │ Insights: ...   │
  └─────────────────┘
```

### Example 2: Comparing Simulation vs Reality

```
User Input:
npx chainsage compare 0xDeployed --network sepolia
         │
         ▼
┌────────────────────────┐
│   Compare Command      │
└───────────┬────────────┘
            │
     ┌──────┴──────┐
     ▼             ▼
┌─────────┐   ┌─────────────┐
│ Hardhat │   │ Blockscout  │
│ Local   │   │ On-Chain    │
│ Data    │   │ Data        │
└────┬────┘   └──────┬──────┘
     │               │
     └───────┬───────┘
             ▼
    ┌──────────────────┐
    │ Comparison Engine│
    │                  │
    │ Calculate:       │
    │ • Gas deviation  │
    │ • Event match    │
    │ • State match    │
    │ • Execution diff │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │   AI Reasoner    │
    │                  │
    │ Generate:        │
    │ • Summary        │
    │ • Insights       │
    │ • Recommendations│
    └────────┬─────────┘
             │
             ▼
          USER
  ┌──────────────────────┐
  │ Match: 94%           │
  │ Gas Deviation: +8.3% │
  │ Recommendations: ... │
  └──────────────────────┘
```

## 📊 Component Interaction Matrix

```
┌─────────────────┬──────────┬──────────┬──────────┬──────────┐
│                 │ Blocksc. │    AI    │  Compare │  Config  │
├─────────────────┼──────────┼──────────┼──────────┼──────────┤
│ CLI Commands    │    ✓     │    ✓     │    ✓     │    ✓     │
│ Blockscout      │    -     │    ✗     │    ✗     │    ✓     │
│ AI Reasoner     │    ✗     │    -     │    ✗     │    ✓     │
│ Comparison      │    ✗     │    ✓     │    -     │    ✓     │
│ Config Manager  │    ✗     │    ✗     │    ✗     │    -     │
│ Logger          │    ✓     │    ✓     │    ✓     │    ✓     │
│ Cache           │    ✓     │    ✗     │    ✗     │    ✗     │
└─────────────────┴──────────┴──────────┴──────────┴──────────┘

Legend:
✓ = Direct dependency
✗ = No dependency
- = Self
```

## 🎨 Feature Map

```
ChainSage AI
│
├── 🔍 Analysis Features
│   ├── Contract Analysis
│   │   ├── Metadata extraction
│   │   ├── Function discovery
│   │   ├── Transaction history
│   │   └── AI interpretation
│   │
│   ├── Transaction Explanation
│   │   ├── Value flow tracing
│   │   ├── Function call detection
│   │   ├── Intent identification
│   │   └── Natural language summary
│   │
│   └── Security Assessment
│       ├── Risk identification
│       ├── Severity classification
│       ├── Vulnerability detection
│       └── Recommendations
│
├── 🧪 Simulation Features
│   ├── Local Deployment
│   │   ├── Hardhat 3 integration
│   │   ├── Multi-chain support
│   │   └── Network forking
│   │
│   ├── Testing
│   │   ├── Automated test execution
│   │   ├── Gas profiling
│   │   └── Coverage reports
│   │
│   └── Tracing
│       ├── Execution traces
│       ├── Event monitoring
│       └── State tracking
│
├── 🔄 Comparison Features
│   ├── Diff Analysis
│   │   ├── Gas comparison
│   │   ├── Event matching
│   │   ├── State verification
│   │   └── Execution path analysis
│   │
│   ├── Metrics
│   │   ├── Behavior match %
│   │   ├── Deviation calculation
│   │   └── Similarity scoring
│   │
│   └── Reporting
│       ├── Summary generation
│       ├── Insight extraction
│       └── Recommendations
│
└── 🛠️ Infrastructure
    ├── Configuration
    │   ├── Multi-network support
    │   ├── LLM provider switching
    │   └── Environment management
    │
    ├── Caching
    │   ├── Response caching
    │   ├── TTL management
    │   └── Memory optimization
    │
    └── Logging
        ├── Debug tracing
        ├── Error tracking
        └── Audit trails
```

## 🎯 Technology Stack Visualization

```
┌─────────────────────────────────────────────────────┐
│                  PRESENTATION                       │
│                                                     │
│   ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │
│   │ Commander.js│  │    Chalk    │  │   Ora    │  │
│   │   (CLI)     │  │   (Colors)  │  │(Spinners)│  │
│   └─────────────┘  └─────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC                    │
│                                                     │
│   ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │
│   │ Blockscout  │  │ AI Reasoner │  │Comparison│  │
│   │   Client    │  │   Engine    │  │  Engine  │  │
│   └─────────────┘  └─────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                    UTILITIES                        │
│                                                     │
│   ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │
│   │   Config    │  │   Logger    │  │  Cache   │  │
│   │  Manager    │  │  (Winston)  │  │ Manager  │  │
│   └─────────────┘  └─────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE                      │
│                                                     │
│   ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │
│   │ TypeScript  │  │   Ethers    │  │  Axios   │  │
│   │   Node.js   │  │  Hardhat 3  │  │  MCP SDK │  │
│   └─────────────┘  └─────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
```

---

**This visual guide shows how all components of ChainSage AI work together to deliver AI-powered blockchain intelligence!**
