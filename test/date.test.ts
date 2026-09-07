import assert from 'node:assert/strict';
import { test } from 'node:test';
import { advanceDue } from '../src/app/helpers/date.ts';

test('1080 — advanceDue advances daily/weekly/monthly anchors', () => {
    assert.equal(advanceDue('2026-09-07', 'daily'), '2026-09-08');
    assert.equal(advanceDue('2026-09-07', 'weekly'), '2026-09-14');
    assert.equal(advanceDue('2026-09-07', 'monthly'), '2026-10-07');
    assert.equal(advanceDue('2026-12-31', 'monthly'), '2027-01-31');
});

test('1080 — advanceDue clamps monthly on month-end (no rollover to Mar)', () => {
    assert.equal(advanceDue('2026-01-31', 'monthly'), '2026-02-28');
    assert.equal(advanceDue('2024-01-31', 'monthly'), '2024-02-29', 'leap year respects Feb 29');
    assert.equal(advanceDue('2026-12-15', 'monthly'), '2027-01-15');
});

test('1080 — advanceDue returns null without a due anchor or on garbage', () => {
    assert.equal(advanceDue(null, 'daily'), null);
    assert.equal(advanceDue('', 'daily'), null);
    assert.equal(advanceDue('bukan-tanggal', 'weekly'), null);
});
