import { NextRequest, NextResponse } from 'next/server';

// Import ChainSage core modules directly instead of using CLI
import { BlockscoutClient } from '../../../lib/blockscout-client';
import { AIReasoner } from '../../../lib/ai-reasoner';
import { ContractAnalyzer } from '../../../lib/contract-analyzer';

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

    const blockscoutClient = new BlockscoutClient();
    const aiReasoner = new AIReasoner(geminiApiKey, 'gemini');
    const analyzer = new ContractAnalyzer(blockscoutClient, aiReasoner);

    // Perform analysis
    const result = await analyzer.analyze(address, network);

    // Extract data from result
    const securityScore = result.securityScore || 50;
    const vulnerabilities = result.risks || [];
    const summary = result.summary || 'Analysis complete.';
    const functionality = result.functionality || [];
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
