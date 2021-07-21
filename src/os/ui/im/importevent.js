goog.module('os.ui.im.ImportEvent');
goog.module.declareLegacyNamespace();

const GoogEvent = goog.require('goog.events.Event');
const OSFile = goog.require('os.file.File');


/**
 * File/URL import event.
 */
class ImportEvent extends GoogEvent {
  /**
   * Constructor.
   * @param {string} type
   * @param {(OSFile|string)=} opt_fileOrUrl
   * @param {string=} opt_contentHint
   * @param {Object=} opt_config Optional config, giving context to the import process
   */
  constructor(type, opt_fileOrUrl, opt_contentHint, opt_config) {
    super(type);

    /**
     * @type {?string}
     */
    this.contentHint = opt_contentHint ? opt_contentHint : null;

    /**
     * @type {?OSFile}
     */
    this.file = opt_fileOrUrl && opt_fileOrUrl instanceof OSFile ? opt_fileOrUrl : null;

    /**
     * @type {?string}
     */
    this.url = opt_fileOrUrl && typeof opt_fileOrUrl === 'string' ? opt_fileOrUrl : null;

    /**
     * @type {?Object}
     */
    this.config = opt_config || null;
  }
}

exports = ImportEvent;
