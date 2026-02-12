import { describe, it, expect } from 'vitest';
import {
  mulberry32,
  generateMisregistration,
  RISO_INKS,
  PRINT_ORDER,
  PAPER,
} from '../riso';

/* ── mulberry32 PRNG ─────────────────────────────────────── */
describe('mulberry32', () => {
  it('is deterministic: same seed produces same sequence', () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(42);
    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());
    expect(seq1).toEqual(seq2);
  });

  it('different seeds produce different sequences', () => {
    const rng1 = mulberry32(1);
    const rng2 = mulberry32(2);
    expect(rng1()).not.toBe(rng2());
  });

  it('output is always in [0, 1)', () => {
    const rng = mulberry32(12345);
    for (let i = 0; i < 1000; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('seed 0 produces valid output', () => {
    const rng = mulberry32(0);
    const val = rng();
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThan(1);
  });

  it('negative seed works', () => {
    const rng = mulberry32(-1);
    const val = rng();
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThan(1);
  });

  it('produces varied output (not stuck)', () => {
    const rng = mulberry32(99);
    const values = new Set(Array.from({ length: 100 }, () => rng()));
    expect(values.size).toBeGreaterThan(90);
  });
});

/* ── generateMisregistration ─────────────────────────────── */
describe('generateMisregistration', () => {
  it('returns all 5 ink keys', () => {
    const result = generateMisregistration(42);
    expect(Object.keys(result).sort()).toEqual(
      ['black', 'blue', 'fluorPink', 'lightGray', 'teal']
    );
  });

  it('lightGray always has zero offset', () => {
    const result = generateMisregistration(42);
    expect(result.lightGray).toEqual({ dx: 0, dy: 0, rotation: 0 });
  });

  it('is deterministic with same seed', () => {
    const a = generateMisregistration(42);
    const b = generateMisregistration(42);
    expect(a).toEqual(b);
  });

  it('different seeds yield different offsets', () => {
    const a = generateMisregistration(1);
    const b = generateMisregistration(2);
    expect(a.teal.dx).not.toBe(b.teal.dx);
  });

  it('offsets are within expected ranges', () => {
    const result = generateMisregistration(42);
    // teal: (rng - 0.5) * 3 → max ±1.5
    expect(Math.abs(result.teal.dx)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(result.teal.dy)).toBeLessThanOrEqual(1.5);
    // blue: (rng - 0.5) * 4 → max ±2
    expect(Math.abs(result.blue.dx)).toBeLessThanOrEqual(2);
    expect(Math.abs(result.blue.dy)).toBeLessThanOrEqual(2);
    // fluorPink: (rng - 0.5) * 5 → max ±2.5
    expect(Math.abs(result.fluorPink.dx)).toBeLessThanOrEqual(2.5);
    expect(Math.abs(result.fluorPink.dy)).toBeLessThanOrEqual(2.5);
    // black: (rng - 0.5) * 2 → max ±1
    expect(Math.abs(result.black.dx)).toBeLessThanOrEqual(1);
    expect(Math.abs(result.black.dy)).toBeLessThanOrEqual(1);
  });

  it('each ink has dx, dy, rotation fields', () => {
    const result = generateMisregistration(42);
    for (const offset of Object.values(result)) {
      expect(offset).toHaveProperty('dx');
      expect(offset).toHaveProperty('dy');
      expect(offset).toHaveProperty('rotation');
      expect(typeof offset.dx).toBe('number');
      expect(typeof offset.dy).toBe('number');
      expect(typeof offset.rotation).toBe('number');
    }
  });
});

/* ── RISO_INKS data integrity ────────────────────────────── */
describe('RISO_INKS integrity', () => {
  it('has 5 inks', () => {
    expect(Object.keys(RISO_INKS).length).toBe(5);
  });

  it('hex and RGB values agree', () => {
    for (const [name, ink] of Object.entries(RISO_INKS)) {
      const r = parseInt(ink.hex.slice(1, 3), 16);
      const g = parseInt(ink.hex.slice(3, 5), 16);
      const b = parseInt(ink.hex.slice(5, 7), 16);
      expect(r, `${name} red mismatch`).toBe(ink.r);
      expect(g, `${name} green mismatch`).toBe(ink.g);
      expect(b, `${name} blue mismatch`).toBe(ink.b);
    }
  });

  it('PRINT_ORDER contains all ink keys', () => {
    expect([...PRINT_ORDER].sort()).toEqual(Object.keys(RISO_INKS).sort());
  });

  it('PAPER is white', () => {
    expect(PAPER).toBe('#FFFFFF');
  });

  it('printOrder values are unique and sequential 1-5', () => {
    const orders = Object.values(RISO_INKS).map(ink => ink.printOrder).sort();
    expect(orders).toEqual([1, 2, 3, 4, 5]);
  });
});
