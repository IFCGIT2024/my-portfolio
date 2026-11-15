import test from 'node:test';
import assert from 'node:assert/strict';
import { solarPosition } from './sun.mjs';
import { AtmosphereAudio, AMBIENCE_PRESETS } from './atmosphere.mjs';

test('solar position agrees with a published NREL reference within the precision of the approximate method', () => {
  // NREL SPA example: azimuth 194.34024°, zenith 50.11162° (with refraction).
  // https://www.nrel.gov/docs/fy08osti/34302.pdf
  const p = solarPosition('2003-10-17T19:30:30Z', 39.742476, -105.1786);
  assert.ok(Math.abs(p.azimuth - 194.34024) < .3);
  assert.ok(Math.abs(p.elevation - (90 - 50.11162)) < .3);
  assert.equal(p.daylight, true);
});

test('equatorial equinox midday and midnight have sensible elevations', () => {
  const noon = solarPosition('2026-03-20T12:00:00Z', 0, 0);
  const midnight = solarPosition('2026-03-20T00:00:00Z', 0, 0);
  assert.ok(noon.elevation > 87); assert.ok(midnight.elevation < -87);
  assert.equal(midnight.daylight, false);
});

test('different offsets denoting the same instant give identical sun position', () => {
  assert.deepEqual(solarPosition('2026-06-21T14:00:00Z', 44.65, -63.57), solarPosition('2026-06-21T11:00:00-03:00', 44.65, -63.57));
});

test('sun rises in the east and sets in the west at the equator', () => {
  const morning = solarPosition('2026-03-20T08:00:00Z', 0, 0);
  const afternoon = solarPosition('2026-03-20T16:00:00Z', 0, 0);
  assert.ok(morning.azimuth > 45 && morning.azimuth < 135);
  assert.ok(afternoon.azimuth > 225 && afternoon.azimuth < 315);
});

test('polar positions remain finite, inputs are validated, and local time strings are rejected', () => {
  const polar = solarPosition('2026-12-21T12:00:00Z', 90, 0);
  assert.ok(Number.isFinite(polar.elevation) && Number.isFinite(polar.azimuth));
  assert.equal(polar.daylight, false);
  assert.throws(() => solarPosition('2026-12-21T12:00', 0, 0), TypeError);
  assert.throws(() => solarPosition('invalid', 0, 0));
  assert.throws(() => solarPosition(new Date(), 91, 0), RangeError);
  assert.throws(() => solarPosition(new Date(), 0, -181), RangeError);
});

test('audio is opt-in and degrades safely where Web Audio is unavailable', async () => {
  assert.equal(Object.keys(AMBIENCE_PRESETS).length, 5);
  const ambient = new AtmosphereAudio();
  assert.equal(await ambient.start('forest'), false);
  ambient.setVolume(5); assert.equal(ambient.volume, 1);
  ambient.setVolume(-1); assert.equal(ambient.volume, 0);
  await assert.rejects(ambient.start('bad'), RangeError);
  await ambient.dispose();
});
