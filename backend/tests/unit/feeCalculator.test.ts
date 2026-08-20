import { calculateParkingFee } from '../../src/services/feeCalculator';

describe('calculateParkingFee', () => {
  const base = { hourlyRate: 40, gracePeriodMinutes: 15, minimumFee: 20 };

  it.each([
    { name: 'zero duration bills minimumFee', durationMinutes: 0, expected: 20 },
    { name: 'inside grace period bills minimumFee', durationMinutes: 10, expected: 20 },
    { name: 'exactly at grace boundary bills minimumFee', durationMinutes: 15, expected: 20 },
    { name: 'one minute past grace rounds up to 1 hour', durationMinutes: 16, expected: 40 },
    { name: 'exactly one billable hour', durationMinutes: 75, expected: 40 },
    { name: 'partial second hour rounds up', durationMinutes: 76, expected: 80 },
    { name: 'multi-hour duration', durationMinutes: 180, expected: 120 },
  ])('$name', ({ durationMinutes, expected }) => {
    expect(calculateParkingFee({ ...base, durationMinutes })).toBe(expected);
  });

  it('minimumFee of 0 yields 0 inside the grace period', () => {
    expect(
      calculateParkingFee({
        durationMinutes: 5,
        gracePeriodMinutes: 15,
        hourlyRate: 50,
        minimumFee: 0,
      }),
    ).toBe(0);
  });
});
