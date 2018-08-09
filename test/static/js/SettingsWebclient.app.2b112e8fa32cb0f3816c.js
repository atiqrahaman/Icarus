webpackJsonp([17],{

/***/ 233:
/*!*********************************************************!*\
  !*** ./modules/CoreWebclient/js/popups/ConfirmPopup.js ***!
  \*********************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		$ = __webpack_require__(/*! jquery */ 1),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		
		CAbstractPopup = __webpack_require__(/*! modules/CoreWebclient/js/popups/CAbstractPopup.js */ 188)
	;

	/**
	 * @constructor
	 */
	function CConfirmPopup()
	{
		CAbstractPopup.call(this);
		
		this.fConfirmCallback = null;
		this.confirmDesc = ko.observable('');
		this.popupHeading = ko.observable('');
		this.okButtonText = ko.observable(TextUtils.i18n('COREWEBCLIENT/ACTION_OK'));
		this.cancelButtonText = ko.observable(TextUtils.i18n('COREWEBCLIENT/ACTION_CANCEL'));
		this.shown = false;
	}

	_.extendOwn(CConfirmPopup.prototype, CAbstractPopup.prototype);

	CConfirmPopup.prototype.PopupTemplate = 'CoreWebclient_ConfirmPopup';

	/**
	 * @param {string} sDesc
	 * @param {Function} fConfirmCallback
	 * @param {string=} sHeading = ''
	 * @param {string=} sOkButtonText = ''
	 * @param {string=} sCancelButtonText = ''
	 */
	CConfirmPopup.prototype.onOpen = function (sDesc, fConfirmCallback, sHeading, sOkButtonText, sCancelButtonText)
	{
		this.confirmDesc(sDesc);
		this.popupHeading(sHeading || '');
		this.okButtonText(sOkButtonText || TextUtils.i18n('COREWEBCLIENT/ACTION_OK'));
		this.cancelButtonText(sCancelButtonText || TextUtils.i18n('COREWEBCLIENT/ACTION_CANCEL'));
		if ($.isFunction(fConfirmCallback))
		{
			this.fConfirmCallback = fConfirmCallback;
		}
		this.shown = true;
	};

	CConfirmPopup.prototype.onHide = function ()
	{
		this.shown = false;
	};

	CConfirmPopup.prototype.onEnterHandler = function ()
	{
		this.yesClick();
	};

	CConfirmPopup.prototype.yesClick = function ()
	{
		if (this.shown && this.fConfirmCallback)
		{
			this.fConfirmCallback(true);
		}

		this.closePopup();
	};

	CConfirmPopup.prototype.cancelPopup = function ()
	{
		if (this.fConfirmCallback)
		{
			this.fConfirmCallback(false);
		}

		this.closePopup();
	};

	module.exports = new CConfirmPopup();


/***/ }),

/***/ 258:
/*!***********************************************************!*\
  !*** ./modules/CoreWebclient/js/views/CHeaderItemView.js ***!
  \***********************************************************/
/***/ (function(module, exports, __webpack_require__) {

	
	var
		ko = __webpack_require__(/*! knockout */ 46),
		
		Routing = __webpack_require__(/*! modules/CoreWebclient/js/Routing.js */ 189)
	;

	function CHeaderItemView(sLinkText)
	{
		this.sName = '';
		
		this.visible = ko.observable(true);
		this.baseHash = ko.observable('');
		this.hash = ko.observable('');
		this.linkText = ko.observable(sLinkText);
		this.isCurrent = ko.observable(false);
		
		this.recivedAnim = ko.observable(false).extend({'autoResetToFalse': 500});
		this.unseenCount = ko.observable(0);
		
		this.allowChangeTitle = ko.observable(false); // allows to change favicon and browser title when browser is inactive
		this.inactiveTitle = ko.observable('');
		
		this.excludedHashes = ko.observableArray([]);
	}

	CHeaderItemView.prototype.ViewTemplate = 'CoreWebclient_HeaderItemView';

	CHeaderItemView.prototype.setName = function (sName)
	{
		this.sName = sName.toLowerCase();
		if (this.baseHash() === '')
		{
			this.hash(Routing.buildHashFromArray([sName.toLowerCase()]));
			this.baseHash(this.hash());
		}
		else
		{
			this.hash(this.baseHash());
		}
	};

	module.exports = CHeaderItemView;


/***/ }),

