import { describe, it, expect, beforeEach } from 'vitest';
import { parseShareableHash } from '../shareable-urls';

/* ── parseShareableHash ──────────────────────────────────── */
describe('parseShareableHash', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('returns undefined title and colorName for empty hash', () => {
    window.location.hash = '';
    const result = parseShareableHash();
    expect(result.title).toBeUndefined();
    expect(result.colorName).toBeUndefined();
  });

  it('returns undefined for hash with only map coords', () => {
    window.location.hash = '#11/51.507/-0.128/180';
    const result = parseShareableHash();
    expect(result.title).toBeUndefined();
    expect(result.colorName).toBeUndefined();
  });

  it('parses title from hash', () => {
    window.location.hash = '#11/51.507/-0.128/180/t:Buenos+Aires';
    const result = parseShareableHash();
    expect(result.title).toBe('Buenos Aires');
  });

  it('parses colour hex pair from hash', () => {
    window.location.hash = '#11/51.507/-0.128/180/c:FF48B0.C4305C';
    const result = parseShareableHash();
    expect(result.colorName).toBe('FF48B0.C4305C');
  });

  it('parses both title and colour', () => {
    window.location.hash = '#11/51.507/-0.128/180/t:London/c:FF48B0.C4305C';
    const result = parseShareableHash();
    expect(result.title).toBe('London');
    expect(result.colorName).toBe('FF48B0.C4305C');
  });

  it('does not parse s: param (style)', () => {
    window.location.hash = '#11/51/0/180/s:protest';
    const result = parseShareableHash();
    expect(result.title).toBeUndefined();
    expect(result.colorName).toBeUndefined();
  });

  it('decodes URL-encoded characters in title', () => {
    window.location.hash = '#11/51/0/180/t:S%C3%A3o+Paulo';
    const result = parseShareableHash();
    expect(result.title).toBe('São Paulo');
  });

  it('passes through named colour', () => {
    window.location.hash = '#11/51/0/180/c:yellow';
    const result = parseShareableHash();
    expect(result.colorName).toBe('yellow');
  });

  it('handles malformed hash without crashing', () => {
    window.location.hash = '#///';
    expect(() => parseShareableHash()).not.toThrow();
    const result = parseShareableHash();
    expect(result.title).toBeUndefined();
    expect(result.colorName).toBeUndefined();
  });

  it('handles hash with only title, no coords', () => {
    window.location.hash = '#t:Hello+World';
    const result = parseShareableHash();
    expect(result.title).toBe('Hello World');
  });

  it('replaces + with spaces in title', () => {
    window.location.hash = '#11/51/0/180/t:New+York+City';
    const result = parseShareableHash();
    expect(result.title).toBe('New York City');
  });
});
