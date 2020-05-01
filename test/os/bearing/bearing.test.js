goog.require('os.bearing');
goog.require('os.bearing.geomag.wait');
goog.require('os.interpolate');
goog.require('os.osasm.wait');


describe('os.bearing', function() {
  // for the magnetic bearing calculations, the date matters, so we use this static date, otherwise the result
  // values will drift over time as the library simply uses new Date() otherwise
  var date = new Date(1488386496470);

  var precision = 8;
  var geodesic = os.interpolate.Method.GEODESIC;
  var rhumb = os.interpolate.Method.RHUMB;

  it('should get bearings correctly', function() {
    expect(os.bearing.getBearing([5, 10], [15, 20], date)).toBeCloseTo(42.99295488831754, precision);
    expect(os.bearing.getBearing([5, 10], [15, 20], date, rhumb)).toBeCloseTo(44.14439180550811, precision);

    expect(os.bearing.getBearing([-50, 80], [75, -60], date)).toBeCloseTo(72.0382868370632, precision);
    expect(os.bearing.getBearing([-50, 80], [75, -60], date, rhumb)).toBeCloseTo(149.74888585793278, precision);
  });

  it('should default to geodesic', function() {
    var a = os.bearing.getBearing([5, 10], [15, 20], date);
    var b = os.bearing.getBearing([5, 10], [15, 20], date, geodesic);

    expect(a).toBeCloseTo(b, 12);
  });

  it('should get magnetic bearings correctly', function() {
    os.settings.set(os.bearing.BearingSettingsKeys.BEARING_TYPE, os.bearing.BearingType.MAGNETIC);

    expect(os.bearing.getBearing([5, 10], [15, 20], date)).toBeCloseTo(44.180072479561, precision);
    expect(os.bearing.getBearing([5, 10], [15, 20], date, rhumb)).toBeCloseTo(45.331509396800, precision);

    expect(os.bearing.getBearing([-50, 80], [75, -60], date)).toBeCloseTo(111.912444073130, precision);
    expect(os.bearing.getBearing([-50, 80], [75, -60], date, rhumb)).toBeCloseTo(189.623043093919, precision);
  });

  it('should format bearings correctly', function() {
    os.settings.set(os.bearing.BearingSettingsKeys.BEARING_TYPE, os.bearing.BearingType.TRUE_NORTH);

    expect(os.bearing.modifyBearing(-150, [5, 10], date)).toBe(210);
    expect(os.bearing.modifyBearing(-50, [5, 10], date)).toBe(310);
    expect(os.bearing.modifyBearing(165, [5, 10], date)).toBe(165);
  });

  it('should format magnetic bearings correctly', function() {
    os.settings.set(os.bearing.BearingSettingsKeys.BEARING_TYPE, os.bearing.BearingType.MAGNETIC);

    expect(os.bearing.modifyBearing(-150, [5, 10], date)).toBeCloseTo(211.2, 1);
    expect(os.bearing.modifyBearing(-50, [60, 40], date)).toBeCloseTo(304.4, 1);
    expect(os.bearing.modifyBearing(165, [-50, -30], date)).toBeCloseTo(182.5, 1);
  });
});
