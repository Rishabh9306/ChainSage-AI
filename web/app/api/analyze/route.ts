import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { address, network } = await request.json();

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid contract address' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const networkMap: Record<string, string> = {
      ethereum: 'eth.blockscout.com',
      sepolia: 'eth-sepolia.blockscout.com',
      base: 'base.blockscout.com',
      optimism: 'optimism.blockscout.com',
      arbitrum: 'arbitrum.blockscout.com',
      polygon: 'polygon.blockscout.com',
    };

    const blockscoutUrl = networkMap[network] || 'eth.blockscout.com';
    let contractInfo: any = {};
    
    try {
      const response = await axios.get(\`https://\${blockscoutUrl}/api/v2/smart-contracts/\${address}\`, {
        timeout: 10000
      });
      contractInfo = response.data;
    } catch (error) {
      console.warn('Failed to fetch contract info, using fallback');
      contractInfo = {
        name: address.substring(0, 10) + '...',
        is_verified: false
      };
    }

    const prompt = \`Analyze this Ethereum smart contract at address \${address} on \${network} network.

Contract Name: \${contractInfo.name || 'Unknown'}
Verified: \${contractInfo.is_verified ? 'Yes' : 'No'}
\${contractInfo.source_code ? \`\\nSource Code:\\n\${contractInfo.source_code.substring(0, 5000)}\` : ''}
\${contractInfo.abi ? \`\\nABI Functions: \${JSON.stringify(contractInfo.abi.slice(0, 10))}\` : ''}

Provide a comprehensive security analysis in JSON format with:
{
  "summary": "Brief overview",
  "functionality": ["List of main functions"],
  "risks": [{"severity": "critical|high|medium|low", "category": "type", "description": "issue", "recommendation": "fix"}],
  "optimizations": [{"category": "type", "description": "optimization", "implementation": "how to"}],
  "behaviorInsights": ["observations"],
  "securityScore": 0-100
}\`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const output = response.text();

    let parsedData: any = null;
    const jsonMatch = output.match(/\`\`\`json\\s*([\\s\\S]*?)\\s*\`\`\`/) || 
                     output.match(/\\{[\\s\\S]*"summary"[\\s\\S]*\\}/);
    
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        parsedData = JSON.parse(jsonStr);
      } catch (e) {
        console.error('Failed to parse AI response as JSON:', e);
      }
    }
    
    if (!parsedData) {
      parsedData = {
        summary: output.substring(0, 500),
        securityScore: 50,
        risks: [],
        functionality: [],
        optimizations: []
      };
    }

    return NextResponse.json({
      success: true,
      securityScore: parsedData.securityScore || 50,
      vulnerabilities: parsedData.risks || [],
      summary: parsedData.summary || 'Analysis complete',
      functionality: parsedData.functionality || [],
      optimizations: parsedData.optimizations || [],
      rawOutput: output
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
