import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sanitizeDue, sanitizeName, sanitizePriority } from '../src/app/helpers/validate.ts';

test('963 — sanitizeName: empty/non-string becomes ""', () => {
    assert.equal(sanitizeName(''), '');
    assert.equal(sanitizeName('   '), '');
    assert.equal(sanitizeName(null), '');
    assert.equal(sanitizeName(undefined), '');
    assert.equal(sanitizeName(123), '');
    assert.equal(sanitizeName(['bukan string']), '');
});

test('963 — sanitizeName: trims then collapses double spaces', () => {
    assert.equal(sanitizeName('  Beli   susu   '), 'Beli susu');
    assert.equal(sanitizeName('  asli\n\ttab  '), 'asli tab');
});

test('963 — sanitizeName: max 200 characters', () => {
    assert.equal(sanitizeName('a'.repeat(250)).length, 200);
    assert.equal(sanitizeName('abc'), 'abc');
});

test('963 — sanitizePriority: only low/medium/high', () => {
    assert.equal(sanitizePriority('low'), 'low');
    assert.equal(sanitizePriority('medium'), 'medium');
    assert.equal(sanitizePriority('high'), 'high');
    assert.equal(sanitizePriority('urgent'), undefined);
    assert.equal(sanitizePriority('LOW'), undefined);
    assert.equal(sanitizePriority(''), undefined);
    assert.equal(sanitizePriority(undefined), undefined);
    assert.equal(sanitizePriority(null), undefined);
});

test('963 — sanitizeDue: valid yyyy-MM-dd', () => {
    assert.equal(sanitizeDue('2026-09-06'), '2026-09-06');
    assert.equal(sanitizeDue(' 2026-09-06 '), '2026-09-06');
    assert.equal(sanitizeDue(''), null);
    assert.equal(sanitizeDue(undefined), null);
});

test('963 — sanitizeDue: malformed/impossible dates rejected', () => {
    assert.equal(sanitizeDue('06-09-2026'), null);
    assert.equal(sanitizeDue('2026-13-01'), null);
    assert.equal(sanitizeDue('2023-02-30'), null);
    assert.equal(sanitizeDue('abc'), null);
    assert.equal(sanitizeDue('2026-9-6'), null);
});