/***/ 347:
/*!*************************************************!*\
  !*** ./modules/SettingsWebclient/js/manager.js ***!
  \*************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = function (oAppData) {
		var
			App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179),
			
			bAdminUser = App.getUserRole() === Enums.UserRole.SuperAdmin,
			bNormalUser = App.getUserRole() === Enums.UserRole.NormalUser,
			bCustomerUser = App.getUserRole() === Enums.UserRole.Customer,
			
			HeaderItemView = null
		;
		
		if (bAdminUser || bNormalUser || bCustomerUser)
		{
			var Settings = __webpack_require__(/*! modules/SettingsWebclient/js/Settings.js */ 348);
			Settings.init(oAppData);
			
			if (bAdminUser)
			{
				return {
					getAbstractSettingsFormViewClass: function () {
						return __webpack_require__(/*! modules/SettingsWebclient/js/views/CAbstractSettingsFormView.js */ 349);
					}
				};
			}
			else if (bNormalUser || bCustomerUser)
			{
				return {
					getScreens: function () {
						var oScreens = {};
						oScreens[Settings.HashModuleName] = function () {
							return __webpack_require__(/*! modules/SettingsWebclient/js/views/SettingsView.js */ 350);
						};
						return oScreens;
					},
					getHeaderItem: function () {
						if (HeaderItemView === null)
						{
							var
								TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
								CHeaderItemView = __webpack_require__(/*! modules/CoreWebclient/js/views/CHeaderItemView.js */ 258)
							;
							HeaderItemView = new CHeaderItemView(TextUtils.i18n('COREWEBCLIENT/HEADING_SETTINGS_TABNAME'));
						}
						return {
							item: HeaderItemView,
							name: Settings.HashModuleName
						};
					},
					/**
					 * Registers settings tab.
					 * 
					 * @param {function} fGetTabView Function that returns settings tab view object.
					 * @param {string} sTabName Tab name is used in hash string to rout to this tab.
					 * @param {string} sTabTitle Tab title is used in the list of tabs in navigation menu.
					 */
					registerSettingsTab: function (fGetTabView, sTabName, sTabTitle) {
						var SettingsView = __webpack_require__(/*! modules/SettingsWebclient/js/views/SettingsView.js */ 350);
						SettingsView.registerTab(fGetTabView, sTabName, sTabTitle);
					},
					registerSettingsTabSection: function (fGetTabView, sTabName, sTabTitle) {
						var SettingsView = __webpack_require__(/*! modules/SettingsWebclient/js/views/SettingsView.js */ 350);
						SettingsView.registerTabSection(fGetTabView, sTabName, sTabTitle);
					},
					getAbstractSettingsFormViewClass: function () {
						return __webpack_require__(/*! modules/SettingsWebclient/js/views/CAbstractSettingsFormView.js */ 349);
					},
					setAddHash: function (aAddHash) {
						var SettingsView = __webpack_require__(/*! modules/SettingsWebclient/js/views/SettingsView.js */ 350);
						SettingsView.setAddHash(aAddHash);
					}
				};
			}
		}
		
		return null;
	};


/***/ }),

/***/ 348:
/*!**************************************************!*\
  !*** ./modules/SettingsWebclient/js/Settings.js ***!
  \**************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44)
	;

	module.exports = {
		HashModuleName: 'settings',
		
		TabsOrder: ['common', 'mail', 'mail-accounts', 'contacts', 'calendar', 'files', 'mobilesync', 'outlooksync', 'helpdesk', 'openpgp'],
		
		/**
		 * Initializes settings from AppData object sections.
		 * 
		 * @param {Object} oAppData Object contained modules settings.
		 */
		init: function (oAppData)
		{
			var oAppDataSection = oAppData['SettingsWebclient'];
			
			if (!_.isEmpty(oAppDataSection))
			{
				this.TabsOrder = Types.pArray(oAppDataSection.TabsOrder, this.TabsOrder);
			}
		}
	};


