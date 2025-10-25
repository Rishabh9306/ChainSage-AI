'use client';

import { useState } from 'react';
import axios from 'axios';

export default function AnalyzePage() {
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('ethereum');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const simulateProgress = () => {
    setProgress(0);
    setProgressMessage('Initializing analysis...');
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setProgressMessage('Finalizing results...');
          return 90;
        }
        
        // Update message based on progress
        if (prev < 20) setProgressMessage('Fetching contract data...');
        else if (prev < 40) setProgressMessage('Analyzing bytecode...');
        else if (prev < 60) setProgressMessage('Running AI security checks...');
        else if (prev < 80) setProgressMessage('Identifying vulnerabilities...');
        else setProgressMessage('Generating report...');
        
        return prev + 2;
      });
    }, 200);
    
    return interval;
  };

  const handleAnalyze = async () => {
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Please enter a valid Ethereum address (0x...)');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    
    const progressInterval = simulateProgress();

    try {
      const response = await axios.post('/api/analyze', { address, network });
      clearInterval(progressInterval);
      setProgress(100);
      setProgressMessage('Analysis complete!');
      
      // Small delay to show 100%
      setTimeout(() => {
        setResults(response.data);
        setLoading(false);
      }, 500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setLoading(false);
      setProgress(0);
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    }
  };

  const renderRawOutput = (output: string) => {
    // Remove any remaining ANSI codes
    const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, '');
    
    // Try to extract and parse JSON
    const jsonMatch = cleanOutput.match(/```json\s*([\s\S]*?)\s*```/) || 
                     cleanOutput.match(/\{[\s\S]*"summary"[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        return (
          <div style={{
            marginTop: '1rem',
            padding: '1.5rem',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {/* Summary */}
            {parsed.summary && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#667eea', marginBottom: '0.75rem', fontSize: '1.1rem' }}>📋 Summary</h4>
                <p style={{ lineHeight: '1.8', color: '#444' }}>{parsed.summary}</p>
              </div>
            )}
            
            {/* Functionality */}
            {parsed.functionality && parsed.functionality.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#667eea', marginBottom: '0.75rem', fontSize: '1.1rem' }}>⚙️ Functionality</h4>
                <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                  {parsed.functionality.map((item: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: '0.5rem', color: '#444' }}>
                      {item.replace(/^\*\*|\*\*$/g, '')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Risks */}
            {parsed.risks && parsed.risks.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#667eea', marginBottom: '0.75rem', fontSize: '1.1rem' }}>🚨 Security Risks</h4>
                {parsed.risks.map((risk: any, idx: number) => (
                  <div 
                    key={idx} 
                    style={{ 
                      marginBottom: '1rem', 
                      padding: '1rem', 
                      background: risk.severity === 'critical' ? '#ffebee' : 
                                 risk.severity === 'high' ? '#fff3e0' : 
                                 risk.severity === 'medium' ? '#fff8e1' : '#f1f8e9',
                      borderLeft: `4px solid ${
                        risk.severity === 'critical' ? '#d32f2f' :
                        risk.severity === 'high' ? '#f57c00' :
                        risk.severity === 'medium' ? '#ffa726' : '#9ccc65'
                      }`,
                      borderRadius: '4px'
                    }}
                  >
                    <div style={{ 
                      fontWeight: 'bold', 
                      marginBottom: '0.5rem',
                      color: risk.severity === 'critical' ? '#d32f2f' :
                             risk.severity === 'high' ? '#f57c00' :
                             risk.severity === 'medium' ? '#ffa726' : '#9ccc65',
                      textTransform: 'uppercase',
                      fontSize: '0.85rem'
                    }}>
                      {risk.severity} - {risk.category}
                    </div>
                    <p style={{ marginBottom: '0.5rem', color: '#444', lineHeight: '1.6' }}>
                      {risk.description}
                    </p>
                    <div style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
                      💡 {risk.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Optimizations */}
            {parsed.optimizations && parsed.optimizations.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#667eea', marginBottom: '0.75rem', fontSize: '1.1rem' }}>⚡ Gas Optimizations</h4>
                {parsed.optimizations.map((opt: any, idx: number) => (
                  <div 
                    key={idx} 
                    style={{ 
                      marginBottom: '1rem', 
                      padding: '1rem', 
                      background: '#e8f5e9',
                      borderLeft: '4px solid #4caf50',
                      borderRadius: '4px'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#2e7d32' }}>
                      {opt.category}
                    </div>
                    <p style={{ marginBottom: '0.5rem', color: '#444', lineHeight: '1.6' }}>
                      {opt.description}
                    </p>
                    {opt.implementation && (
                      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                        <strong>Implementation:</strong> {opt.implementation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Behavior Insights */}
            {parsed.behaviorInsights && parsed.behaviorInsights.length > 0 && (
              <div>
                <h4 style={{ color: '#667eea', marginBottom: '0.75rem', fontSize: '1.1rem' }}>📊 Behavior Insights</h4>
                <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                  {parsed.behaviorInsights.map((insight: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: '0.5rem', color: '#444' }}>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
    }
    
    // Fallback: display as formatted text (cleaned)
    const lines = cleanOutput
      .split('\n')
      .filter(line => 
        !line.includes('info:') && 
        !line.includes('error:') && 
        !line.includes('warn:') &&
        !line.includes('{"timestamp"') &&
        line.trim().length > 0
      );
      
    return (
      <div style={{
        marginTop: '1rem',
        padding: '1.5rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '0.95rem',
        lineHeight: '1.8',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {lines.map((line, idx) => {
          const isSectionHeader = line.startsWith('═') || line.includes('CONTRACT ANALYSIS');
          const isImportant = line.includes('Security Score') || line.includes('Contract:');
          
          if (isSectionHeader) {
            return <div key={idx} style={{ color: '#667eea', fontWeight: 'bold', margin: '1rem 0' }}>{line}</div>;
          }
          
          if (isImportant) {
            return <div key={idx} style={{ fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>{line}</div>;
          }
          
          return <div key={idx} style={{ color: '#555', marginBottom: '0.25rem' }}>{line}</div>;
        })}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
        🔍 Analyze Smart Contract
      </h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '3rem' }}>
        Enter a contract address to get AI-powered security analysis
      </p>

      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 2px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
            Contract Address
          </label>
          <input
            type="text"
            placeholder="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              boxSizing: 'border-box'
            }}
          />
          <small style={{ color: '#999', fontSize: '0.875rem' }}>
            Example: USDC Token - 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
          </small>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
            Network
          </label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              boxSizing: 'border-box',
              background: 'white'
            }}
          >
            <option value="ethereum">Ethereum Mainnet</option>
            <option value="optimism">Optimism</option>
            <option value="base">Base</option>
            <option value="arbitrum">Arbitrum</option>
            <option value="polygon">Polygon</option>
            <option value="gnosis">Gnosis Chain</option>
            <option value="scroll">Scroll</option>
            <option value="zksync">zkSync Era</option>
          </select>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: '#fee', border: '2px solid #fcc', borderRadius: '8px', color: '#c00', marginBottom: '1.5rem' }}>
            ❌ {error}
          </div>
        )}

        {loading && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#667eea' }}>{progressMessage}</span>
              <span style={{ fontSize: '0.875rem', color: '#999' }}>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${progress}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            width: '100%',
            padding: '1.25rem',
            fontSize: '1.125rem',
            fontWeight: 'bold',
            color: 'white',
            background: loading ? '#999' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
        >
          {loading ? `⏳ Analyzing... ${progress}%` : '🚀 Analyze Contract'}
        </button>
      </div>

      {results && (
        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📊</span> Analysis Results
          </h2>

          {results.securityScore !== undefined && (
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ 
                fontSize: '3.5rem', 
                fontWeight: 'bold', 
                color: results.securityScore > 80 ? '#4caf50' : results.securityScore > 50 ? '#ff9800' : '#f44336',
                marginBottom: '0.5rem'
              }}>
                {results.securityScore}/100
              </div>
              <div style={{ fontSize: '1.25rem', color: '#666' }}>Security Score</div>
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.5rem 1rem', 
                background: results.securityScore > 80 ? '#e8f5e9' : results.securityScore > 50 ? '#fff3e0' : '#ffebee',
                color: results.securityScore > 80 ? '#2e7d32' : results.securityScore > 50 ? '#e65100' : '#c62828',
                borderRadius: '20px',
                display: 'inline-block',
                fontWeight: 'bold'
              }}>
                {results.securityScore > 80 ? '✅ Low Risk' : results.securityScore > 50 ? '⚠️ Medium Risk' : '🚨 High Risk'}
              </div>
            </div>
          )}

          {results.vulnerabilities && results.vulnerabilities.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#f44336', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🚨</span> Security Risks Found ({results.vulnerabilities.length})
              </h3>
              {results.vulnerabilities.map((vuln: any, idx: number) => (
                <div key={idx} style={{ 
                  padding: '1.25rem', 
                  background: vuln.severity === 'critical' ? '#ffebee' : 
                             vuln.severity === 'high' ? '#fff3e0' : '#fff8e1',
                  border: `2px solid ${
                    vuln.severity === 'critical' ? '#f44336' :
                    vuln.severity === 'high' ? '#ff9800' : '#ffc107'
                  }`,
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  borderLeft: `4px solid ${
                    vuln.severity === 'critical' ? '#d32f2f' :
                    vuln.severity === 'high' ? '#f57c00' : '#ffa726'
                  }`
                }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '0.5rem', 
                    fontSize: '1.1rem', 
                    color: vuln.severity === 'critical' ? '#d32f2f' :
                           vuln.severity === 'high' ? '#f57c00' : '#ffa726',
                    textTransform: 'uppercase'
                  }}>
                    {vuln.severity}: {vuln.category || vuln.title}
                  </div>
                  <div style={{ color: '#666', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                    {vuln.description}
                  </div>
                  {vuln.recommendation && (
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#555', 
                      background: 'rgba(255,255,255,0.7)', 
                      padding: '0.75rem', 
                      borderRadius: '4px',
                      fontStyle: 'italic'
                    }}>
                      💡 <strong>Recommendation:</strong> {vuln.recommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {results.functionality && results.functionality.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#667eea', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚙️</span> Key Functionality
              </h3>
              <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                {results.functionality.map((item: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '0.75rem', color: '#444' }}>
                    {item.replace(/^\*\*|\*\*$/g, '')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.optimizations && results.optimizations.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚡</span> Gas Optimizations
              </h3>
              {results.optimizations.map((opt: any, idx: number) => (
                <div key={idx} style={{ 
                  padding: '1.25rem', 
                  background: '#e8f5e9', 
                  borderLeft: '4px solid #4caf50',
                  borderRadius: '8px', 
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.05rem', color: '#2e7d32' }}>
                    {opt.category}
                  </div>
                  <div style={{ color: '#555', lineHeight: '1.6', marginBottom: '0.5rem' }}>
                    {opt.description}
                  </div>
                  {opt.implementation && (
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                      <strong>Implementation:</strong> {opt.implementation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {results.summary && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0f4ff', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🤖</span> AI Summary
              </h3>
              <p style={{ lineHeight: '1.8', color: '#444', whiteSpace: 'pre-wrap' }}>{results.summary}</p>
            </div>
          )}

          {results.rawOutput && (
            <details style={{ marginTop: '2rem' }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                padding: '1rem', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>🔍</span> View Full Report
              </summary>
              {renderRawOutput(results.rawOutput)}
            </details>
          )}
        </div>
      )}
    </div>
  );
}
