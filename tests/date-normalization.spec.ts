import { expect, test } from '@playwright/test';
import { normalizeEventDate } from '../src/lib/date';

test('normalizeEventDate pads month/day', () => {
  expect(normalizeEventDate('1/6/2026')).toBe('2026-01-06');
});

test('normalizeEventDate preserves padded input', () => {
  expect(normalizeEventDate('01/16/2026')).toBe('2026-01-16');
});

test('normalizeEventDate accepts YYYY-MM-DD', () => {
  expect(normalizeEventDate('2026-01-16')).toBe('2026-01-16');
});

test('normalizeEventDate returns empty string on invalid input', () => {
  expect(normalizeEventDate('')).toBe('');
  expect(normalizeEventDate('bad')).toBe('');
});