/***/ }),

/***/ 349:
/*!*************************************************************************!*\
  !*** ./modules/SettingsWebclient/js/views/CAbstractSettingsFormView.js ***!
  \*************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		
		Ajax = __webpack_require__(/*! modules/CoreWebclient/js/Ajax.js */ 185),
		Api = __webpack_require__(/*! modules/CoreWebclient/js/Api.js */ 181),
		Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
		
		Popups = __webpack_require__(/*! modules/CoreWebclient/js/Popups.js */ 186),
		ConfirmPopup = __webpack_require__(/*! modules/CoreWebclient/js/popups/ConfirmPopup.js */ 233)
	;

	/**
	 * @constructor
	 * @param {string} sServerModule
	 */
	function CAbstractSettingsFormView(sServerModule)
	{
		this.sServerModule = sServerModule ? sServerModule : 'Core';
		
		this.isSaving = ko.observable(false);
		
		this.visible = ko.observable(true);
		
		this.sSavedState = '';
		
		this.bShown = false;
		
		this.SettingsTabName = '';
		this.SettingsTabTitle = '';
		this.aSettingsSections = [];
	}

	CAbstractSettingsFormView.prototype.ViewTemplate = ''; // should be overriden

	CAbstractSettingsFormView.prototype.addSettingsSection = function (oSection)
	{
		this.aSettingsSections.push(oSection);
	};

	/**
	 * @param {Object} oData
	 */
	CAbstractSettingsFormView.prototype.showTab = function (oData)
	{
		this.bShown = true;
		this.revert();
		if (_.isFunction(this.onShow))
		{
			this.onShow(oData);
		}
		_.each(this.aSettingsSections, function (oSection) {
			if (_.isFunction(oSection.onShow))
			{
				oSection.onShow(oData);
			}
		});
	};

	/**
	 * @param {Function} fAfterHideHandler
	 * @param {Function} fRevertRouting
	 */
	CAbstractSettingsFormView.prototype.hide = function (fAfterHideHandler, fRevertRouting)
	{
		var bStateChanged = this.getCurrentState() !== this.sSavedState;
		_.each(this.aSettingsSections, function (oSection) {
			if (_.isFunction(oSection.getCurrentState))
			{
				bStateChanged = bStateChanged || oSection.getCurrentState() !== oSection.sSavedState;
			}
		});
		if (bStateChanged) // if values have been changed
		{
			Popups.showPopup(ConfirmPopup, [TextUtils.i18n('COREWEBCLIENT/CONFIRM_DISCARD_CHANGES'), _.bind(function (bDiscard) {
				if (bDiscard)
				{
					this.bShown = false;
					fAfterHideHandler();
					this.revert();
				}
				else if (_.isFunction(fRevertRouting))
				{
					fRevertRouting();
				}
			}, this)]);
		}
		else
		{
			this.bShown = false;
			fAfterHideHandler();
		}
	};

	/**
	 * Returns an array with the values of editable fields.
	 * 
	 * Should be overriden.
	 * 
	 * @returns {Array}
	 */
	CAbstractSettingsFormView.prototype.getCurrentValues = function ()
	{
		return [];
	};

	/**
	 * @returns {String}
	 */
	CAbstractSettingsFormView.prototype.getCurrentState = function ()
	{
		var aState = this.getCurrentValues();
		
		return aState.join(':');
	};

	CAbstractSettingsFormView.prototype.updateSavedState = function()
	{
		this.sSavedState = this.getCurrentState();
	};

	/**
	 * Puts values from the global settings object to the editable fields.
	 * 
	 * Should be overriden.
	 */
	CAbstractSettingsFormView.prototype.revertGlobalValues = function ()
	{
		
	};

	CAbstractSettingsFormView.prototype.revert = function ()
	{
		_.each(this.aSettingsSections, function (oSection) {
			if (_.isFunction(oSection.revert))
			{
				oSection.revert();
			}
		});
		
		this.revertGlobalValues();
		
		this.updateSavedState();
	};

	/**
	 * Gets values from the editable fields and prepares object for passing to the server and saving settings therein.
	 * 
	 * Should be overriden.
	 * 
	 * @returns {Object}
	 */
	CAbstractSettingsFormView.prototype.getParametersForSave = function ()
	{
		return {};
	};

	/**
	 * Sends a request to the server to save the settings.
	 */
	CAbstractSettingsFormView.prototype.save = function ()
	{
		if (!_.isFunction(this.validateBeforeSave) || this.validateBeforeSave())
		{
			this.isSaving(true);

			Ajax.send(this.sServerModule, 'UpdateSettings', this.getParametersForSave(), this.onResponse, this);
		}
	};

	/**
	 * Applies saved values of settings to the global settings object.
	 * 
	 * Should be overriden.
	 * 
	 * @param {Object} oParameters Object that have been obtained by getParameters function.
	 */
	CAbstractSettingsFormView.prototype.applySavedValues = function (oParameters)
	{
		
	};

	/**
	 * Parses the response from the server.
	 * If the settings are normally stored, then updates them in the global settings object. 
	 * Otherwise shows an error message.
	 * 
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CAbstractSettingsFormView.prototype.onResponse = function (oResponse, oRequest)
	{
		this.isSaving(false);

		if (!oResponse.Result)
		{
			Api.showErrorByCode(oResponse, TextUtils.i18n('COREWEBCLIENT/ERROR_SAVING_SETTINGS_FAILED'));
		}
		else
		{
			var oParameters = oRequest.Parameters;
			
			this.updateSavedState();

			this.applySavedValues(oParameters);
			
			Screens.showReport(TextUtils.i18n('COREWEBCLIENT/REPORT_SETTINGS_UPDATE_SUCCESS'));
		}
	};

	/**
	 * Should be overriden.
	 * 
	 * @param {string} sEntityType
	 * @param {int} iEntityId
	 */
	CAbstractSettingsFormView.prototype.setAccessLevel = function (sEntityType, iEntityId)
	{
	};

	module.exports = CAbstractSettingsFormView;


