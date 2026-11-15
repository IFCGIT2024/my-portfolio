# Environment modules

These ES modules contain no dependencies and run locally in modern browsers.

## Solar position

```js
import { solarPosition } from './sun.mjs';
const sun = solarPosition('2026-06-21T15:00:00-03:00', 44.6488, -63.5752);
// sun.azimuth: degrees clockwise from north
// sun.elevation: degrees above the horizon (negative below it)
// sun.daylight: elevation > 0
```

The timestamp represents an **absolute instant**. When a user enters local civil time for a location, the caller must resolve the correct UTC offset for that location and date, including daylight saving time, before calling. A `datetime-local` string is rejected because it contains no zone information. Coordinates use decimal degrees, north and east positive. The input does not call a geocoding service or ask for device location.

The approximate fractional-year equations follow [NOAA General Solar Position Calculations](https://gml.noaa.gov/grad/solcalc/solareqns.PDF). The calculated elevation is geometric: refraction, terrain, cloud, exterior obstructions and exact building placement are not simulated. Treat light and shadows as illustration rather than an architectural prediction. Accuracy may decline near the poles and horizon. Floor-plan north orientation and object heights must be supplied by the rendering layer.

## Ambient sound

```js
import { AtmosphereAudio, AMBIENCE_PRESETS } from './atmosphere.mjs';
const audio = new AtmosphereAudio();
// Invoke directly in response to a user's click or tap:
await audio.start('forest');
audio.setVolume(0.3);
audio.stop();
// On teardown:
await audio.dispose();
```

The five presets are forest, jungle, desert, highrise, and ground. They are procedural sound sketches, not field recordings. Audio is opt-in, creates no network requests, and is not started automatically. A browser without Web Audio returns `false` from `start`. Sound settings should remain separate from the room document unless the product explicitly chooses to share them.

## Tests

Run `node --test src/environment/sun.test.mjs` from the project root. The solar test compares the 2003 Colorado case with the example in [NREL's solar position algorithm report](https://www.nrel.gov/docs/fy08osti/34302.pdf), allowing for the approximation and refraction differences. Other tests cover compass direction, polar night, timezone offsets and invalid inputs.
