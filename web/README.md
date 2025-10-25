# ChainSage AI Web Dashboard

Modern Next.js web interface for ChainSage AI smart contract security analysis.

## Features

- 🎨 Clean, modern UI with gradient styling
- 📱 Responsive design for all devices
- ⚡ Real-time contract analysis
- 🌍 Support for 8+ blockchain networks
- 📊 Visual security score display
- 🚨 Detailed vulnerability reports

## Prerequisites

- Node.js 18+ installed
- ChainSage AI CLI installed globally (`npm install -g chainsage-ai`)
- Gemini API key configured (`npx chainsage config`)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The dashboard will be available at http://localhost:3000

## Usage

1. Navigate to the homepage
2. Click "Analyze Contract" button
3. Enter a contract address (e.g., 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48)
4. Select the blockchain network
5. Click "Analyze Contract" to get results

## Architecture

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Styling**: Inline styles with gradient themes
- **API**: Next.js API routes that execute ChainSage CLI
- **HTTP Client**: Axios for API requests

## Project Structure

```
web/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Homepage with features
│   ├── analyze/
│   │   └── page.tsx        # Analysis form and results
│   └── api/
│       └── analyze/
│           └── route.ts    # Backend API that runs ChainSage
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md
```

## Networks Supported

- Ethereum Mainnet
- Optimism
- Base
- Arbitrum
- Polygon
- Gnosis Chain
- Scroll
- zkSync Era

## Environment Variables

No environment variables needed - ChainSage uses its global configuration from `~/.chainsage/config.json`.

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel deploy
```

### Docker

```bash
docker build -t chainsage-web .
docker run -p 3000:3000 chainsage-web
```

### Traditional Hosting

```bash
npm run build
npm start
```

## Troubleshooting

**Analysis fails:**
- Ensure ChainSage CLI is installed globally
- Check Gemini API key is configured: `npx chainsage config`
- Verify the contract address is valid

**Timeout errors:**
- Increase timeout in `app/api/analyze/route.ts` (default: 2 minutes)
- Check network connectivity

## License

MIT - See main project LICENSE file
