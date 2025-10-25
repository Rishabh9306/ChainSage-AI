'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🧠 ChainSage AI
        </h1>
        <p style={{ fontSize: '1.5rem', color: '#666' }}>
          AI-Powered Smart Contract Security Analysis
        </p>
        <p style={{ color: '#888', marginTop: '1rem' }}>
          Analyze any contract in 30 seconds • 8+ Chains • 100% Free
        </p>
      </header>

      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <Link 
          href="/analyze"
          style={{
            display: 'inline-block',
            padding: '1.25rem 3rem',
            fontSize: '1.25rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            marginRight: '1rem'
          }}
        >
          🚀 Analyze Contract
        </Link>
        <a 
          href="https://github.com/Rishabh9306/ChainSage-AI"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '1.25rem 3rem',
            fontSize: '1.25rem',
            background: '#24292e',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}
        >
          ⭐ View on GitHub
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <FeatureCard icon="⚡" title="30-Second Analysis" description="Get comprehensive security reports instantly" />
        <FeatureCard icon="🤖" title="AI-Powered" description="Detect vulnerabilities humans miss with Gemini AI" />
        <FeatureCard icon="🌍" title="Multi-Chain" description="Ethereum, Optimism, Base, Arbitrum & more" />
        <FeatureCard icon="💰" title="100% Free" description="Powered by Gemini's generous free tier" />
        <FeatureCard icon="🔧" title="Auto-Fix" description="AI generates Solidity code fixes" />
        <FeatureCard icon="⚙️" title="CI/CD Ready" description="GitHub Actions integration included" />
      </div>

      <div style={{ padding: '3rem', background: 'white', borderRadius: '16px', boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Quick Start</h2>
        <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '2rem', borderRadius: '12px', overflow: 'auto', fontSize: '0.95rem' }}>
{`# Install
npm install -g chainsage-ai

# Configure with your Gemini API key
npx chainsage config

# Analyze any contract
npx chainsage analyze 0xYourContract --network ethereum

# Batch analysis
npx chainsage batch contracts.txt

# Interactive mode
npx chainsage interactive`}
        </pre>
      </div>

      <footer style={{ marginTop: '4rem', textAlign: 'center', padding: '2rem', color: '#888' }}>
        <p>Built with ❤️ using Hardhat 3, Blockscout MCP, and Google Gemini AI</p>
        <p style={{ marginTop: '0.5rem' }}>
          <a href="https://github.com/Rishabh9306/ChainSage-AI" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none' }}>
            GitHub
          </a>
          {' • '}
          <a href="https://github.com/Rishabh9306/ChainSage-AI/blob/main/README.md" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none' }}>
            Documentation
          </a>
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div style={{ padding: '2rem', background: 'white', borderRadius: '16px', boxShadow: '0 2px 15px rgba(0,0,0,0.08)', transition: 'transform 0.2s' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>{title}</h3>
      <p style={{ color: '#666', margin: 0, lineHeight: '1.6' }}>{description}</p>
    </div>
  );
}
