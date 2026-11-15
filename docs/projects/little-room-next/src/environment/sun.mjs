/**
 * Approximate solar position for visualization, using NOAA's fractional-year
 * equations. https://gml.noaa.gov/grad/solcalc/solareqns.PDF
 *
 * @param {Date|string|number} instant Absolute time (Date or ISO with offset).
 * @param {number} latitude Degrees north, from -90 to 90.
 * @param {number} longitude Degrees east, from -180 to 180.
 * @returns {{azimuth:number,elevation:number,daylight:boolean}}
 *   Degrees clockwise from north, geometric degrees above the horizon.
 *
 * This is not an architectural/engineering prediction: no terrain, refraction,
 * weather, or surrounding buildings. At the zenith the azimuth is arbitrary.
 */
export function solarPosition(instant, latitude, longitude) {
  // Strings without a timezone are ambiguous: Date would silently assume the
  // viewer's timezone instead of the site's timezone.
  if (typeof instant === 'string' && !/(?:Z|[+-]\d\d:\d\d)$/i.test(instant)) {
    throw new TypeError('Use a Date or an ISO instant with Z or a UTC offset.');
  }
  const date = new Date(instant);
  if (!Number.isFinite(date.getTime())) throw new RangeError('Invalid date.');
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new RangeError('Latitude must be between -90 and 90.');
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new RangeError('Longitude must be between -180 and 180.');
  const year = date.getUTCFullYear();
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const januaryFirst = new Date(date);
  januaryFirst.setUTCHours(0, 0, 0, 0);
  januaryFirst.setUTCFullYear(year, 0, 1);
  const day = Math.floor((date.getTime() - januaryFirst.getTime()) / 86400000) + 1;
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600 + date.getUTCMilliseconds() / 3600000;
  const gamma = 2 * Math.PI / (leap ? 366 : 365) * (day - 1 + (utcHours - 12) / 24);
  const equation = 229.18 * (.000075 + .001868 * Math.cos(gamma) - .032077 * Math.sin(gamma) - .014615 * Math.cos(2 * gamma) - .040849 * Math.sin(2 * gamma));
  const declination = .006918 - .399912 * Math.cos(gamma) + .070257 * Math.sin(gamma) - .006758 * Math.cos(2 * gamma) + .000907 * Math.sin(2 * gamma) - .002697 * Math.cos(3 * gamma) + .00148 * Math.sin(3 * gamma);
  // Time is already UTC, so the timezone offset in NOAA's equation is zero.
  const trueMinutes = ((utcHours * 60 + equation + 4 * longitude) % 1440 + 1440) % 1440;
  const hourAngle = (trueMinutes / 4 - 180) * Math.PI / 180;
  const lat = latitude * Math.PI / 180;
  const sinElevation = Math.sin(lat) * Math.sin(declination) + Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle);
  const elevation = Math.asin(Math.max(-1, Math.min(1, sinElevation))) * 180 / Math.PI;
  // atan2 retains the morning/afternoon quadrant and is stable at the poles.
  const azimuth = (Math.atan2(Math.sin(hourAngle), Math.cos(hourAngle) * Math.sin(lat) - Math.tan(declination) * Math.cos(lat)) * 180 / Math.PI + 180 + 360) % 360;
  return { azimuth, elevation, daylight: elevation > 0 };
}
