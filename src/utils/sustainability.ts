/**
 * Sustainability Metrics Utility
 * 
 * Tracks energy consumption, carbon footprint, and resource usage.
 * Helps measure and optimize the environmental impact of the application.
 */

export interface SustainabilityMetrics {
  pageLoads: number
  dataTransferred: number // bytes
  apiCalls: number
  cacheHits: number
  cacheMisses: number
  estimatedCarbonFootprint: number // grams CO2
  estimatedEnergyConsumption: number // kWh
}

class SustainabilityTracker {
  private metrics: SustainabilityMetrics = {
    pageLoads: 0,
    dataTransferred: 0,
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    estimatedCarbonFootprint: 0,
    estimatedEnergyConsumption: 0,
  }

  /**
   * Track page load
   */
  trackPageLoad(): void {
    this.metrics.pageLoads++
    this.updateEstimates()
  }

  /**
   * Track data transfer
   */
  trackDataTransfer(bytes: number): void {
    this.metrics.dataTransferred += bytes
    this.updateEstimates()
  }

  /**
   * Track API call
   */
  trackApiCall(): void {
    this.metrics.apiCalls++
  }

  /**
   * Track cache hit
   */
  trackCacheHit(): void {
    this.metrics.cacheHits++
  }

  /**
   * Track cache miss
   */
  trackCacheMiss(): void {
    this.metrics.cacheMisses++
  }

  /**
   * Calculate estimated carbon footprint
   * Based on average: 0.02g CO2 per MB transferred
   */
  private updateEstimates(): void {
    const mbTransferred = this.metrics.dataTransferred / (1024 * 1024)
    this.metrics.estimatedCarbonFootprint = mbTransferred * 0.02

    // Estimate energy consumption (rough: 0.0001 kWh per MB)
    this.metrics.estimatedEnergyConsumption = mbTransferred * 0.0001
  }

  /**
   * Get current metrics
   */
  getMetrics(): SustainabilityMetrics {
    return { ...this.metrics }
  }

  /**
   * Get cache efficiency
   */
  getCacheEfficiency(): number {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses
    if (total === 0) return 0
    return (this.metrics.cacheHits / total) * 100
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      pageLoads: 0,
      dataTransferred: 0,
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      estimatedCarbonFootprint: 0,
      estimatedEnergyConsumption: 0,
    }
  }

  /**
   * Get formatted report
   */
  getReport(): string {
    const efficiency = this.getCacheEfficiency()
    return `
Sustainability Report:
- Page Loads: ${this.metrics.pageLoads}
- Data Transferred: ${(this.metrics.dataTransferred / (1024 * 1024)).toFixed(2)} MB
- API Calls: ${this.metrics.apiCalls}
- Cache Efficiency: ${efficiency.toFixed(1)}%
- Estimated Carbon Footprint: ${this.metrics.estimatedCarbonFootprint.toFixed(4)}g CO2
- Estimated Energy Consumption: ${this.metrics.estimatedEnergyConsumption.toFixed(6)} kWh
    `.trim()
  }
}

export const sustainabilityTracker = new SustainabilityTracker()

// Track initial page load - only if window is available
// Note: trackPageLoad() should be called explicitly from main.tsx
// We don't intercept fetch here to avoid potential issues
