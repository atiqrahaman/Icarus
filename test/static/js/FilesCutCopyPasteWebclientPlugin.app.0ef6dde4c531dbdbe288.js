webpackJsonp([9],{

/***/ 306:
/*!****************************************************************!*\
  !*** ./modules/FilesCutCopyPasteWebclientPlugin/js/manager.js ***!
  \****************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = function (oAppData) {
		var
			App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179),
			
			bNormalUser = App.getUserRole() === window.Enums.UserRole.NormalUser
		;

		if (bNormalUser)
		{
			return {
				start: function (ModulesManager) {
					ModulesManager.run('FilesWebclient', 'registerToolbarButtons', [__webpack_require__(/*! modules/FilesCutCopyPasteWebclientPlugin/js/views/ButtonsView.js */ 307)]);
				}
			};
		}
		
		return null;
	};


/***/ }),

/***/ 307:
/*!**************************************************************************!*\
  !*** ./modules/FilesCutCopyPasteWebclientPlugin/js/views/ButtonsView.js ***!
  \**************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		Utils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Common.js */ 211),
		
		Popups = __webpack_require__(/*! modules/CoreWebclient/js/Popups.js */ 186),
		AlertPopup = __webpack_require__(/*! modules/CoreWebclient/js/popups/AlertPopup.js */ 187)
	;

	/**
	 * @constructor
	 */
	function CButtonsView()
	{
		this.copiedItems = ko.observableArray([]);
		this.cuttedItems = ko.observableArray([]);
		this.pasteTooltip = ko.computed(function () {
			var aItems = _.union(this.cuttedItems(), this.copiedItems());
			if (aItems.length > 0)
			{
				return TextUtils.i18n('FILESCUTCOPYPASTEWEBCLIENTPLUGIN/ACTION_PASTE') + ': <br/>' + _.map(aItems, function (oFile) {
					return oFile.fileName();
				}).join(',<br/>');
			}
			else
			{
				return TextUtils.i18n('FILESCUTCOPYPASTEWEBCLIENTPLUGIN/ACTION_PASTE');
			}
		}, this);
	}

	CButtonsView.prototype.ViewTemplate = 'FilesCutCopyPasteWebclientPlugin_ButtonsView';

	CButtonsView.prototype.useFilesViewData = function (oFilesView)
	{
		this.listCheckedAndSelected = oFilesView.selector.listCheckedAndSelected;
		this.moveItems = _.bind(oFilesView.moveItems, oFilesView);
		this.cutCommand = Utils.createCommand(this, function () {
			this.copiedItems([]);
			this.cuttedItems(this.listCheckedAndSelected());
			Popups.showPopup(AlertPopup, [TextUtils.i18n('FILESCUTCOPYPASTEWEBCLIENTPLUGIN/INFO_ITEMS_CUTTED')]);
		}, function () {
			return this.listCheckedAndSelected().length > 0;
		});
		this.copyCommand = Utils.createCommand(this, function () {
			this.copiedItems(this.listCheckedAndSelected());
			this.cuttedItems([]);
			Popups.showPopup(AlertPopup, [TextUtils.i18n('FILESCUTCOPYPASTEWEBCLIENTPLUGIN/INFO_ITEMS_COPIED')]);
		}, function () {
			return this.listCheckedAndSelected().length > 0;
		});
		this.pasteCommand = Utils.createCommand(this, function () {
			if (this.cuttedItems().length > 0)
			{
				oFilesView.moveItems('Move', oFilesView.getCurrentFolder(), this.cuttedItems());
				this.cuttedItems([]);
			}
			if (this.copiedItems().length > 0)
			{
				oFilesView.moveItems('Copy', oFilesView.getCurrentFolder(), this.copiedItems());
				this.copiedItems([]);
			}
		}, function () {
			return this.cuttedItems().length > 0 || this.copiedItems().length > 0;
		});
		this.savedItemsCount = ko.computed(function () {
			return this.cuttedItems().length + this.copiedItems().length;
		}, this);
	};

	module.exports = new CButtonsView();


/***/ })

});