/***/ }),

/***/ 350:
/*!************************************************************!*\
  !*** ./modules/SettingsWebclient/js/views/SettingsView.js ***!
  \************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		$ = __webpack_require__(/*! jquery */ 1),
		ko = __webpack_require__(/*! knockout */ 46),
		
		App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179),
		Routing = __webpack_require__(/*! modules/CoreWebclient/js/Routing.js */ 189),
		CAbstractScreenView = __webpack_require__(/*! modules/CoreWebclient/js/views/CAbstractScreenView.js */ 192),
		
		Settings = __webpack_require__(/*! modules/SettingsWebclient/js/Settings.js */ 348),
		
		$html = $('html')
	;

	/**
	 * @constructor
	 */
	function CSettingsView()
	{
		CAbstractScreenView.call(this, 'SettingsWebclient');
		
		this.tabs = ko.observableArray([]);
		
		this.currentTab  = ko.observable(null);
		
		App.subscribeEvent('OpenSettingTab', _.bind(function (oParams) {
			this.changeTab(oParams.Name);
		}, this));
		App.broadcastEvent('SettingsWebclient::ConstructView::after', {'Name': this.ViewConstructorName, 'View': this});
	}

	_.extendOwn(CSettingsView.prototype, CAbstractScreenView.prototype);

	CSettingsView.prototype.ViewTemplate = 'SettingsWebclient_SettingsView';
	CSettingsView.prototype.ViewConstructorName = 'CSettingsView';

	/**
	 * Registers settings tab.
	 * 
	 * @param {function} fGetTabView Function that returns settings tab view object.
	 * @param {string} sTabName Tab name is used in hash string to rout to this tab.
	 * @param {string} sTabTitle Tab title is used in the list of tabs in navigation menu.
	 */
	CSettingsView.prototype.registerTab = function (fGetTabView, sTabName, sTabTitle) {
		var
			iLastIndex = Settings.TabsOrder.length,
			oView = fGetTabView(),
			oTab = _.findWhere(this.tabs(), {'name': sTabName})
		;
		
		if (!_.isEmpty(oView))
		{
			oView.SettingsTabName = sTabName;
			oView.SettingsTabTitle = sTabTitle;
			if (oTab)
			{
				if (_.isArray(oTab.sections))
				{
					_.each(oTab.sections, function (oSection) {
						oView.addSettingsSection(oSection);
					});
					delete oTab.sections;
				}
				oTab.view = oView;
			}
		}
		
		if (!oTab)
		{
			this.tabs.push({
				view: oView,
				name: sTabName
			});
		}
		
		this.tabs(_.sortBy(this.tabs(), function (oTab) {
			var iIndex = _.indexOf(Settings.TabsOrder, oTab.name);
			return iIndex !== -1 ? iIndex : iLastIndex;
		}));
	};

	CSettingsView.prototype.registerTabSection = function (fGetSectionView, sTabName) {
		var
			oTab = _.findWhere(this.tabs(), {'name': sTabName}),
			oSection = fGetSectionView()
		;

		if (oTab)
		{
			oTab.view.addSettingsSection(oSection);
		}
		else
		{
			this.registerTab(function () { return {}; }, sTabName, '');
			oTab = _.findWhere(this.tabs(), {'name': sTabName});
			if (oTab)
			{
				if (!_.isArray(oTab.sections))
				{
					oTab.sections = [];
				}
				oTab.sections.push(oSection);
			}
		}
		
	};

	CSettingsView.prototype.onShow = function ()
	{
		$html.addClass('non-adjustable');
	};

	CSettingsView.prototype.onHide = function ()
	{
		$html.removeClass('non-adjustable');
	};

	/**
	 * @param {Array} aParams
	 */
	CSettingsView.prototype.onRoute = function (aParams)
	{
		var
			sNewTabName = aParams.shift(),
			oCurrentTab = this.currentTab(),
			oNewTab = _.find(this.tabs(), function (oTab) {
				return oTab.name === sNewTabName;
			}),
			fShowNewTab = function () {
				if (oNewTab)
				{
					if (_.isFunction(oNewTab.view.showTab))
					{
						oNewTab.view.showTab(aParams);
					}
					this.currentTab(oNewTab);
					if (oNewTab.name !== sNewTabName)
					{
						Routing.replaceHashDirectly([Settings.HashModuleName, oNewTab.name]);
					}
				}
			}.bind(this),
			fRevertRouting = _.bind(function () {
				if (oCurrentTab)
				{
					Routing.replaceHashDirectly([Settings.HashModuleName, oCurrentTab.name]);
				}
			}, this),
			bShow = true
		;
		
		if (oCurrentTab && sNewTabName === oCurrentTab.name)
		{
			if (_.isFunction(oCurrentTab.view.showTab))
			{
				oCurrentTab.view.showTab(aParams);
			}
			return;
		}
		
		if (oNewTab && oNewTab.view.visible && !oNewTab.view.visible())
		{
			oNewTab = _.find(this.tabs(), function (oTab) {
				return !oTab.view.visible || oTab.view.visible();
			});
		}
		
		if (oNewTab)
		{
			if (oCurrentTab && _.isFunction(oCurrentTab.view.hide))
			{
				oCurrentTab.view.hide(fShowNewTab, fRevertRouting);
				bShow = false;
			}
		}
		else if (!oCurrentTab)
		{
			oNewTab = _.find(this.tabs(), function (oTab) {
				return !oTab.view.visible || oTab.view.visible();
			});
		}
		
		if (bShow)
		{
			fShowNewTab();
		}
	};

	/**
	 * @param {string} sTabName
	 */
	CSettingsView.prototype.changeTab = function (sTabName)
	{
		Routing.setHash([Settings.HashModuleName, sTabName]);
	};

	/**
	 * @param {Array} aAddHash
	 */
	CSettingsView.prototype.setAddHash = function (aAddHash)
	{
		Routing.setHash(_.union([Settings.HashModuleName, this.currentTab() ? this.currentTab().name : ''], aAddHash));
	};

	module.exports = new CSettingsView();


/***/ })

});