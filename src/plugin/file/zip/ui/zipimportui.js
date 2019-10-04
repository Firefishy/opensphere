goog.provide('plugin.file.zip.ui.ZIPImportUI');

goog.require('os.ui.im.FileImportUI');
goog.require('os.ui.window');
goog.require('plugin.file.zip.ZIPParserConfig');
goog.require('plugin.file.zip.mime');
goog.require('plugin.file.zip.ui.ZIPFilesStep');
goog.require('plugin.file.zip.ui.ZIPProcessStep');
goog.require('plugin.file.zip.ui.zipImportDirective');


/**
 * @extends {os.ui.im.FileImportUI.<plugin.file.zip.ZIPParserConfig>}
 * @constructor
 */
plugin.file.zip.ui.ZIPImportUI = function() {
  plugin.file.zip.ui.ZIPImportUI.base(this, 'constructor');
};
goog.inherits(plugin.file.zip.ui.ZIPImportUI, os.ui.im.FileImportUI);


/**
 * @inheritDoc
 */
plugin.file.zip.ui.ZIPImportUI.prototype.getTitle = function() {
  return 'ZIP';
};


/**
 * @inheritDoc
 */
plugin.file.zip.ui.ZIPImportUI.prototype.launchUI = function(file, opt_config) {
  plugin.file.zip.ui.ZIPImportUI.base(this, 'launchUI', file, opt_config);

  var steps = [
    new plugin.file.zip.ui.ZIPProcessStep(),
    new plugin.file.zip.ui.ZIPFilesStep()
  ];

  var config = new plugin.file.zip.ZIPParserConfig();

  // if a configuration was provided, merge it in
  if (opt_config) {
    this.mergeConfig(opt_config, config);
  }

  config.file = file; // set the file

  config.update(function() {
    // called when unzip finishes... don't need it right now
  });

  var scopeOptions = {
    'config': config,
    'steps': steps
  };
  var windowOptions = {
    'label': 'ZIP Import',
    'icon': 'fa fa-sign-in',
    'x': 'center',
    'y': 'center',
    'width': '650',
    'min-width': '500',
    'max-width': '1200',
    'height': '350',
    'min-height': '300',
    'max-height': '1000',
    'modal': 'true',
    'show-close': 'true',
    'no-scroll': 'false'
  };
  var template = '<zipimport resize-with="' + os.ui.windowSelector.WINDOW + '"></zipimport>';
  os.ui.window.create(windowOptions, template, undefined, undefined, undefined, scopeOptions);
};
