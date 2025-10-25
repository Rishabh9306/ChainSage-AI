import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { address, network } = await request.json();

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid contract address' },
        { status: 400 }
      );
    }

    // Use the local ChainSage CLI instead of npm package
    const projectRoot = path.resolve(process.cwd(), '..');
    const command = `node ${projectRoot}/dist/cli/index.js analyze ${address} --network ${network}`;
    
    const { stdout, stderr } = await execPromise(command, {
      timeout: 120000, // 2 minutes timeout
      cwd: projectRoot,
      env: { ...process.env }
    });

    const output = stdout + stderr;

    // Strip ANSI color codes
    const cleanOutput = stripAnsiCodes(output);

    // Try to extract JSON from the output
    // Look for JSON between ```json and ``` markers first
    let jsonMatch = cleanOutput.match(/```json\s*([\s\S]*?)\s*```/);
    let parsedData: any = null;
    
    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error('Failed to parse JSON from code block:', e);
      }
    }
    
    // If no code block, try to find raw JSON object
    if (!parsedData) {
      // Find the first { and last } that contains "summary"
      const firstBrace = cleanOutput.indexOf('{');
      const summaryPos = cleanOutput.indexOf('"summary"');
      
      if (firstBrace !== -1 && summaryPos !== -1 && firstBrace < summaryPos) {
        // Find matching closing brace
        let braceCount = 0;
        let startPos = firstBrace;
        let endPos = -1;
        
        for (let i = startPos; i < cleanOutput.length; i++) {
          if (cleanOutput[i] === '{') braceCount++;
          if (cleanOutput[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              endPos = i + 1;
              break;
            }
          }
        }
        
        if (endPos !== -1) {
          try {
            const jsonStr = cleanOutput.substring(startPos, endPos);
            parsedData = JSON.parse(jsonStr);
          } catch (e) {
            console.error('Failed to parse extracted JSON:', e);
          }
        }
      }
    }

    // Parse the output to extract key information
    const securityScore = parsedData?.securityScore || extractSecurityScore(cleanOutput);
    const vulnerabilities = parsedData?.risks || extractVulnerabilities(cleanOutput);
    const summary = parsedData?.summary || extractSummary(cleanOutput);
    const functionality = parsedData?.functionality || [];
    const optimizations = parsedData?.optimizations || [];

    return NextResponse.json({
      success: true,
      securityScore,
      vulnerabilities,
      summary,
      functionality,
      optimizations,
      rawOutput: cleanOutput
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}

function stripAnsiCodes(str: string): string {
  // Remove ANSI escape codes (color codes)
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function extractSecurityScore(output: string): number {
  const match = output.match(/Security Score:\s*(\d+)/i);
  return match ? parseInt(match[1]) : 50;
}

function extractVulnerabilities(output: string): any[] {
  const vulns: any[] = [];
  const lines = output.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('CRITICAL') || line.includes('HIGH') || line.includes('MEDIUM')) {
      vulns.push({
        severity: line.includes('CRITICAL') ? 'CRITICAL' : line.includes('HIGH') ? 'HIGH' : 'MEDIUM',
        title: line.trim(),
        description: lines[i + 1]?.trim() || ''
      });
    }
  }
  
  return vulns;
}

function extractSummary(output: string): string {
  const summaryMatch = output.match(/Summary:(.*?)(?=\n\n|\nVulnerabilities:|\nSecurity Score:|$)/is);
  return summaryMatch ? summaryMatch[1].trim() : 'Analysis complete. See full report below.';
}
