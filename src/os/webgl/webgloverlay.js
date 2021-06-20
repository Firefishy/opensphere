goog.module('os.webgl.WebGLOverlay');
goog.module.declareLegacyNamespace();

const GoogEventType = goog.require('goog.events.EventType');

const Overlay = goog.require('ol.Overlay');
const olProj = goog.require('ol.proj');


const MapChange = goog.require('os.MapChange');
const MapContainer = goog.require('os.MapContainer');
const osMap = goog.require('os.map');


/**
 * An OpenLayers overlay that supports positioning itself with a WebGL renderer.
 */
class WebGLOverlay extends Overlay {
  /**
   * Constructor.
   * @param {olx.OverlayOptions} options Overlay options.
   */
  constructor(options) {
    super(options);

    /**
     * Function to deregister the post render handler.
     * @type {function()|undefined}
     * @private
     */
    this.unPostRender_ = undefined;

    var mapContainer = MapContainer.getInstance();
    if (mapContainer.is3DEnabled()) {
      this.onWebGLActive();
    } else {
      mapContainer.listen(GoogEventType.PROPERTYCHANGE, this.onMapChange, false, this);
    }
  }

  /**
   * @inheritDoc
   */
  disposeInternal() {
    super.disposeInternal();

    MapContainer.getInstance().unlisten(GoogEventType.PROPERTYCHANGE, this.onMapChange, false, this);

    if (this.unPostRender_) {
      this.unPostRender_();
    }
  }

  /**
   * @inheritDoc
   */
  getPosition() {
    // if the WebGL renderer is being initialized, positioning the overlay will fail.
    var mapContainer = MapContainer.getInstance();
    if (mapContainer.isInitializingWebGL()) {
      return null;
    }

    return super.getPosition();
  }

  /**
   * If the overlay is visible.
   *
   * @return {boolean}
   */
  isVisible() {
    return this.rendered.visible;
  }

  /**
   * @inheritDoc
   */
  setVisible(visible) {
    var changed = this.rendered.visible !== visible;
    super.setVisible(visible);

    if (changed) {
      // notify when visibility changes so the annotation UI can update if needed
      this.notify('visible', visible);
    }
  }

  /**
   * Handle map property change events.
   *
   * @param {os.events.PropertyChangeEvent} event The event.
   * @protected
   */
  onMapChange(event) {
    if (event.getProperty() === MapChange.VIEW3D && event.getNewValue()) {
      MapContainer.getInstance().unlisten(GoogEventType.PROPERTYCHANGE, this.onMapChange, false, this);
      this.onWebGLActive();
    }
  }

  /**
   * Handle WebGL activiation on the map.
   *
   * @protected
   */
  onWebGLActive() {
    var webGLRenderer = MapContainer.getInstance().getWebGLRenderer();
    if (webGLRenderer) {
      // update the overlay on each WebGL post render event so it moves smoothly with the globe
      this.unPostRender_ = webGLRenderer.onPostRender(this.render.bind(this));
    }
  }

  /**
   * @inheritDoc
   */
  updatePixelPosition() {
    // do not update the overlay while WebGL is being initialized, or it will be positioned incorrectly.
    var mapContainer = MapContainer.getInstance();
    if (mapContainer.isInitializingWebGL()) {
      return;
    }

    var webGLRenderer = mapContainer.getWebGLRenderer();
    if (webGLRenderer && webGLRenderer.getEnabled()) {
      var map = this.getMap();
      var position = this.getPosition();
      if (!map || !map.isRendered() || !position) {
        // map isn't ready, so hide the overlay
        this.setVisible(false);
      } else {
        var coord = olProj.toLonLat(position, osMap.PROJECTION);
        var pixel = webGLRenderer.getPixelFromCoordinate(coord, true);
        if (!pixel) {
          // coordinate is not visible, so hide the overlay
          this.setVisible(false);
        } else {
          // position the overlay
          var mapSize = map.getSize();
          this.updateRenderedPosition(pixel, mapSize);
        }
      }

      return;
    }

    super.updatePixelPosition();
  }
}

exports = WebGLOverlay;
