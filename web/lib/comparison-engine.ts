import { ComparisonResult, ComparisonMetrics, Difference } from '../types';
import { logger } from '../utils/logger';

/**
 * Comparison Engine for analyzing differences between simulation and on-chain data
 */
export class ComparisonEngine {
  /**
   * Compare simulation results with on-chain data
   */
  public async compare(simData: any, onChainData: any): Promise<ComparisonResult> {
    logger.info('Starting comparison analysis');

    const gasDeviation = this.calculateGasDeviation(simData, onChainData);
    const eventMatch = this.compareEvents(simData, onChainData);
    const stateMatch = this.compareStateChanges(simData, onChainData);
    const executionDiffs = this.compareExecutionPaths(simData, onChainData);
    const reverts = this.detectUnexpectedReverts(simData, onChainData);

    // Calculate overall behavior match
    const behaviorMatch = this.calculateBehaviorMatch(
      gasDeviation,
      eventMatch,
      stateMatch,
      executionDiffs
    );

    return {
      functionBehaviorMatch: behaviorMatch,
      gasDeviation,
      eventStructureMatch: eventMatch,
      stateChangesMatch: stateMatch,
      executionPathDifferences: executionDiffs,
      unexpectedReverts: reverts,
      summary: this.generateSummary(behaviorMatch),
      recommendations: this.generateRecommendationsInternal(
        gasDeviation,
        eventMatch,
        stateMatch,
        executionDiffs
      ),
    };
  }

  /**
   * Calculate gas deviation percentage
   */
  private calculateGasDeviation(simData: any, onChainData: any): number {
    const simGas = parseFloat(simData.gasUsed?.toString() || '0');
    const chainGas = parseFloat(onChainData.gasUsed?.toString() || '0');

    if (chainGas === 0) return 0;

    const deviation = ((simGas - chainGas) / chainGas) * 100;
    return Math.round(deviation * 10) / 10;
  }

  /**
   * Compare event emissions
   */
  private compareEvents(simData: any, onChainData: any): boolean {
    const simEvents = simData.events || [];
    const chainEvents = onChainData.events || [];

    if (simEvents.length !== chainEvents.length) return false;

    // Compare event names and structures
    for (let i = 0; i < simEvents.length; i++) {
      if (simEvents[i].name !== chainEvents[i].name) return false;
    }

    return true;
  }

  /**
   * Compare state changes
   */
  private compareStateChanges(simData: any, onChainData: any): boolean {
    const simChanges = simData.stateChanges || [];
    const chainChanges = onChainData.stateChanges || [];

    return simChanges.length === chainChanges.length;
  }

  /**
   * Compare execution paths
   */
  private compareExecutionPaths(simData: any, onChainData: any): string[] {
    const differences: string[] = [];

    // Compare function calls
    if (simData.functionCalls !== onChainData.functionCalls) {
      differences.push('Different function call sequences detected');
    }

    // Compare revert status
    if (simData.reverted !== onChainData.reverted) {
      differences.push('Simulation and on-chain revert status differ');
    }

    return differences;
  }

  /**
   * Detect unexpected reverts
   */
  private detectUnexpectedReverts(simData: any, onChainData: any): any[] {
    const reverts: any[] = [];

    if (simData.reverted && !onChainData.reverted) {
      reverts.push({
        function: simData.function || 'unknown',
        reason: simData.revertReason || 'Unknown',
        expected: false,
        location: 'simulation',
      });
    }

    if (!simData.reverted && onChainData.reverted) {
      reverts.push({
        function: onChainData.function || 'unknown',
        reason: onChainData.revertReason || 'Unknown',
        expected: false,
        location: 'onchain',
      });
    }

    return reverts;
  }

  /**
   * Calculate overall behavior match percentage
   */
  private calculateBehaviorMatch(
    gasDeviation: number,
    eventMatch: boolean,
    stateMatch: boolean,
    executionDiffs: string[]
  ): number {
    let score = 100;

    // Deduct for gas deviation
    score -= Math.min(Math.abs(gasDeviation), 20);

    // Deduct for event mismatch
    if (!eventMatch) score -= 30;

    // Deduct for state change mismatch
    if (!stateMatch) score -= 20;

    // Deduct for execution path differences
    score -= Math.min(executionDiffs.length * 10, 30);

    return Math.max(0, Math.round(score));
  }

  /**
   * Generate summary
   */
  private generateSummary(behaviorMatch: number): string {
    if (behaviorMatch >= 95) {
      return 'Simulation closely matches on-chain behavior. Excellent consistency!';
    } else if (behaviorMatch >= 80) {
      return 'Simulation matches on-chain behavior with minor differences.';
    } else if (behaviorMatch >= 60) {
      return 'Simulation shows moderate differences from on-chain behavior. Review recommended.';
    } else {
      return 'Significant differences detected between simulation and on-chain behavior. Investigation required.';
    }
  }

  /**
   * Generate recommendations - Private helper
   */
  private generateRecommendationsInternal(
    gasDeviation: number,
    eventMatch: boolean,
    stateMatch: boolean,
    executionDiffs: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (Math.abs(gasDeviation) > 10) {
      recommendations.push(
        `Gas usage differs by ${Math.abs(gasDeviation).toFixed(1)}%. Consider updating Hardhat config to match deployment environment.`
      );
    }

    if (!eventMatch) {
      recommendations.push(
        'Event emissions differ between simulation and on-chain. Verify event parameters and conditions.'
      );
    }

    if (!stateMatch) {
      recommendations.push(
        'State changes differ. Review contract logic and initial state in tests.'
      );
    }

    if (executionDiffs.length > 0) {
      recommendations.push(
        'Execution paths diverge. This may indicate different contract states or external dependencies.'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'No significant issues detected. Your simulation is well-aligned with on-chain behavior.'
      );
    }

    return recommendations;
  }

  /**
   * Generate detailed diff report
   */
  public generateDetailedReport(simData: any, onChainData: any): ComparisonMetrics {
    const differences: Difference[] = [];

    // Calculate comparison metrics
    const gasDeviation = this.calculateGasDeviation(simData, onChainData);
    const eventMatch = this.compareEvents(simData, onChainData);
    const stateMatch = this.compareStateChanges(simData, onChainData);
    const executionDiffs = this.compareExecutionPaths(simData, onChainData);

    // Gas differences
    if (Math.abs(gasDeviation) > 5) {
      differences.push({
        type: 'gas',
        description: `Gas usage differs by ${gasDeviation.toFixed(1)}%`,
        severity: Math.abs(gasDeviation) > 20 ? 'high' : 'medium',
        simulation: simData.gasUsed,
        onchain: onChainData.gasUsed,
      });
    }

    // Event differences
    if (!this.compareEvents(simData, onChainData)) {
      differences.push({
        type: 'event',
        description: 'Event emissions do not match',
        severity: 'high',
        simulation: simData.events?.length || 0,
        onchain: onChainData.events?.length || 0,
      });
    }

    // State differences
    if (!this.compareStateChanges(simData, onChainData)) {
      differences.push({
        type: 'state',
        description: 'State changes differ',
        severity: 'medium',
        simulation: simData.stateChanges?.length || 0,
        onchain: onChainData.stateChanges?.length || 0,
      });
    }

    const similarity = this.calculateBehaviorMatch(
      gasDeviation,
      eventMatch,
      stateMatch,
      executionDiffs
    );

    return {
      similarity,
      differences,
      insights: this.generateRecommendationsInternal(
        gasDeviation,
        eventMatch,
        stateMatch,
        executionDiffs
      ),
    };
  }
}
