import { NextRequest, NextResponse } from 'next/server';

// Import ChainSage core modules directly
import { BlockscoutClient } from '../../../lib/blockscout-client';
import { AIReasoner } from '../../../lib/ai-reasoner';

export async function POST(request: NextRequest) {
  try {
    const { address, network = 'ethereum' } = await request.json();

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid contract address' },
        { status: 400 }
      );
    }

    // Initialize services
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Set environment variable for config
    process.env.GEMINI_API_KEY = geminiApiKey;
    process.env.GEMINI_MODEL = 'gemini-2.5-flash-preview-05-20';
    process.env.LLM_PROVIDER = 'gemini';

    const blockscoutClient = new BlockscoutClient();
    const aiReasoner = new AIReasoner();

    // Fetch contract info
    const contractInfo = await blockscoutClient.getContract(address, network);
    const transactions = await blockscoutClient.getTransactions(address, network);

    // Use AIReasoner's analyzeContract method
    const result = await aiReasoner.analyzeContract({
      address,
      network,
      name: contractInfo.name,
      verified: contractInfo.verified,
      sourceCode: contractInfo.sourceCode,
      abi: contractInfo.abi,
      compilerVersion: contractInfo.compilerVersion,
      transactions: transactions.slice(0, 10) // Limit to 10 recent transactions
    });

    // Extract data from result
    const securityScore = result.securityScore || 50;
    const vulnerabilities = result.risks || [];
    const summary = result.summary || 'Analysis complete.';
    const functionality = result.keyFeatures || [];
    const optimizations = result.optimizations || [];

    return NextResponse.json({
      success: true,
      securityScore,
      vulnerabilities,
      summary,
      functionality,
      optimizations,
      rawOutput: JSON.stringify(result, null, 2)
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
