import { AllocationEngine, WEIGHT_DISTANCE, WEIGHT_ZONE_CONGESTION, WEIGHT_TYPE_MATCH } from '../../src/services/allocationEngine';

describe('Allocation Engine Scoring', () => {
  it('should identify compatible slots correctly', () => {
    expect(AllocationEngine.isCompatible('TRUCK', 'NORMAL')).toBe(false);
    expect(AllocationEngine.isCompatible('TRUCK', 'HEAVY')).toBe(true);

    expect(AllocationEngine.isCompatible('TWO_WHEELER', 'NORMAL')).toBe(true);
    expect(AllocationEngine.isCompatible('TWO_WHEELER', 'EV')).toBe(false);
    
    expect(AllocationEngine.isCompatible('CAR', 'TWO_WHEELER')).toBe(false);
    expect(AllocationEngine.isCompatible('CAR', 'NORMAL')).toBe(true);
    expect(AllocationEngine.isCompatible('CAR', 'EV')).toBe(true); // EV can hold normal cars if needed, though they don't get exact match bonus
  });

  it('should give exact match bonus correctly', () => {
    expect(AllocationEngine.isExactMatch('EV_CAR', 'EV')).toBe(true);
    expect(AllocationEngine.isExactMatch('EV_CAR', 'NORMAL')).toBe(false);

    expect(AllocationEngine.isExactMatch('CAR', 'NORMAL')).toBe(true);
    expect(AllocationEngine.isExactMatch('CAR', 'EV')).toBe(false);
    
    expect(AllocationEngine.isExactMatch('TWO_WHEELER', 'TWO_WHEELER')).toBe(true);
    expect(AllocationEngine.isExactMatch('TRUCK', 'HEAVY')).toBe(true);
  });
});
