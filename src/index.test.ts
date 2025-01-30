import { describe, it, expect } from "vitest";
import { calculateThrottlePercent } from "./index";

describe("calculateThrottlePercent", () => {
  it("should return 0 when current value is at or below warning threshold", () => {
    expect(calculateThrottlePercent(50, 50, 100)).toBe(0);
    expect(calculateThrottlePercent(40, 50, 100)).toBe(0);
  });

  it("should return 1 when current value is at or above emergency threshold", () => {
    expect(calculateThrottlePercent(100, 50, 100)).toBe(1);
    expect(calculateThrottlePercent(110, 50, 100)).toBe(1);
  });

  it("should return values between 0 and 1 for values between thresholds", () => {
    const result = calculateThrottlePercent(75, 50, 100);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });

  it("should respect the curve parameter", () => {
    // Test with different curves
    const resultDefaultCurve = calculateThrottlePercent(75, 50, 100);
    const resultHigherCurve = calculateThrottlePercent(75, 50, 100, 8);

    // Higher curve should result in a more aggressive throttle
    expect(resultHigherCurve).toBeGreaterThan(resultDefaultCurve);
  });

  it("should handle values at midpoint correctly", () => {
    // At midpoint (75 in this case), with default curve
    const result = calculateThrottlePercent(75, 50, 100);
    // Expected value can be calculated: 1 - Math.exp(-4 * 0.5) ≈ 0.865
    expect(result).toBeCloseTo(0.865, 3);
  });
});
