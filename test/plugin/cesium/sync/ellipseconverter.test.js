goog.require('ol.Feature');
goog.require('ol.proj');
goog.require('os.geom.Ellipse');
goog.require('os.layer.Vector');
goog.require('os.map');
goog.require('os.proj');
goog.require('os.style.StyleField');
goog.require('os.style.StyleManager');
goog.require('plugin.cesium');
goog.require('plugin.cesium.VectorContext');
goog.require('plugin.cesium.sync.EllipseConverter');
goog.require('test.plugin.cesium.scene');
goog.require('test.plugin.cesium.sync.linestring');


describe('plugin.cesium.sync.EllipseConverter', () => {
  const {getRealScene} = goog.module.get('test.plugin.cesium.scene');
  const {getLineRetriever, testLine} = goog.module.get('test.plugin.cesium.sync.linestring');
  const VectorContext = goog.module.get('plugin.cesium.VectorContext');
  const EllipseConverter = goog.module.get('plugin.cesium.sync.EllipseConverter');
  const ellipseConverter = new EllipseConverter();

  let feature;
  let geometry;
  let style;
  let layer;
  let scene;
  let context;
  let getLine;

  beforeEach(() => {
    enableWebGLMock();
    geometry = new os.geom.Ellipse([-5, -5], 100000, 50000, 45);
    feature = new ol.Feature(geometry);
    style = new ol.style.Style();
    layer = new os.layer.Vector();
    scene = getRealScene();
    context = new VectorContext(scene, layer, ol.proj.get(os.proj.EPSG4326));
    getLine = getLineRetriever(context, scene);
  });

  afterEach(() => {
    disableWebGLMock();
  });


  describe('create', () => {
    it('should create an ellipse', () => {
      const result = ellipseConverter.create(feature, geometry, style, context);
      expect(result).toBe(true);
      expect(context.primitives.length).toBe(1);
      testLine(getLine());
    });

    it('should not create a ground reference for ellipses without altitude', () => {
      const config = os.style.StyleManager.getInstance().createLayerConfig(layer.getId());
      config[os.style.StyleField.SHOW_GROUND_REF] = true;
      const result = ellipseConverter.create(feature, geometry, style, context);
      expect(result).toBe(true);
      expect(context.primitives.length).toBe(1);
      expect(context.polylines.length).toBe(0);
    });

    it('should create a ground reference for ellipses with altitude', () => {
      geometry = new os.geom.Ellipse([-5, -5, 1000], 100000, 50000, 45);
      const config = os.style.StyleManager.getInstance().createLayerConfig(layer.getId());
      config[os.style.StyleField.SHOW_GROUND_REF] = true;
      const result = ellipseConverter.create(feature, geometry, style, context);
      expect(result).toBe(true);
      expect(context.primitives.length).toBe(1);
      expect(context.polylines.length).toBe(1);
    });
  });

  describe('update', () => {
    it('should update an ellipse', () => {
      ellipseConverter.create(feature, geometry, style, context);
      expect(context.primitives.length).toBe(1);
      const polygonOutline = context.primitives.get(0);

      polygonOutline.dirty = true;
      const result = ellipseConverter.update(feature, geometry, style, context, polygonOutline);
      expect(result).toBe(true);
      expect(context.primitives.length).toBe(1);
      expect(context.primitives.get(0)).toBe(polygonOutline);
      expect(polygonOutline.dirty).toBe(false);
    });

    it('should not update a ground reference for ellipses without altitude', () => {
      const config = os.style.StyleManager.getInstance().createLayerConfig(layer.getId());
      config[os.style.StyleField.SHOW_GROUND_REF] = true;
      ellipseConverter.create(feature, geometry, style, context);

      geometry.setCenter([0, 0]);
      geometry.interpolateEllipse();

      const result = ellipseConverter.update(feature, geometry, style, context, context.primitives.get(0));
      expect(result).toBe(true);
      expect(context.primitives.length).toBe(1);
      expect(context.polylines.length).toBe(0);
    });

    it('should create a ground reference for ellipses with altitude', () => {
      geometry = new os.geom.Ellipse([-5, -5, 1000], 100000, 50000, 45);
      const config = os.style.StyleManager.getInstance().createLayerConfig(layer.getId());
      config[os.style.StyleField.SHOW_GROUND_REF] = true;
      ellipseConverter.create(feature, geometry, style, context);

      geometry.setCenter([0, 0, 1000]);
      geometry.interpolateEllipse();

      const result = ellipseConverter.update(feature, geometry, style, context, context.primitives.get(0));
      expect(result).toBe(true);
      expect(context.primitives.length).toBe(1);
      expect(context.polylines.length).toBe(1);
    });
  });
});
