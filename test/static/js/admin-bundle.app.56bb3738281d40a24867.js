webpackJsonp([1],{

/***/ 231:
/*!****************************************************!*\
  !*** ./modules/AdminPanelWebclient/js/Settings.js ***!
  \****************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44)
	;

	module.exports = {
		ServerModuleName: 'AdminPanelWebclient',
		HashModuleName: 'admin',
		
		EntitiesData: [
	//		{
	//			Type: 'Tenant',
	//			ScreenHash: 'tenants',
	//			LinkTextKey: 'ADMINPANELWEBCLIENT/HEADING_TENANTS_SETTINGS_TABNAME'
	//		},
			{
				Type: 'User',
				ScreenHash: 'users',
				LinkTextKey: 'ADMINPANELWEBCLIENT/HEADING_USERS_SETTINGS_TABNAME'
			}
		],
		
		EntitiesPerPage: 20,
		TabsOrder: ['licensing', 'admin-security', 'admin-db', 'logs-viewer', 'system', 'common', 'modules', 'mail', 'mail-domains', 'mail-accounts', 'mail-servers', 'contacts', 'calendar', 'files', 'mobilesync', 'outlooksync', 'helpdesk', 'openpgp'],
		
		/**
		 * Initializes settings from AppData object sections.
		 * 
		 * @param {Object} oAppData Object contained modules settings.
		 */
		init: function (oAppData)
		{
			var oAppDataSection = oAppData['Core'];
			
			if (!_.isEmpty(oAppDataSection))
			{
				this.EntitiesPerPage = Types.pPositiveInt(oAppDataSection.EntitiesPerPage, this.EntitiesPerPage);
				this.TabsOrder = Types.pArray(oAppDataSection.TabsOrder, this.TabsOrder);
			}
		}
	};


/***/ }),

/***/ 232:
/*!***************************************************************************!*\
  !*** ./modules/AdminPanelWebclient/js/views/CAbstractSettingsFormView.js ***!
  \***************************************************************************/
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
	}

	CAbstractSettingsFormView.prototype.ViewTemplate = ''; // should be overriden

	CAbstractSettingsFormView.prototype.onRoute = function (aParams)
	{
		this.bShown = true;
		this.revert();
		if (_.isFunction(this.onRouteChild))
		{
			this.onRouteChild(aParams);
		}
	};

	/**
	 * @param {Function} fAfterHideHandler
	 * @param {Function} fRevertRouting
	 */
	CAbstractSettingsFormView.prototype.hide = function (fAfterHideHandler, fRevertRouting)
	{
		if (this.getCurrentState() !== this.sSavedState) // if values have been changed
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

/***/ 234:
/*!**************************************************************!*\
  !*** ./modules/AdminPanelWebclient/js/views/SettingsView.js ***!
  \**************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		$ = __webpack_require__(/*! jquery */ 1),
		ko = __webpack_require__(/*! knockout */ 46),
		Promise = __webpack_require__(/*! bluebird */ 3),
		
		Text = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		
		App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179),
		Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
		Routing = __webpack_require__(/*! modules/CoreWebclient/js/Routing.js */ 189),
		CAbstractScreenView = __webpack_require__(/*! modules/CoreWebclient/js/views/CAbstractScreenView.js */ 192),
		
		Links = __webpack_require__(/*! modules/AdminPanelWebclient/js/utils/Links.js */ 235),
		
		Settings = __webpack_require__(/*! modules/AdminPanelWebclient/js/Settings.js */ 231),
		CEntitiesView = __webpack_require__(/*! modules/AdminPanelWebclient/js/views/CEntitiesView.js */ 236)
	;

	/**
	 * Constructor of admin panel settings view.
	 * 
	 * @constructor
	 */
	function CSettingsView()
	{
		CAbstractScreenView.call(this, 'AdminPanelWebclient');
		
		this.aScreens = [
			{
				sHash: Routing.buildHashFromArray(Links.get('')),
				sLinkText: Text.i18n('ADMINPANELWEBCLIENT/HEADING_SYSTEM_SETTINGS_TABNAME'),
				sType: '',
				oView: null
			}
		];
		_.each(Settings.EntitiesData, _.bind(function (oEntityData) {
			var
				oView = new CEntitiesView(oEntityData.Type),
				fChangeEntity = _.bind(function (sType, iEntityId, sTabName) {
					if (sTabName === 'create')
					{
						this.createEntity();
					}
					else if (sType === this.currentEntityType())
					{
						this.changeEntity(sType, iEntityId, sTabName || '');
					}
				}, this)
			;
			
			oView.setChangeEntityHandler(fChangeEntity);
			
			this.aScreens.push({
				sHash: Routing.buildHashFromArray(Links.get(oEntityData.Type)),
				sLinkText: Text.i18n(oEntityData.LinkTextKey),
				sType: oEntityData.Type,
				oView: oView
			});
		}, this));
		this.currentEntityType = ko.observable('');
		this.currentEntitiesId = ko.observable({});
		this.currentEntitiesView = ko.computed(function () {
			var
				sCurrType = this.currentEntityType(),
				oCurrEntitiesData = _.find(this.aScreens, function (oData) {
					return oData.sType === sCurrType;
				})
			;
			return oCurrEntitiesData ? oCurrEntitiesData.oView : null;
		}, this);
		this.currentEntitiesView.subscribe(function () {
			if (this.currentEntitiesView())
			{
				this.currentEntitiesView().onShow();
			}
		}, this);
		this.showModulesTabs = ko.computed(function () {
			return this.currentEntityType() === '' || this.currentEntitiesView().hasSelectedEntity();
		}, this);
		
		this.tabs = ko.observableArray([]);
		
		this.currentTab = ko.observable(null);
		
		this.aStartErrors = [];
		
		App.broadcastEvent('AdminPanelWebclient::ConstructView::after', {'Name': this.ViewConstructorName, 'View': this});
	}

	_.extendOwn(CSettingsView.prototype, CAbstractScreenView.prototype);

	CSettingsView.prototype.ViewTemplate = 'AdminPanelWebclient_SettingsView';
	CSettingsView.prototype.ViewConstructorName = 'CSettingsView';

	/**
	 * Registers admin panel tab.
	 * 
	 * @param {Function} fGetTabView Function that returns Promise which resolves into view model of the tab.
	 * @param {Object} oTabName Tab name.
	 * @param {Object} oTabTitle Tab title.
	 */
	CSettingsView.prototype.registerTab = function (fGetTabView, oTabName, oTabTitle)
	{
		if (_.isFunction(fGetTabView))
		{
			var aTabs = this.tabs;
			
			return new Promise(fGetTabView).then(function (oTabView) {
				aTabs.push({
					view: oTabView,
					name: oTabName,
					title: oTabTitle
				});
			});
		}
		return false;
	};

	/**
	 * Sorts tabs by some modules order list
	 */
	CSettingsView.prototype.sortRegisterTabs = function ()
	{
		this.tabs(_.sortBy(this.tabs(), function (oTab) {
			var iIndex = _.indexOf(Settings.TabsOrder, oTab.name);
			return iIndex !== -1 ? iIndex : Settings.TabsOrder.length;
		}));
	};

	/**
	 * Sets hash without creating entity.
	 */
	CSettingsView.prototype.cancelCreatingEntity = function ()
	{
		Routing.setHash(Links.get(this.currentEntityType(), {}, ''));
	};

	/**
	 * Sets hash for creating entity.
	 */
	CSettingsView.prototype.createEntity = function ()
	{
		Routing.setHash(Links.get(this.currentEntityType(), {}, 'create'));
	};

	/**
	 * Sets hash to route to screen with specified entity type and|or entity identifier and|or settings tab.
	 * 
	 * @param {string} sEntityName Entity type to display.
	 * @param {number} iEntityId Identifier of entity to display.
	 * @param {string} sTabName Name of settings tab to display.
	 */
	CSettingsView.prototype.changeEntity = function (sEntityName, iEntityId, sTabName)
	{
		var
			oEntitiesId = _.clone(this.currentEntitiesId()),
			bHasTab = !!_.find(this.tabs(), function (oTab) {
				return oTab.name === sTabName;
			}),
			sCurrTabName = this.currentTab() ? this.currentTab().name : ''
		;
		oEntitiesId[sEntityName] = iEntityId;
		Routing.setHash(Links.get(sEntityName, oEntitiesId, bHasTab ? sTabName : sCurrTabName));
	};

	/**
	 * Runs after knockout binding. Checks if settings tab have error to show on start and shows them.
	 */
	CSettingsView.prototype.onBind = function ()
	{
		_.each(this.tabs(), _.bind(function (oTab) {
			if (oTab.view && _.isFunction(oTab.view.getStartError))
			{
				var koError = oTab.view.getStartError();
				if (_.isFunction(koError))
				{
					koError.subscribe(function () {
						this.showStartError();
					}, this);
					this.aStartErrors.push(koError);
				}
			}
		}, this));
		
		this.showStartError();
	};

	CSettingsView.prototype.showStartError = function ()
	{
		var aErrors = [];
		
		_.each(this.aStartErrors, function (koError) {
			var sError = koError();
			if (sError !== '')
			{
				aErrors.push(sError);
			}
		});
		
		Screens.showError(aErrors.join('<br /><br />'), true);
	};

	/**
	 * Parses parameters from url hash, hides current admin panel tab if nessessary and after that finds a new one and shows it.
	 * 
	 * @param {Array} aParams Parameters from url hash.
	 */
	CSettingsView.prototype.onRoute = function (aParams)
	{
		var
			oParams = Links.parse(aParams),
			aTabParams = aParams.slice(1),
			bSameType = this.currentEntityType() === oParams.CurrentType,
			bSameId = this.currentEntitiesId()[oParams.CurrentType] === oParams.Entities[oParams.CurrentType],
			bSameTab = this.currentTab() && this.currentTab().name === oParams.Last,
			oCurrentTab = this.currentTab(),
			fAfterTabHide = _.bind(function () {
				this.showNewScreenView(oParams);
				this.showNewTabView(oParams.Last, aTabParams); // only after showing new entities view
			}, this),
			fAfterRefuseTabHide = _.bind(function () {
				if (oCurrentTab)
				{
					Routing.replaceHashDirectly(Links.get(this.currentEntityType(), this.currentEntitiesId(), this.currentTab() ? this.currentTab().name : ''));
				}
			}, this)
		;
		
		if (!bSameType || !bSameId || !bSameTab)
		{
			if (oCurrentTab && $.isFunction(oCurrentTab.view.hide))
			{
				oCurrentTab.view.hide(fAfterTabHide, fAfterRefuseTabHide);
			}
			else
			{
				fAfterTabHide();
			}
		}
		else if (oCurrentTab)
		{
			oCurrentTab.view.onRoute(aTabParams);
		}
	};

	/**
	 * Shows new screen view.
	 * 
	 * @param {Object} oParams Parameters with information about new screen.
	 */
	CSettingsView.prototype.showNewScreenView = function (oParams)
	{
		var
			oCurrentEntityData = _.find(this.aScreens, function (oData) {
				return oData.sType === oParams.CurrentType;
			})
		;
		
		this.currentEntityType(oParams.CurrentType);
		this.currentEntitiesId(oParams.Entities);

		if (oCurrentEntityData && oCurrentEntityData.oView)
		{
			if (oParams.Last === 'create')
			{
				oCurrentEntityData.oView.openCreateForm();
			}
			else
			{
				oCurrentEntityData.oView.cancelCreatingEntity();
			}
			oCurrentEntityData.oView.changeEntity(oParams.Entities[oParams.CurrentType]);
		}
	};

	/**
	 * Shows tab with specified tab name. Should be called only after calling showNewScreenView method.
	 * 
	 * @param {string} sNewTabName New tab name.
	 * @param {array} aTabParams
	 */
	CSettingsView.prototype.showNewTabView = function (sNewTabName, aTabParams)
	{
		// Sets access level to all tabs so they can correct their visibilities
		_.each(this.tabs(), _.bind(function (oTab) {
			if (oTab.view && _.isFunction(oTab.view.setAccessLevel))
			{
				oTab.view.setAccessLevel(this.currentEntityType(), this.currentEntitiesId()[this.currentEntityType()]);
			}
		}, this));
		
		// Finds tab with name from the url hash
		var oNewTab = _.find(this.tabs(), function (oTab) {
			return oTab.name === sNewTabName;
		});
		
		// If the tab wasn't found finds the first available visible tab
		if (!oNewTab || !(oNewTab.view && oNewTab.view.visible()))
		{
			oNewTab = _.find(this.tabs(), function (oTab) {
				return oTab.view && oTab.view.visible();
			});
		}
		
		// If tab was found calls its onRoute function and sets new current tab
		if (oNewTab)
		{
			if ($.isFunction(oNewTab.view.onRoute))
			{
				oNewTab.view.onRoute(aTabParams);
			}
			this.currentTab(oNewTab);
		}
	};

	/**
	 * Sets hash for showing another admin panel tab.
	 * 
	 * @param {string} sTabName Tab name.
	 */
	CSettingsView.prototype.changeTab = function (sTabName)
	{
		Routing.setHash(Links.get(this.currentEntityType(), this.currentEntitiesId(), sTabName));
	};

	/**
	 * Calls logout function of application.
	 */
	CSettingsView.prototype.logout = function ()
	{
		App.logout();
	};

	/**
	 * Deletes current entity.
	 */
	CSettingsView.prototype.deleteCurrentEntity = function ()
	{
		if (this.currentEntitiesView())
		{
			this.currentEntitiesView().deleteCurrentEntity();
		}
	};

	/**
	 * @param {Array} aAddHash
	 */
	CSettingsView.prototype.setAddHash = function (aAddHash)
	{
		Routing.setHash(_.union([Settings.HashModuleName, this.currentTab() ? this.currentTab().name : ''], aAddHash));
	};

	module.exports = new CSettingsView();


/***/ }),

/***/ 235:
/*!*******************************************************!*\
  !*** ./modules/AdminPanelWebclient/js/utils/Links.js ***!
  \*******************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44),
		
		Settings = __webpack_require__(/*! modules/AdminPanelWebclient/js/Settings.js */ 231),
		
		sSrchPref = 's.',
		sPagePref = 'p.',
		
		Links = {}
	;

	/**
	 * Returns true if parameter contains path value.
	 * @param {string} sTemp
	 * @return {boolean}
	 */
	function IsPageParam(sTemp)
	{
		return (sPagePref === sTemp.substr(0, 1) && (/^[1-9][\d]*$/).test(sTemp.substr(sPagePref.length)));
	};

	/**
	 * Returns true if parameter contains search value.
	 * @param {string} sTemp
	 * @return {boolean}
	 */
	function IsSearchParam(sTemp)
	{
		return (sSrchPref === sTemp.substr(0, sSrchPref.length));
	};

	/**
	 * @param {Array=} aEntities
	 * @param {string=} sCurrEntityType = ''
	 * @param {string=} sLast = ''
	 * @param {number=} iPage = 1
	 * @param {string=} sSearch = ''
	 * @return {Array}
	 */
	Links.get = function (sCurrEntityType, aEntities, sLast, iPage, sSearch)
	{
		var aResult = [Settings.HashModuleName];
		
		aEntities = aEntities || [];
		
		_.each(Settings.EntitiesData, function (oEntityData) {
			if (Types.isPositiveNumber(aEntities[oEntityData.Type]))
			{
				aResult.push(oEntityData.ScreenHash.substr(0,1) + aEntities[oEntityData.Type]);
			}
			else if (sCurrEntityType === oEntityData.Type)
			{
				aResult.push(oEntityData.ScreenHash);
			}
		});
		
		if (Types.isPositiveNumber(iPage) && iPage > 1)
		{
			aResult.push(sPagePref + iPage);
		}
		
		if (Types.isNonEmptyString(sSearch))
		{
			aResult.push(sSrchPref + sSearch);
		}
		
		if (Types.isNonEmptyString(sLast))
		{
			aResult.push(sLast);
		}
		
		return aResult;
	};

	/**
	 * @param {Array} aParams
	 * 
	 * @return {Object}
	 */
	Links.parse = function (aParams)
	{
		var
			iIndex = 0,
			oEntities = {},
			sCurrEntityType = '',
			iPage = 1,
			sSearch = '',
			sTemp = ''
		;
		
		_.each(Settings.EntitiesData, function (oEntityData) {
			if (aParams[iIndex] && oEntityData.ScreenHash === aParams[iIndex])
			{
				sCurrEntityType = oEntityData.Type;
				iIndex++;
			}
			if (aParams[iIndex] && oEntityData.ScreenHash.substr(0, 1) === aParams[iIndex].substr(0, 1) && Types.pInt(aParams[iIndex].substr(1)) > 0)
			{
				oEntities[oEntityData.Type] = Types.pInt(aParams[iIndex].substr(1));
				sCurrEntityType = oEntityData.Type;
				iIndex++;
			}
			if (aParams.length > iIndex)
			{
				sTemp = Types.pString(aParams[iIndex]);
				if (IsPageParam(sTemp))
				{
					iPage = Types.pInt(sTemp.substr(sPagePref.length));
					if (iPage <= 0)
					{
						iPage = 1;
					}
					iIndex++;
				}
			}
			if (aParams.length > iIndex)
			{
				sTemp = Types.pString(aParams[iIndex]);
				if (IsSearchParam(sTemp))
				{
					sSearch = sTemp.substr(sSrchPref.length);
					iIndex++;
				}
			}
		});
		
		return {
			Entities: oEntities,
			CurrentType: sCurrEntityType,
			Last: Types.isNonEmptyString(aParams[iIndex]) ? aParams[iIndex] : '',
			Page: iPage,
			Search: sSearch
		};
	};

	module.exports = Links;


/***/ }),

/***/ 236:
/*!***************************************************************!*\
  !*** ./modules/AdminPanelWebclient/js/views/CEntitiesView.js ***!
  \***************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44),
		Utils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Common.js */ 211),
		
		Api = __webpack_require__(/*! modules/CoreWebclient/js/Api.js */ 181),
		Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
		
		CPageSwitcherView = __webpack_require__(/*! modules/CoreWebclient/js/views/CPageSwitcherView.js */ 237),
		
		Popups = __webpack_require__(/*! modules/CoreWebclient/js/Popups.js */ 186),
		ConfirmPopup = __webpack_require__(/*! modules/CoreWebclient/js/popups/ConfirmPopup.js */ 233),
		
		Ajax = __webpack_require__(/*! modules/AdminPanelWebclient/js/Ajax.js */ 238),
		Settings = __webpack_require__(/*! modules/AdminPanelWebclient/js/Settings.js */ 231)
	;

	/**
	 * Constructor of entities view. Creates, edits and deletes entities.
	 * 
	 * @param {string} sEntityType Type of entity processed here.
	 * 
	 * @constructor
	 */
	function CEntitiesView(sEntityType)
	{
		this.sType = sEntityType;
		this.oEntityCreateView = this.getEntityCreateView();
		this.entities = ko.observableArray([]);
		this.totalEntitiesCount = ko.observable(0);
		this.current = ko.observable(0);
		this.showCreateForm = ko.observable(false);
		this.isCreating = ko.observable(false);
		this.hasSelectedEntity = ko.computed(function () {
			var aIds = _.map(this.entities(), function (oEntity) {
				return oEntity.Id;
			});
			return _.indexOf(aIds, this.current()) !== -1;
		}, this);
		
		this.justCreatedId = ko.observable(0);
		this.fChangeEntityHandler = function () {};
		
		ko.computed(function () {
			if (this.justCreatedId() === 0 && !this.showCreateForm() && !this.hasSelectedEntity() && this.entities().length > 0)
			{
				this.fChangeEntityHandler(this.sType, this.entities()[0].Id);
			}
		}, this).extend({ throttle: 1 });
		
		this.checkedEntities = ko.computed(function () {
			return _.filter(this.entities(), function (oEntity) {
				return oEntity.checked();
			}, this);
		}, this);
		this.hasCheckedEntities = ko.computed(function () {
			return this.checkedEntities().length > 0;
		}, this);
		this.deleteCommand = Utils.createCommand(this, this.deleteCheckedEntities, this.hasCheckedEntities);
		this.deactivateCommand = Utils.createCommand(this, function () {}, this.hasCheckedEntities);
		this.selectedCount = ko.computed(function () {
			return this.checkedEntities().length;
		}, this);
		
		this.searchValue = ko.observable('');
		this.newSearchValue = ko.observable('');
		this.isSearchFocused = ko.observable(false);
		this.loading = ko.observable(false);
		this.searchText = ko.computed(function () {
			return TextUtils.i18n('ADMINPANELWEBCLIENT/INFO_SEARCH_RESULT', {
				'SEARCH': this.searchValue()
			});
		}, this);
		
		this.oPageSwitcher = new CPageSwitcherView(0, Settings.EntitiesPerPage);
		this.oPageSwitcher.currentPage.subscribe(function () {
			this.loading(true);
			this.requestEntities();
		}, this);
		this.totalEntitiesCount.subscribe(function () {
			this.oPageSwitcher.setCount(this.totalEntitiesCount());
		}, this);
		
		this.aIdListDeleteProcess = [];
	}

	CEntitiesView.prototype.ViewTemplate = 'AdminPanelWebclient_EntitiesView';
	CEntitiesView.prototype.CreateFormViewTemplate = 'AdminPanelWebclient_EntityCreateFormView';

	/**
	 * Returns entity edit view for cpecified entity type.
	 */
	CEntitiesView.prototype.getEntityCreateView = function ()
	{
		switch (this.sType)
		{
			case 'Tenant':
				return __webpack_require__(/*! modules/AdminPanelWebclient/js/views/EditTenantView.js */ 239);
			case 'User':
				return __webpack_require__(/*! modules/AdminPanelWebclient/js/views/EditUserView.js */ 240);
		}
	};

	/**
	 * Requests entity list after showing.
	 */
	CEntitiesView.prototype.onShow = function ()
	{
		this.requestEntities();
	};

	/**
	 * Requests entity list for search string.
	 */
	CEntitiesView.prototype.search = function ()
	{
		this.loading(true);
		this.oPageSwitcher.setPage(1, Settings.EntitiesPerPage);
		this.requestEntities();
	};

	/**
	 * Requests entity list without search string.
	 */
	CEntitiesView.prototype.clearSearch = function ()
	{
		this.newSearchValue('');
		this.loading(true);
		this.requestEntities();
	};

	/**
	 * Requests entity list.
	 */
	CEntitiesView.prototype.requestEntities = function ()
	{
		var oParameters = {
			Type: this.sType,
			Offset: (this.oPageSwitcher.currentPage() - 1) * Settings.EntitiesPerPage,
			Limit: Settings.EntitiesPerPage,
			Search: this.newSearchValue()
		};
		
		this.searchValue(this.newSearchValue());
		Ajax.send('GetEntityList', oParameters, function (oResponse) {
			this.loading(false);
			if (oResponse.Result && _.isArray(oResponse.Result.Items))
			{
				_.each(oResponse.Result.Items, function (oEntity) {
					oEntity.Id = Types.pInt(oEntity.Id);
					oEntity.checked = ko.observable(false);
					oEntity.trottleChecked = function (oItem, oEvent) {
						oEvent.stopPropagation();
						this.checked(!this.checked());
					};
				});
				this.entities(oResponse.Result.Items);
				this.totalEntitiesCount(Types.pInt(oResponse.Result.Count));
				if (this.entities().length === 0)
				{
					this.fChangeEntityHandler(this.sType, undefined, 'create');
				}
				else if (this.justCreatedId() !== 0)
				{
					this.fChangeEntityHandler(this.sType, this.justCreatedId());
				}
				this.aIdListDeleteProcess = [];
			}
		}, this);
	};

	/**
	 * Sets change entity hanler provided by parent view object.
	 * 
	 * @param {Function} fChangeEntityHandler Change entity handler.
	 */
	CEntitiesView.prototype.setChangeEntityHandler = function (fChangeEntityHandler)
	{
		this.fChangeEntityHandler = fChangeEntityHandler;
	};

	/**
	 * Sets new current entity indentificator.
	 * 
	 * @param {number} iId New current entity indentificator.
	 */
	CEntitiesView.prototype.changeEntity = function (iId)
	{
		this.current(Types.pInt(iId));
		this.justCreatedId(0);
	};

	/**
	 * Opens create entity form.
	 */
	CEntitiesView.prototype.openCreateForm = function ()
	{
		this.showCreateForm(true);
		this.oEntityCreateView.clearFields();
	};

	/**
	 * Hides create entity form.
	 */
	CEntitiesView.prototype.cancelCreatingEntity = function ()
	{
		this.showCreateForm(false);
	};

	/**
	 * Send request to server to create new entity.
	 */
	CEntitiesView.prototype.createEntity = function ()
	{
		if (this.oEntityCreateView && (!_.isFunction(this.oEntityCreateView.isValidSaveData) || this.oEntityCreateView.isValidSaveData()))
		{
			this.isCreating(true);
			Ajax.send(this.sType === 'Tenant' ? 'CreateTenant' : 'CreateUser', this.oEntityCreateView.getParametersForSave(), function (oResponse) {
				if (oResponse.Result)
				{
					Screens.showReport(TextUtils.i18n('ADMINPANELWEBCLIENT/REPORT_CREATE_ENTITY_' + this.sType.toUpperCase()));
					this.justCreatedId(Types.pInt(oResponse.Result));
					this.cancelCreatingEntity();
				}
				else
				{
					Api.showErrorByCode(oResponse, TextUtils.i18n('ADMINPANELWEBCLIENT/ERROR_CREATE_ENTITY_' + this.sType.toUpperCase()));
				}
				this.requestEntities();
				this.isCreating(false);
			}, this);

			this.oEntityCreateView.clearFields();
		}
	};

	/**
	 * Deletes current entity.
	 */
	CEntitiesView.prototype.deleteCurrentEntity = function ()
	{
		this.deleteEntities([this.current()]);
	};

	CEntitiesView.prototype.deleteCheckedEntities = function ()
	{
		var aIdList = _.map(this.checkedEntities(), function (oEntity) {
			return oEntity.Id;
		});
		this.deleteEntities(aIdList);
	};

	CEntitiesView.prototype.deleteEntities = function (aIdList)
	{
		if (Types.isNonEmptyArray(this.aIdListDeleteProcess))
		{
			aIdList = _.difference(aIdList, this.aIdListDeleteProcess);
			this.aIdListDeleteProcess = _.union(aIdList, this.aIdListDeleteProcess);
		}
		else
		{
			this.aIdListDeleteProcess = aIdList;
		}
		if (aIdList.length > 0)
		{
			Popups.showPopup(ConfirmPopup, [
				TextUtils.i18n('ADMINPANELWEBCLIENT/CONFIRM_DELETE_' + this.sType.toUpperCase() + '_PLURAL', {}, null, aIdList.length), 
				_.bind(this.confirmedDeleteEntities, this, aIdList), '', TextUtils.i18n('COREWEBCLIENT/ACTION_DELETE')
			]);
		}
	};

	/**
	 * Sends request to the server to delete entity if admin confirmed this action.
	 * 
	 * @param {array} aIdList
	 * @param {boolean} bDelete Indicates if admin confirmed deletion.
	 */
	CEntitiesView.prototype.confirmedDeleteEntities = function (aIdList, bDelete)
	{
		if (bDelete)
		{
			Ajax.send('DeleteEntities', {Type: this.sType, IdList: aIdList}, function (oResponse) {
				if (oResponse.Result)
				{
					Screens.showReport(TextUtils.i18n('ADMINPANELWEBCLIENT/REPORT_DELETE_ENTITIES_' + this.sType.toUpperCase() + '_PLURAL', {}, null, aIdList.length));
				}
				else
				{
					Screens.showError(TextUtils.i18n('ADMINPANELWEBCLIENT/ERROR_DELETE_ENTITIES_' + this.sType.toUpperCase() + '_PLURAL', {}, null, aIdList.length));
				}
				this.requestEntities();
			}, this);
		}
		else
		{
			this.aIdListDeleteProcess = [];
		}
	};

	CEntitiesView.prototype.groupCheck = function ()
	{
		var bCheckAll = !this.hasCheckedEntities();
		_.each(this.entities(), function (oEntity) {
			oEntity.checked(bCheckAll);
		});
	};

	module.exports = CEntitiesView;


/***/ }),

/***/ 237:
/*!*************************************************************!*\
  !*** ./modules/CoreWebclient/js/views/CPageSwitcherView.js ***!
  \*************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		$ = __webpack_require__(/*! jquery */ 1),
		ko = __webpack_require__(/*! knockout */ 46),
		
		Utils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Common.js */ 211),
		
		App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179)
	;

	/**
	 * @constructor
	 * @param {number} iCount
	 * @param {number} iPerPage
	 */
	function CPageSwitcherView(iCount, iPerPage)
	{
		this.bShown = false;
		
		this.currentPage = ko.observable(1);
		this.count = ko.observable(iCount);
		this.perPage = ko.observable(iPerPage);
		this.firstPage = ko.observable(1);
		this.lastPage = ko.observable(1);

		this.pagesCount = ko.computed(function () {
			var iCount = this.perPage() > 0 ? Math.ceil(this.count() / this.perPage()) : 0;
			return (iCount > 0) ? iCount : 1;
		}, this);

		ko.computed(function () {

			var
				iAllLimit = 20,
				iLimit = 4,
				iPagesCount = this.pagesCount(),
				iCurrentPage = this.currentPage(),
				iStart = iCurrentPage,
				iEnd = iCurrentPage
			;

			if (iPagesCount > 1)
			{
				while (true)
				{
					iAllLimit--;
					
					if (1 < iStart)
					{
						iStart--;
						iLimit--;
					}

					if (0 === iLimit)
					{
						break;
					}

					if (iPagesCount > iEnd)
					{
						iEnd++;
						iLimit--;
					}

					if (0 === iLimit)
					{
						break;
					}

					if (0 === iAllLimit)
					{
						break;
					}
				}
			}

			this.firstPage(iStart);
			this.lastPage(iEnd);
			
		}, this);

		this.visibleFirst = ko.computed(function () {
			return (this.firstPage() > 1);
		}, this);

		this.visibleLast = ko.computed(function () {
			return (this.lastPage() < this.pagesCount());
		}, this);

		this.clickPage = _.bind(this.clickPage, this);

		this.pages = ko.computed(function () {
			var
				iIndex = this.firstPage(),
				aPages = []
			;

			if (this.firstPage() < this.lastPage())
			{
				for (; iIndex <= this.lastPage(); iIndex++)
				{
					aPages.push({
						number: iIndex,
						current: (iIndex === this.currentPage()),
						clickFunc: this.clickPage
					});
				}
			}

			return aPages;
		}, this);
		
		if (!App.isMobile())
		{
			this.hotKeysBind();
		}
	}

	CPageSwitcherView.prototype.ViewTemplate = 'CoreWebclient_PageSwitcherView';

	CPageSwitcherView.prototype.hotKeysBind = function ()
	{
		$(document).on('keydown', $.proxy(function(ev) {
			if (this.bShown && !Utils.isTextFieldFocused())
			{
				var sKey = ev.keyCode;
				if (ev.ctrlKey && sKey === Enums.Key.Left)
				{
					this.clickPreviousPage();
				}
				else if (ev.ctrlKey && sKey === Enums.Key.Right)
				{
					this.clickNextPage();
				}
			}
		},this));
	};

	CPageSwitcherView.prototype.hide = function ()
	{
		this.bShown = false;
	};

	CPageSwitcherView.prototype.show = function ()
	{
		this.bShown = true;
	};

	CPageSwitcherView.prototype.clear = function ()
	{
		this.currentPage(1);
		this.count(0);
	};

	/**
	 * @param {number} iCount
	 */
	CPageSwitcherView.prototype.setCount = function (iCount)
	{
		this.count(iCount);
		if (this.currentPage() > this.pagesCount())
		{
			this.currentPage(this.pagesCount());
		}
	};

	/**
	 * @param {number} iPage
	 * @param {number} iPerPage
	 */
	CPageSwitcherView.prototype.setPage = function (iPage, iPerPage)
	{
		this.perPage(iPerPage);
		if (iPage > this.pagesCount())
		{
			this.currentPage(this.pagesCount());
		}
		else
		{
			this.currentPage(iPage);
		}
	};

	/**
	 * @param {Object} oPage
	 */
	CPageSwitcherView.prototype.clickPage = function (oPage)
	{
		var iPage = oPage.number;
		if (iPage < 1)
		{
			iPage = 1;
		}
		if (iPage > this.pagesCount())
		{
			iPage = this.pagesCount();
		}
		this.currentPage(iPage);
	};

	CPageSwitcherView.prototype.clickFirstPage = function ()
	{
		this.currentPage(1);
	};

	CPageSwitcherView.prototype.clickPreviousPage = function ()
	{
		var iPrevPage = this.currentPage() - 1;
		if (iPrevPage < 1)
		{
			iPrevPage = 1;
		}
		this.currentPage(iPrevPage);
	};

	CPageSwitcherView.prototype.clickNextPage = function ()
	{
		var iNextPage = this.currentPage() + 1;
		if (iNextPage > this.pagesCount())
		{
			iNextPage = this.pagesCount();
		}
		this.currentPage(iNextPage);
	};

	CPageSwitcherView.prototype.clickLastPage = function ()
	{
		this.currentPage(this.pagesCount());
	};

	module.exports = CPageSwitcherView;


/***/ }),

/***/ 238:
/*!************************************************!*\
  !*** ./modules/AdminPanelWebclient/js/Ajax.js ***!
  \************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		Ajax = __webpack_require__(/*! modules/CoreWebclient/js/Ajax.js */ 185),
		
		Settings = __webpack_require__(/*! modules/AdminPanelWebclient/js/Settings.js */ 231)
	;

	module.exports = {
		send: function (sMethod, oParameters, fResponseHandler, oContext) {
			Ajax.send(Settings.ServerModuleName, sMethod, oParameters, fResponseHandler, oContext);
		}
	};

/***/ }),

/***/ 239:
/*!****************************************************************!*\
  !*** ./modules/AdminPanelWebclient/js/views/EditTenantView.js ***!
  \****************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43)
	;

	/**
	 * @constructor
	 */
	function CEditTenantView()
	{
		this.sHeading = TextUtils.i18n('ADMINPANELWEBCLIENT/HEADING_CREATE_TENANT');
		this.id = ko.observable(0);
		this.name = ko.observable('');
		this.description = ko.observable('');
	}

	CEditTenantView.prototype.ViewTemplate = 'AdminPanelWebclient_EditTenantView';

	CEditTenantView.prototype.getCurrentValues = function ()
	{
		return [
			this.id(),
			this.name(),
			this.description()
		];
	};

	CEditTenantView.prototype.clearFields = function ()
	{
		this.id(0);
		this.name('');
		this.description('');
	};

	CEditTenantView.prototype.parse = function (iEntityId, oResult)
	{
		if (oResult)
		{
			this.id(iEntityId);
			this.name(oResult.Name);
			this.description(oResult.Description);
		}
		else
		{
			this.clearFields();
		}
	};

	CEditTenantView.prototype.getParametersForSave = function ()
	{
		return {
			Id: this.id(),
			Name: this.name(),
			Description: this.description()
		};
	};

	module.exports = new CEditTenantView();


/***/ }),

/***/ 240:
/*!**************************************************************!*\
  !*** ./modules/AdminPanelWebclient/js/views/EditUserView.js ***!
  \**************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		$ = __webpack_require__(/*! jquery */ 1),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		
		Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
		App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179)
	;

	/**
	 * @constructor
	 */
	function CEditUserView()
	{
		this.sHeading = TextUtils.i18n('ADMINPANELWEBCLIENT/HEADING_CREATE_USER');
		this.id = ko.observable(0);
		this.publicId = ko.observable('');
		this.aRoles = [
			{text: TextUtils.i18n('ADMINPANELWEBCLIENT/LABEL_ADMINISTRATOR'), value: Enums.UserRole.SuperAdmin},
			{text: TextUtils.i18n('ADMINPANELWEBCLIENT/LABEL_USER'), value: Enums.UserRole.NormalUser},
			{text: TextUtils.i18n('ADMINPANELWEBCLIENT/LABEL_GUEST'), value: Enums.UserRole.Customer}
		];
		this.role = ko.observable(Enums.UserRole.NormalUser);
		this.writeSeparateLog = ko.observable(false);
		
		App.broadcastEvent('AdminPanelWebclient::ConstructView::after', {'Name': this.ViewConstructorName, 'View': this});
	}

	CEditUserView.prototype.ViewTemplate = 'AdminPanelWebclient_EditUserView';
	CEditUserView.prototype.ViewConstructorName = 'CEditUserView';

	CEditUserView.prototype.getCurrentValues = function ()
	{
		return [
			this.id(),
			this.publicId(),
			this.role(),
			this.writeSeparateLog()
		];
	};

	CEditUserView.prototype.clearFields = function ()
	{
		this.id(0);
		this.publicId('');
		this.role(Enums.UserRole.NormalUser);
		this.writeSeparateLog(false);
	};

	CEditUserView.prototype.parse = function (iEntityId, oResult)
	{
		if (oResult)
		{
			this.id(iEntityId);
			this.publicId(oResult.PublicId);
			this.role(oResult.Role);
			this.writeSeparateLog(!!oResult.WriteSeparateLog);
		}
		else
		{
			this.clearFields();
		}
	};

	CEditUserView.prototype.isValidSaveData = function ()
	{
		var bValid = $.trim(this.publicId()) !== '';
		if (!bValid)
		{
			Screens.showError(TextUtils.i18n('ADMINPANELWEBCLIENT/ERROR_USER_NAME_EMPTY'));
		}
		return bValid;
	};

	CEditUserView.prototype.getParametersForSave = function ()
	{
		return {
			Id: this.id(),
			PublicId: $.trim(this.publicId()),
			Role: this.role(),
			WriteSeparateLog: this.writeSeparateLog()
		};
	};

	CEditUserView.prototype.saveEntity = function (aParents, oRoot)
	{
		_.each(aParents, function (oParent) {
			if (oParent.constructor.name === 'CEntitiesView' && _.isFunction(oParent.createEntity))
			{
				oParent.createEntity();
			}
			if (oParent.constructor.name === 'CCommonSettingsPaneView' && _.isFunction(oParent.save))
			{
				oParent.save(oRoot);
			}
		});
	};

	module.exports = new CEditUserView();


/***/ }),

/***/ 241:
/*!*********************************************************************!*\
  !*** ./modules/AdminPanelWebclient/js/views/DbAdminSettingsView.js ***!
  \*********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		$ = __webpack_require__(/*! jquery */ 1),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		
		Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
		Settings = __webpack_require__(/*! modules/CoreWebclient/js/Settings.js */ 45),
		
		Ajax = __webpack_require__(/*! modules/AdminPanelWebclient/js/Ajax.js */ 238),
		CAbstractSettingsFormView = __webpack_require__(/*! modules/AdminPanelWebclient/js/views/CAbstractSettingsFormView.js */ 232),
		
		Popups = __webpack_require__(/*! modules/CoreWebclient/js/Popups.js */ 186),
		ConfirmPopup = __webpack_require__(/*! modules/CoreWebclient/js/popups/ConfirmPopup.js */ 233)
	;

	/**
	* @constructor
	*/
	function CDbAdminSettingsView()
	{
		CAbstractSettingsFormView.call(this, Settings.ServerModuleName);
		
		this.sFakePass = 'xxxxxxxxxx';
		
		/* Editable fields */
		this.dbLogin = ko.observable(Settings.DbLogin);
		this.dbPassword = ko.observable(this.sFakePass);
		this.dbName = ko.observable(Settings.DbName);
		this.dbHost = ko.observable(Settings.DbHost);
		/*-- Editable fields */
		
		this.startError = ko.observable('');
		this.setStartError();
	}

	_.extendOwn(CDbAdminSettingsView.prototype, CAbstractSettingsFormView.prototype);

	CDbAdminSettingsView.prototype.ViewTemplate = 'AdminPanelWebclient_DbAdminSettingsView';

	CDbAdminSettingsView.prototype.setStartError = function ()
	{
		this.startError((Settings.DbLogin === '' || Settings.DbName === '' || Settings.DbHost === '') ? TextUtils.i18n('ADMINPANELWEBCLIENT/ERROR_DB_ACCESS') : '');
	};

	/**
	 * Returns error text to show on start if the tab has empty fields.
	 * 
	 * @returns {String}
	 */
	CDbAdminSettingsView.prototype.getStartError = function ()
	{
		return this.startError;
	};

	CDbAdminSettingsView.prototype.getCurrentValues = function()
	{
		return [
			this.dbLogin(),
			this.dbPassword(),
			this.dbName(),
			this.dbHost()
		];
	};

	CDbAdminSettingsView.prototype.revertGlobalValues = function()
	{
		this.dbLogin(Settings.DbLogin);
		this.dbPassword(this.sFakePass);
		this.dbName(Settings.DbName);
		this.dbHost(Settings.DbHost);
	};

	CDbAdminSettingsView.prototype.getParametersForSave = function ()
	{
		if (this.dbPassword() === this.sFakePass)
		{
			return {
				'DbLogin': $.trim(this.dbLogin()),
				'DbName': $.trim(this.dbName()),
				'DbHost': $.trim(this.dbHost())
			};
		}
		return {
			'DbLogin': $.trim(this.dbLogin()),
			'DbPassword': $.trim(this.dbPassword()),
			'DbName': $.trim(this.dbName()),
			'DbHost': $.trim(this.dbHost())
		};
	};

	/**
	 * @param {Object} oParameters
	 */
	CDbAdminSettingsView.prototype.applySavedValues = function (oParameters)
	{
		Settings.updateDb(oParameters.DbLogin, oParameters.DbName, oParameters.DbHost);
		this.setStartError();
	};

	CDbAdminSettingsView.prototype.setAccessLevel = function (sEntityType, iEntityId)
	{
		this.visible(sEntityType === '');
	};

	CDbAdminSettingsView.prototype.testConnection = function ()
	{
		Ajax.send('TestDbConnection', this.getParametersForSave(), function (oResponse) {
			if (oResponse.Result)
			{
				Screens.showReport(TextUtils.i18n('ADMINPANELWEBCLIENT/REPORT_DB_CONNECT_SUCCESSFUL'));
			}
			else
			{
				Screens.showError(TextUtils.i18n('ADMINPANELWEBCLIENT/ERROR_DB_CONNECT_FAILED'));
			}
		}, this);
	};

	CDbAdminSettingsView.prototype.createTables = function ()
	{
		var fCreateTables = function () {
			Ajax.send('CreateTables', null, function (oResponse) {
				if (oResponse.Result)
				{
					Screens.showReport(TextUtils.i18n('ADMINPANELWEBCLIENT/REPORT_CREATE_TABLES_SUCCESSFUL'));
				}
				else
				{
					Screens.showError(TextUtils.i18n('ADMINPANELWEBCLIENT/ERROR_CREATE_TABLES_FAILED'));
				}
			});
		};
		
		if (this.sSavedState !== this.getCurrentState())
		{
			Popups.showPopup(ConfirmPopup, [TextUtils.i18n('ADMINPANELWEBCLIENT/CONFIRM_SAVE_CHANGES_BEFORE_CREATE_TABLES'), _.bind(function (bOk) {
				if (bOk)
				{
					var oIsSavingSubscribtion = this.isSaving.subscribe(function (bSaving) {
						if (!bSaving)
						{
							fCreateTables();
							oIsSavingSubscribtion.dispose();
						}
					}, this);
					
					this.save();
				}
			}, this)]);
		}
		else
		{
			fCreateTables();
		}
	};

	module.exports = new CDbAdminSettingsView();


/***/ }),

/***/ 242:
/*!***************************************************************************!*\
  !*** ./modules/AdminPanelWebclient/js/views/SecurityAdminSettingsView.js ***!
  \***************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		$ = __webpack_require__(/*! jquery */ 1),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		Api = __webpack_require__(/*! modules/CoreWebclient/js/Api.js */ 181),
		
		Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
		Settings = __webpack_require__(/*! modules/CoreWebclient/js/Settings.js */ 45),
		
		CAbstractSettingsFormView = __webpack_require__(/*! modules/AdminPanelWebclient/js/views/CAbstractSettingsFormView.js */ 232)
	;

	/**
	* @constructor
	*/
	function CSecurityAdminSettingsView()
	{
		CAbstractSettingsFormView.call(this, Settings.ServerModuleName);
		
		this.aLanguages = Settings.LanguageList;
		
		/* Editable fields */
		this.login = ko.observable(Settings.AdminLogin);
		this.pass = ko.observable('');
		this.newPass = ko.observable('');
		this.confirmPass = ko.observable('');
		this.selectedLanguage = ko.observable(Settings.AdminLanguage);
		/*-- Editable fields */
		
		this.passFocused = ko.observable(false);
		this.newPassFocused = ko.observable(false);
		
		this.startError = ko.observable('');
		this.setStartError();
	}

	_.extendOwn(CSecurityAdminSettingsView.prototype, CAbstractSettingsFormView.prototype);

	CSecurityAdminSettingsView.prototype.ViewTemplate = 'AdminPanelWebclient_SecurityAdminSettingsView';

	CSecurityAdminSettingsView.prototype.setStartError = function ()
	{
		var aErrors = [];

		if (!Settings.AdminHasPassword)
		{
			aErrors.push(TextUtils.i18n('ADMINPANELWEBCLIENT/ERROR_ADMIN_EMPTY_PASSWORD'));
		}
		if (!Settings.SaltNotEmpty)
		{
			aErrors.push(TextUtils.i18n('ADMINPANELWEBCLIENT/ERROR_SALT_EMPTY'));
		}
		this.startError(aErrors.join('<br /><br />'));
	};

	/**
	 * Returns error text to show on start if there is no admin password.
	 * 
	 * @returns {String}
	 */
	CSecurityAdminSettingsView.prototype.getStartError = function ()
	{
		return this.startError;
	};

	CSecurityAdminSettingsView.prototype.getCurrentValues = function()
	{
		return [
			this.login(),
			this.pass(),
			this.newPass(),
			this.confirmPass(),
			this.selectedLanguage()
		];
	};

	CSecurityAdminSettingsView.prototype.revertGlobalValues = function()
	{
		this.login(Settings.AdminLogin);
		this.pass('');
		this.newPass('');
		this.confirmPass('');
		this.selectedLanguage(Settings.AdminLanguage);
	};

	CSecurityAdminSettingsView.prototype.getParametersForSave = function ()
	{
		var oParameters = {
			'AdminLogin': $.trim(this.login()),
			'Password': $.trim(this.pass()),
			'NewPassword': $.trim(this.newPass())
		};
		
		if (this.selectedLanguage() !== Settings.AdminLanguage)
		{
			oParameters['AdminLanguage'] = this.selectedLanguage();
		}
		
		return oParameters;
	};

	/**
	 * Applies saved values to the Settings object.
	 * 
	 * @param {Object} oParameters Parameters which were saved on the server side.
	 */
	CSecurityAdminSettingsView.prototype.applySavedValues = function (oParameters)
	{
		if (this.selectedLanguage() !== Settings.AdminLanguage)
		{
			window.location.reload();
		}
		Settings.updateSecurity(oParameters.AdminLogin, Settings.AdminHasPassword || oParameters.NewPassword !== '');
		this.setStartError();
	};

	CSecurityAdminSettingsView.prototype.setAccessLevel = function (sEntityType, iEntityId)
	{
		this.visible(sEntityType === '');
	};

	CSecurityAdminSettingsView.prototype.validateBeforeSave = function ()
	{
		var
			sPass = $.trim(this.pass()),
			sNewPass = $.trim(this.newPass()),
			sConfirmPass = $.trim(this.confirmPass())
		;
		if (Settings.AdminHasPassword && sPass === '' && sNewPass !== '')
		{
			Screens.showError(TextUtils.i18n('ADMINPANELWEBCLIENT/ERROR_CURRENT_PASSWORD_EMPTY'));
			this.passFocused(true);
			return false;
		}
		if (sPass !== '' && sNewPass === '')
		{
			Screens.showError(TextUtils.i18n('ADMINPANELWEBCLIENT/ERROR_NEW_PASSWORD_EMPTY'));
			this.newPassFocused(true);
			return false;
		}
		if (sPass !== '' && sNewPass !== sConfirmPass)
		{
			Screens.showError(TextUtils.i18n('COREWEBCLIENT/ERROR_PASSWORDS_DO_NOT_MATCH'));
			this.newPassFocused(true);
			return false;
		}
		return true;
	};

	CSecurityAdminSettingsView.prototype.onResponse = function (oResponse, oRequest)
	{
		this.isSaving(false);

		if (!oResponse.Result)
		{
			Api.showErrorByCode(oResponse, TextUtils.i18n('COREWEBCLIENT/ERROR_SAVING_SETTINGS_FAILED'));
		}
		else
		{
			var oParameters = oRequest.Parameters;

			//clear fields after saving
			this.pass('');
			this.newPass('');
			this.confirmPass('');

			this.updateSavedState();
			this.applySavedValues(oParameters);
			Screens.showReport(TextUtils.i18n('COREWEBCLIENT/REPORT_SETTINGS_UPDATE_SUCCESS'));
		}
	};

	module.exports = new CSecurityAdminSettingsView();


/***/ }),

/***/ 243:
/*!************************************************************************!*\
  !*** ./modules/AdminPanelWebclient/js/views/CommonSettingsPaneView.js ***!
  \************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44),
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		
		App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179),
		Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
		
		Ajax = __webpack_require__(/*! modules/AdminPanelWebclient/js/Ajax.js */ 238),
		CAbstractSettingsFormView = __webpack_require__(/*! modules/AdminPanelWebclient/js/views/CAbstractSettingsFormView.js */ 232)
	;

	/**
	 * @constructor
	 */
	function CCommonSettingsPaneView()
	{
		CAbstractSettingsFormView.call(this);
		
		this.type = ko.observable('User');
		this.id = ko.observable(0);
		
		this.entityCreateView = ko.computed(function ()
		{
			switch (this.type())
			{
				case 'Tenant':
					return __webpack_require__(/*! modules/AdminPanelWebclient/js/views/EditTenantView.js */ 239);
				case 'User':
					return __webpack_require__(/*! modules/AdminPanelWebclient/js/views/EditUserView.js */ 240);
			}
		}, this);
		
		this.entityCreateView.subscribe(function () {
			this.updateSavedState();
		}, this);
		
		this.updateSavedState();
	}

	_.extendOwn(CCommonSettingsPaneView.prototype, CAbstractSettingsFormView.prototype);

	CCommonSettingsPaneView.prototype.ViewTemplate = 'AdminPanelWebclient_CommonSettingsPaneView';

	/**
	 * Returns an array with the values of editable fields.
	 * 
	 * @returns {Array}
	 */
	CCommonSettingsPaneView.prototype.getCurrentValues = function ()
	{
		return this.entityCreateView() ? this.entityCreateView().getCurrentValues() : [];
	};

	/**
	 * Puts values from the global settings object to the editable fields.
	 */
	CCommonSettingsPaneView.prototype.revertGlobalValues = function ()
	{
		if (this.entityCreateView())
		{
			this.entityCreateView().clearFields();
		}
		this.updateSavedState();
	};

	CCommonSettingsPaneView.prototype.save = function (oParent)
	{
		if (this.entityCreateView() && (!_.isFunction(this.entityCreateView().isValidSaveData) || this.entityCreateView().isValidSaveData()))
		{
			Ajax.send('UpdateEntity', {Type: this.type(), Data: this.entityCreateView() ? this.entityCreateView().getParametersForSave() : {}}, function (oResponse) {
				if (oResponse.Result)
				{
					Screens.showReport(TextUtils.i18n('ADMINPANELWEBCLIENT/REPORT_UPDATE_ENTITY_' + this.type().toUpperCase()));
				}
				else
				{
					Screens.showError(TextUtils.i18n('ADMINPANELWEBCLIENT/ERROR_UPDATE_ENTITY_' + this.type().toUpperCase()));
				}

				if (oParent && _.isFunction(oParent.currentEntitiesView) && _.isFunction(oParent.currentEntitiesView().requestEntities))
				{
					oParent.currentEntitiesView().requestEntities();
				}

				this.updateSavedState();
			}, this);
		}
	};

	CCommonSettingsPaneView.prototype.setAccessLevel = function (sEntityType, iEntityId)
	{
		this.visible(sEntityType !== '');
		this.type(sEntityType);
		this.id(Types.pInt(iEntityId));
		if (Types.isPositiveNumber(this.id()))
		{
			Ajax.send('GetEntity', {Type: this.type(), Id: this.id()}, function (oResponse, oRequest) {
				if (this.id() === oRequest.Parameters.Id)
				{
					if (this.entityCreateView())
					{
						this.entityCreateView().parse(this.id(), oResponse.Result);
					}
					this.updateSavedState();
				}
			}, this);
		}
		else
		{
			this.updateSavedState();
		}
	};

	CCommonSettingsPaneView.prototype.onRoute = function ()
	{
		App.broadcastEvent('CCommonSettingsPaneView::onRoute::after', {'View': this.entityCreateView(), 'Id': this.id()});
	};

	module.exports = new CCommonSettingsPaneView();


/***/ }),

/***/ 245:
/*!**************************************************!*\
  !*** ./modules/BrandingWebclient/js/Settings.js ***!
  \**************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44)
	;

	module.exports = {
		ServerModuleName: 'BrandingWebclient',
		HashModuleName: 'branding',
		
		LoginLogo: '',
		TabsbarLogo: '',
		
		/**
		 * Initializes settings from AppData object sections.
		 * 
		 * @param {Object} oAppData Object contained modules settings.
		 */
		init: function (oAppData)
		{
			var oAppDataSection = oAppData['BrandingWebclient'];
			
			if (!_.isEmpty(oAppDataSection))
			{
				this.LoginLogo = Types.pString(oAppDataSection['LoginLogo'], this.LoginLogo);
				this.TabsbarLogo = Types.pString(oAppDataSection['TabsbarLogo'], this.TabsbarLogo);
			}
		},

		/**
		 * Updates new settings values after saving on server.
		 * 
		 * @param {array} aParameters
		 */
		update: function (aParameters)
		{
			if (!_.isEmpty(aParameters))
			{
				this.LoginLogo = aParameters['LoginLogo'];
				this.TabsbarLogo = aParameters['TabsbarLogo']
			}
		}
	};


/***/ }),

/***/ 246:
/*!*****************************************************************!*\
  !*** ./modules/BrandingWebclient/js/views/AdminSettingsView.js ***!
  \*****************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		ModulesManager = __webpack_require__(/*! modules/CoreWebclient/js/ModulesManager.js */ 42),
		CAbstractSettingsFormView = ModulesManager.run('AdminPanelWebclient', 'getAbstractSettingsFormViewClass'),
		
		Settings = __webpack_require__(/*! modules/BrandingWebclient/js/Settings.js */ 245)
	;

	/**
	* @constructor
	*/
	function СAdminSettingsView()
	{
		CAbstractSettingsFormView.call(this, Settings.ServerModuleName);
		
		/* Editable fields */
		this.loginLogo = ko.observable(Settings.LoginLogo);
		this.tabsbarLogo = ko.observable(Settings.TabsbarLogo);
		/*-- Editable fields */
	}

	_.extendOwn(СAdminSettingsView.prototype, CAbstractSettingsFormView.prototype);

	СAdminSettingsView.prototype.ViewTemplate = 'BrandingWebclient_AdminSettingsView';

	СAdminSettingsView.prototype.getCurrentValues = function()
	{
		return [
			this.loginLogo(),
			this.tabsbarLogo()
		];
	};

	СAdminSettingsView.prototype.revertGlobalValues = function()
	{
		this.loginLogo(Settings.LoginLogo);
		this.tabsbarLogo(Settings.TabsbarLogo);
	};

	СAdminSettingsView.prototype.getParametersForSave = function ()
	{
		return {
			'LoginLogo': this.loginLogo(),
			'TabsbarLogo': this.tabsbarLogo()
		};
	};

	/**
	 * Applies saved values to the Settings object.
	 * 
	 * @param {Object} oParameters Parameters which were saved on the server side.
	 */
	СAdminSettingsView.prototype.applySavedValues = function (oParameters)
	{
		Settings.update(oParameters);
	};

	СAdminSettingsView.prototype.setAccessLevel = function (sEntityType, iEntityId)
	{
		this.visible(sEntityType === '');
	};

	module.exports = new СAdminSettingsView();


/***/ }),

/***/ 266:
/*!*******************************************************!*\
  !*** ./modules/CoreWebclient/js/vendors/FileSaver.js ***!
  \*******************************************************/
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* FileSaver.js
	 * A saveAs() FileSaver implementation.
	 * 1.3.2
	 * 2016-06-16 18:25:19
	 *
	 * By Eli Grey, http://eligrey.com
	 * License: MIT
	 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
	 */

	/*global self */
	/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

	/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

	var saveAs = saveAs || (function(view) {
		"use strict";
		// IE <10 is explicitly unsupported
		if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
			return;
		}
		var
			  doc = view.document
			  // only get URL when necessary in case Blob.js hasn't overridden it yet
			, get_URL = function() {
				return view.URL || view.webkitURL || view;
			}
			, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
			, can_use_save_link = "download" in save_link
			, click = function(node) {
				var event = new MouseEvent("click");
				node.dispatchEvent(event);
			}
			, is_safari = /constructor/i.test(view.HTMLElement) || view.safari
			, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
			, throw_outside = function(ex) {
				(view.setImmediate || view.setTimeout)(function() {
					throw ex;
				}, 0);
			}
			, force_saveable_type = "application/octet-stream"
			// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
			, arbitrary_revoke_timeout = 1000 * 40 // in ms
			, revoke = function(file) {
				var revoker = function() {
					if (typeof file === "string") { // file is an object URL
						get_URL().revokeObjectURL(file);
					} else { // file is a File
						file.remove();
					}
				};
				setTimeout(revoker, arbitrary_revoke_timeout);
			}
			, dispatch = function(filesaver, event_types, event) {
				event_types = [].concat(event_types);
				var i = event_types.length;
				while (i--) {
					var listener = filesaver["on" + event_types[i]];
					if (typeof listener === "function") {
						try {
							listener.call(filesaver, event || filesaver);
						} catch (ex) {
							throw_outside(ex);
						}
					}
				}
			}
			, auto_bom = function(blob) {
				// prepend BOM for UTF-8 XML and text/* types (including HTML)
				// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
				if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
					return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
				}
				return blob;
			}
			, FileSaver = function(blob, name, no_auto_bom) {
				if (!no_auto_bom) {
					blob = auto_bom(blob);
				}
				// First try a.download, then web filesystem, then object URLs
				var
					  filesaver = this
					, type = blob.type
					, force = type === force_saveable_type
					, object_url
					, dispatch_all = function() {
						dispatch(filesaver, "writestart progress write writeend".split(" "));
					}
					// on any filesys errors revert to saving with object URLs
					, fs_error = function() {
						if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
							// Safari doesn't allow downloading of blob urls
							var reader = new FileReader();
							reader.onloadend = function() {
								var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
								var popup = view.open(url, '_blank');
								if(!popup) view.location.href = url;
								url=undefined; // release reference before dispatching
								filesaver.readyState = filesaver.DONE;
								dispatch_all();
							};
							reader.readAsDataURL(blob);
							filesaver.readyState = filesaver.INIT;
							return;
						}
						// don't create more object URLs than needed
						if (!object_url) {
							object_url = get_URL().createObjectURL(blob);
						}
						if (force) {
							view.location.href = object_url;
						} else {
							var opened = view.open(object_url, "_blank");
							if (!opened) {
								// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
								view.location.href = object_url;
							}
						}
						filesaver.readyState = filesaver.DONE;
						dispatch_all();
						revoke(object_url);
					}
				;
				filesaver.readyState = filesaver.INIT;

				if (can_use_save_link) {
					object_url = get_URL().createObjectURL(blob);
					setTimeout(function() {
						save_link.href = object_url;
						save_link.download = name;
						click(save_link);
						dispatch_all();
						revoke(object_url);
						filesaver.readyState = filesaver.DONE;
					});
					return;
				}

				fs_error();
			}
			, FS_proto = FileSaver.prototype
			, saveAs = function(blob, name, no_auto_bom) {
				return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
			}
		;
		// IE 10+ (native saveAs)
		if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
			return function(blob, name, no_auto_bom) {
				name = name || blob.name || "download";

				if (!no_auto_bom) {
					blob = auto_bom(blob);
				}
				return navigator.msSaveOrOpenBlob(blob, name);
			};
		}

		FS_proto.abort = function(){};
		FS_proto.readyState = FS_proto.INIT = 0;
		FS_proto.WRITING = 1;
		FS_proto.DONE = 2;

		FS_proto.error =
		FS_proto.onwritestart =
		FS_proto.onprogress =
		FS_proto.onwrite =
		FS_proto.onabort =
		FS_proto.onerror =
		FS_proto.onwriteend =
			null;

		return saveAs;
	}(
		   typeof self !== "undefined" && self
		|| typeof window !== "undefined" && window
		|| this.content
	));
	// `self` is undefined in Firefox for Android content script context
	// while `this` is nsIContentFrameMessageManager
	// with an attribute `content` that corresponds to the window

	if (typeof module !== "undefined" && module.exports) {
	  module.exports.saveAs = saveAs;
	} else if (("function" !== "undefined" && __webpack_require__(/*! !webpack amd define */ 48) !== null) && (__webpack_require__(/*! !webpack amd options */ 267) !== null)) {
	  !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	    return saveAs;
	  }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}


/***/ }),

/***/ 267:
/*!****************************************!*\
  !*** (webpack)/buildin/amd-options.js ***!
  \****************************************/
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;

	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ }),

/***/ 289:
/*!****************************************!*\
  !*** ./modules/Dropbox/js/Settings.js ***!
  \****************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44)
	;

	module.exports = {
		ServerModuleName: 'Dropbox',
		HashModuleName: 'dropbox',
		
		Connected: false,
		
		EnableModule: false,
		Id: '',
		Secret: '',
		Scopes: [],
		
		/**
		 * Initializes settings from AppData object sections.
		 * 
		 * @param {Object} oAppData Object contained modules settings.
		 */
		init: function (oAppData)
		{
			var oAppDataSection = oAppData['Dropbox'];
			
			if (!_.isEmpty(oAppDataSection))
			{
				this.Connected = Types.pBool(oAppDataSection.Connected, this.Connected);
				
				this.EnableModule = Types.pBool(oAppDataSection.EnableModule, this.EnableModule);
				this.Id = Types.pString(oAppDataSection.Id, this.Id);
				this.Secret = Types.pString(oAppDataSection.Secret, this.Secret);
				this.Scopes = Types.pArray(oAppDataSection.Scopes, this.Scopes);
			}
		},
		
		/**
		 * Returns copy of Scopes with observable Value parameter.
		 * 
		 * @returns {Array}
		 */
		getScopesCopy: function ()
		{
			var aScopesCopy = [];
			_.each(this.Scopes, function (oScope) {
				aScopesCopy.push({
					Description: oScope.Description,
					Name: oScope.Name,
					Value: ko.observable(oScope.Value)
				});
			});
			return aScopesCopy;
		},
		
		/**
		 * Updates Connected and Scopes parameters.
		 * 
		 * @param {boolean} bConnected New value of Connected parameter.
		 * @param {array} aScopes New value of Scopes parameter.
		 */
		updateScopes: function (bConnected, aScopes)
		{
			var aNewScopes = [];
			_.each(aScopes, function (oScope) {
				aNewScopes.push({
					Description: oScope.Description,
					Name: oScope.Name,
					Value: oScope.Value()
				});
			});
			this.Connected = bConnected;
			this.Scopes = aNewScopes;
		},
		
		/**
		 * Updates settings that is edited by administrator.
		 * 
		 * @param {boolean} bEnableModule New value of EnableModule parameter.
		 * @param {string} sId New value of Id parameter.
		 * @param {string} sSecret New value of Secret parameter.
		 * @param {array} aScopes New value of Scopes parameter.
		 */
		updateAdmin: function (bEnableModule, sId, sSecret, aScopes)
		{
			this.EnableModule = bEnableModule;
			this.Id = sId;
			this.Secret = sSecret;
			this.Scopes = aScopes;
		}
	};


/***/ }),

/***/ 291:
/*!*******************************************************!*\
  !*** ./modules/Dropbox/js/views/AdminSettingsView.js ***!
  \*******************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		
		ModulesManager = __webpack_require__(/*! modules/CoreWebclient/js/ModulesManager.js */ 42),
		Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
		
		CAbstractSettingsFormView = ModulesManager.run('AdminPanelWebclient', 'getAbstractSettingsFormViewClass'),
		
		Settings = __webpack_require__(/*! modules/Dropbox/js/Settings.js */ 289)
	;

	/**
	* @constructor
	*/
	function CAdminSettingsView()
	{
		CAbstractSettingsFormView.call(this, Settings.ServerModuleName);
		
		/* Editable fields */
		this.enable = ko.observable(Settings.EnableModule);
		this.id = ko.observable(Settings.Id);
		this.secret = ko.observable(Settings.Secret);
		this.scopes = ko.observable(Settings.getScopesCopy());
		/*-- Editable fields */
	}

	_.extendOwn(CAdminSettingsView.prototype, CAbstractSettingsFormView.prototype);

	CAdminSettingsView.prototype.ViewTemplate = 'Dropbox_AdminSettingsView';

	/**
	 * Returns current values of changeable parameters. These values are used to compare with their previous version.
	 * @returns {Array}
	 */
	CAdminSettingsView.prototype.getCurrentValues = function()
	{
		var aScopesValues = _.map(this.scopes(), function (oScope) {
			return oScope.Name + oScope.Value();
		});
		return [
			this.enable(),
			this.id(),
			this.secret(),
			aScopesValues
		];
	};

	/**
	 * Reverts values of changeable parameters to default ones.
	 */
	CAdminSettingsView.prototype.revertGlobalValues = function()
	{
		this.enable(Settings.EnableModule);
		this.id(Settings.Id);
		this.secret(Settings.Secret);
		this.scopes(Settings.getScopesCopy());
	};

	/**
	 * Validates changeable parameters before their saving.
	 * @returns {Boolean}
	 */
	CAdminSettingsView.prototype.validateBeforeSave = function ()
	{
		if (this.enable() && (this.id() === '' || this.secret() === ''))
		{
			Screens.showError(TextUtils.i18n('COREWEBCLIENT/ERROR_REQUIRED_FIELDS_EMPTY'));
			return false;
		}
		return true;
	};

	/**
	 * Returns changeable parameters as object to save them on the server-side.
	 * @returns {object}
	 */
	CAdminSettingsView.prototype.getParametersForSave = function ()
	{
		return {
			'EnableModule': this.enable(),
			'Id': this.id(),
			'Secret': this.secret(),
			'Scopes': _.map(this.scopes(), function(oScope) {
				return {
					Name: oScope.Name,
					Description: oScope.Description,
					Value: oScope.Value()
				};
			})
		};
	};

	/**
	 * Uses just saved changeable parameters to update default ones.
	 * @param {object} oParameters
	 */
	CAdminSettingsView.prototype.applySavedValues = function (oParameters)
	{
		Settings.updateAdmin(oParameters.EnableModule, oParameters.Id, oParameters.Secret, oParameters.Scopes);
	};

	/**
	 * Sets access level for the view via entity type and entity identifier.
	 * This view is visible only for empty entity type.
	 * @param {string} sEntityType Current entity type.
	 * @param {number} iEntityId Indentificator of current intity.
	 */
	CAdminSettingsView.prototype.setAccessLevel = function (sEntityType, iEntityId)
	{
		this.visible(sEntityType === '');
	};

	module.exports = new CAdminSettingsView();


/***/ }),

/***/ 293:
/*!*****************************************!*\
  !*** ./modules/Facebook/js/Settings.js ***!
  \*****************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44)
	;

	module.exports = {
		ServerModuleName: 'Facebook',
		HashModuleName: 'facebook',
		
		Connected: false,
		
		EnableModule: false,
		Id: '',
		Secret: '',
		Scopes: [],
		
		/**
		 * Initializes settings from AppData object sections.
		 * 
		 * @param {Object} oAppData Object contained modules settings.
		 */
		init: function (oAppData)
		{
			var oAppDataSection = oAppData['Facebook'];
			
			if (!_.isEmpty(oAppDataSection))
			{
				this.Connected = Types.pBool(oAppDataSection.Connected, this.Connected);
				
				this.EnableModule = Types.pBool(oAppDataSection.EnableModule, this.EnableModule);
				this.Id = Types.pString(oAppDataSection.Id, this.Id);
				this.Secret = Types.pString(oAppDataSection.Secret, this.Secret);
				this.Scopes = Types.pArray(oAppDataSection.Scopes, this.Scopes);
			}
		},
		
		/**
		 * Returns copy of Scopes with observable Value parameter.
		 * 
		 * @returns {Array}
		 */
		getScopesCopy: function ()
		{
			var aScopesCopy = [];
			_.each(this.Scopes, function (oScope) {
				aScopesCopy.push({
					Description: oScope.Description,
					Name: oScope.Name,
					Value: ko.observable(oScope.Value)
				});
			});
			return aScopesCopy;
		},
		
		/**
		 * Updates Connected and Scopes parameters.
		 * 
		 * @param {boolean} bConnected New value of Connected parameter.
		 * @param {array} aScopes New value of Scopes parameter.
		 */
		updateScopes: function (bConnected, aScopes)
		{
			var aNewScopes = [];
			_.each(aScopes, function (oScope) {
				aNewScopes.push({
					Description: oScope.Description,
					Name: oScope.Name,
					Value: oScope.Value()
				});
			});
			this.Connected = bConnected;
			this.Scopes = aNewScopes;
		},
		
		/**
		 * Updates settings that is edited by administrator.
		 * 
		 * @param {boolean} bEnableModule New value of EnableModule parameter.
		 * @param {string} sId New value of Id parameter.
		 * @param {string} sSecret New value of Secret parameter.
		 * @param {array} aScopes New value of Scopes parameter.
		 */
		updateAdmin: function (bEnableModule, sId, sSecret, aScopes)
		{
			this.EnableModule = bEnableModule;
			this.Id = sId;
			this.Secret = sSecret;
			this.Scopes = aScopes;
		}
	};


/***/ }),

/***/ 295:
/*!********************************************************!*\
  !*** ./modules/Facebook/js/views/AdminSettingsView.js ***!
  \********************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		
		ModulesManager = __webpack_require__(/*! modules/CoreWebclient/js/ModulesManager.js */ 42),
		Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
		
		CAbstractSettingsFormView = ModulesManager.run('AdminPanelWebclient', 'getAbstractSettingsFormViewClass'),
		
		Settings = __webpack_require__(/*! modules/Facebook/js/Settings.js */ 293)
	;

	/**
	* @constructor
	*/
	function CAdminSettingsView()
	{
		CAbstractSettingsFormView.call(this, Settings.ServerModuleName);
		
		/* Editable fields */
		this.enable = ko.observable(Settings.EnableModule);
		this.id = ko.observable(Settings.Id);
		this.secret = ko.observable(Settings.Secret);
		this.scopes = ko.observable(Settings.getScopesCopy());
		/*-- Editable fields */
	}

	_.extendOwn(CAdminSettingsView.prototype, CAbstractSettingsFormView.prototype);

	CAdminSettingsView.prototype.ViewTemplate = 'Facebook_AdminSettingsView';

	/**
	 * Returns current values of changeable parameters. These values are used to compare with their previous version.
	 * @returns {Array}
	 */
	CAdminSettingsView.prototype.getCurrentValues = function()
	{
		var aScopesValues = _.map(this.scopes(), function (oScope) {
			return oScope.Name + oScope.Value();
		});
		return [
			this.enable(),
			this.id(),
			this.secret(),
			aScopesValues
		];
	};

	/**
	 * Reverts values of changeable parameters to default ones.
	 */
	CAdminSettingsView.prototype.revertGlobalValues = function()
	{
		this.enable(Settings.EnableModule);
		this.id(Settings.Id);
		this.secret(Settings.Secret);
		this.scopes(Settings.getScopesCopy());
	};

	/**
	 * Validates changeable parameters before their saving.
	 * @returns {Boolean}
	 */
	CAdminSettingsView.prototype.validateBeforeSave = function ()
	{
		if (this.enable() && (this.id() === '' || this.secret() === ''))
		{
			Screens.showError(TextUtils.i18n('COREWEBCLIENT/ERROR_REQUIRED_FIELDS_EMPTY'));
			return false;
		}
		return true;
	};

	/**
	 * Returns changeable parameters as object to save them on the server-side.
	 * @returns {object}
	 */
	CAdminSettingsView.prototype.getParametersForSave = function ()
	{
		return {
			'EnableModule': this.enable(),
			'Id': this.id(),
			'Secret': this.secret(),
			'Scopes': _.map(this.scopes(), function(oScope) {
				return {
					Name: oScope.Name,
					Description: oScope.Description,
					Value: oScope.Value()
				};
			})
		};
	};

	/**
	 * Uses just saved changeable parameters to update default ones.
	 * @param {object} oParameters
	 */
	CAdminSettingsView.prototype.applySavedValues = function (oParameters)
	{
		Settings.updateAdmin(oParameters.EnableModule, oParameters.Id, oParameters.Secret, oParameters.Scopes);
	};

	/**
	 * Sets access level for the view via entity type and entity identifier.
	 * This view is visible only for empty entity type.
	 * @param {string} sEntityType Current entity type.
	 * @param {number} iEntityId Indentificator of current intity.
	 */
	CAdminSettingsView.prototype.setAccessLevel = function (sEntityType, iEntityId)
	{
		this.visible(sEntityType === '');
	};

	module.exports = new CAdminSettingsView();


/***/ }),

/***/ 313:
/*!***********************************************!*\
  !*** ./modules/FilesWebclient/js/Settings.js ***!
  \***********************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		ko = __webpack_require__(/*! knockout */ 46),
		_ = __webpack_require__(/*! underscore */ 2),
		
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44)
	;

	module.exports = {
		ServerModuleName: 'Files',
		HashModuleName: 'files',
		
		CustomTabTitle: '',
		enableModule: ko.observable(true),
		EnableUploadSizeLimit: false,
		PublicFolderName: '',
		PublicHash: '',
		UploadSizeLimitMb: 0,
		UserSpaceLimitMb: 0,
		
		EditFileNameWithoutExtention: false,
		ShowCommonSettings: true,
		ShowFilesApps: true,
		
		/**
		 * Initializes settings from AppData object sections.
		 * 
		 * @param {Object} oAppData Object contained modules settings.
		 */
		init: function (oAppData)
		{
			var
				oAppDataFilesSection = oAppData[this.ServerModuleName],
				oAppDataFilesWebclientSection = oAppData['FilesWebclient']
			;
			
			if (!_.isEmpty(oAppDataFilesSection))
			{
				this.CustomTabTitle = Types.pString(oAppDataFilesSection.CustomTabTitle, this.CustomTabTitle);
				this.enableModule =  ko.observable(Types.pBool(oAppDataFilesSection.EnableModule, this.enableModule()));
				this.EnableUploadSizeLimit = Types.pBool(oAppDataFilesSection.EnableUploadSizeLimit, this.EnableUploadSizeLimit);
				this.PublicFolderName = Types.pString(oAppDataFilesSection.PublicFolderName, this.PublicFolderName);
				this.PublicHash = Types.pString(oAppDataFilesSection.PublicHash, this.PublicHash);
				this.UploadSizeLimitMb = Types.pNonNegativeInt(oAppDataFilesSection.UploadSizeLimitMb, this.UploadSizeLimitMb);
				this.UserSpaceLimitMb = Types.pNonNegativeInt(oAppDataFilesSection.UserSpaceLimitMb, this.UserSpaceLimitMb);
			}
				
			if (!_.isEmpty(oAppDataFilesWebclientSection))
			{
				this.EditFileNameWithoutExtention = Types.pBool(oAppDataFilesWebclientSection.EditFileNameWithoutExtention, this.EditFileNameWithoutExtention);
				this.ShowCommonSettings = Types.pBool(oAppDataFilesWebclientSection.ShowCommonSettings, this.ShowCommonSettings);
				this.ShowFilesApps = Types.pBool(oAppDataFilesWebclientSection.ShowFilesApps, this.ShowFilesApps);
			}
		},
		
		/**
		 * Updates new settings values after saving on server.
		 * 
		 * @param {string} sEnableModule
		 */
		update: function (sEnableModule)
		{
			this.enableModule(sEnableModule === '1');
		},
		
		/**
		 * Updates settings from settings tab in admin panel.
		 * 
		 * @param {boolean} bEnableUploadSizeLimit Indicates if upload size limit is enabled.
		 * @param {number} iUploadSizeLimitMb Value of upload size limit in Mb.
		 * @param {number} iUserSpaceLimitMb Value of user space limit in Mb.
		 */
		updateAdmin: function (bEnableUploadSizeLimit, iUploadSizeLimitMb, iUserSpaceLimitMb)
		{
			this.EnableUploadSizeLimit = bEnableUploadSizeLimit;
			this.UploadSizeLimitMb = iUploadSizeLimitMb;
			this.UserSpaceLimitMb = iUserSpaceLimitMb;
		}
	};


/***/ }),

/***/ 329:
/*!*******************************************************************!*\
  !*** ./modules/FilesWebclient/js/views/FilesAdminSettingsView.js ***!
  \*******************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44),
		
		ModulesManager = __webpack_require__(/*! modules/CoreWebclient/js/ModulesManager.js */ 42),
		CAbstractSettingsFormView = ModulesManager.run('AdminPanelWebclient', 'getAbstractSettingsFormViewClass'),
		
		Settings = __webpack_require__(/*! modules/FilesWebclient/js/Settings.js */ 313)
	;

	/**
	* @constructor
	*/
	function CFilesAdminSettingsView()
	{
		CAbstractSettingsFormView.call(this, Settings.ServerModuleName);
		
		/* Editable fields */
		this.enableUploadSizeLimit = ko.observable(Settings.EnableUploadSizeLimit);
		this.uploadSizeLimitMb = ko.observable(Settings.UploadSizeLimitMb);
		this.userSpaceLimitMb = ko.observable(Settings.UserSpaceLimitMb);
		/*-- Editable fields */
	}

	_.extendOwn(CFilesAdminSettingsView.prototype, CAbstractSettingsFormView.prototype);

	CFilesAdminSettingsView.prototype.ViewTemplate = 'FilesWebclient_FilesAdminSettingsView';

	CFilesAdminSettingsView.prototype.getCurrentValues = function()
	{
		return [
			this.enableUploadSizeLimit(),
			this.uploadSizeLimitMb(),
			this.userSpaceLimitMb()
		];
	};

	CFilesAdminSettingsView.prototype.revertGlobalValues = function()
	{
		this.enableUploadSizeLimit(Settings.EnableUploadSizeLimit);
		this.uploadSizeLimitMb(Settings.UploadSizeLimitMb);
		this.userSpaceLimitMb(Settings.UserSpaceLimitMb);
	};

	CFilesAdminSettingsView.prototype.getParametersForSave = function ()
	{
		return {
			'EnableUploadSizeLimit': this.enableUploadSizeLimit(),
			'UploadSizeLimitMb': Types.pInt(this.uploadSizeLimitMb()),
			'UserSpaceLimitMb': Types.pInt(this.userSpaceLimitMb())
		};
	};

	/**
	 * Applies saved values to the Settings object.
	 * 
	 * @param {Object} oParameters Parameters which were saved on the server side.
	 */
	CFilesAdminSettingsView.prototype.applySavedValues = function (oParameters)
	{
		Settings.updateAdmin(oParameters.EnableUploadSizeLimit, oParameters.UploadSizeLimitMb, oParameters.UserSpaceLimitMb);
	};

	/**
	 * Sets access level for the view via entity type and entity identifier.
	 * This view is visible only for empty entity type.
	 * 
	 * @param {string} sEntityType Current entity type.
	 * @param {number} iEntityId Indentificator of current intity.
	 */
	CFilesAdminSettingsView.prototype.setAccessLevel = function (sEntityType, iEntityId)
	{
		this.visible(sEntityType === '');
	};

	module.exports = new CFilesAdminSettingsView();


/***/ }),

/***/ 331:
/*!***************************************!*\
  !*** ./modules/Google/js/Settings.js ***!
  \***************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44)
	;

	module.exports = {
		ServerModuleName: 'Google',
		HashModuleName: 'google',
		
		Connected: false,
		
		EnableModule: false,
		Id: '',
		Secret: '',
		Key: '',
		Scopes: [],
		
		/**
		 * Initializes settings from AppData object sections.
		 * 
		 * @param {Object} oAppData Object contained modules settings.
		 */
		init: function (oAppData)
		{
			var oAppDataSection = _.extend({}, oAppData[this.ServerModuleName] || {}, oAppData['Google'] || {});
			
			if (!_.isEmpty(oAppDataSection))
			{
				this.Connected = Types.pBool(oAppDataSection.Connected, this.Connected);
				
				this.EnableModule = Types.pBool(oAppDataSection.EnableModule, this.EnableModule);
				this.Id = Types.pString(oAppDataSection.Id, this.Id);
				this.Secret = Types.pString(oAppDataSection.Secret, this.Secret);
				this.Key = Types.pString(oAppDataSection.Key, this.Key);
				this.Scopes = Types.pArray(oAppDataSection.Scopes, this.Scopes);
			}
		},
		
		/**
		 * Returns copy of Scopes with observable Value parameter.
		 * 
		 * @returns {Array}
		 */
		getScopesCopy: function ()
		{
			var aScopesCopy = [];
			_.each(this.Scopes, function (oScope) {
				aScopesCopy.push({
					Description: oScope.Description,
					Name: oScope.Name,
					Value: ko.observable(oScope.Value)
				});
			});
			return aScopesCopy;
		},
		
		/**
		 * Updates Connected and Scopes parameters.
		 * 
		 * @param {boolean} bConnected New value of Connected parameter.
		 * @param {array} aScopes New value of Scopes parameter.
		 */
		updateScopes: function (bConnected, aScopes)
		{
			var aNewScopes = [];
			_.each(aScopes, function (oScope) {
				aNewScopes.push({
					Description: oScope.Description,
					Name: oScope.Name,
					Value: oScope.Value()
				});
			});
			this.Connected = bConnected;
			this.Scopes = aNewScopes;
		},
		
		/**
		 * Updates settings that is edited by administrator.
		 * 
		 * @param {boolean} bEnableModule New value of EnableModule parameter.
		 * @param {string} sId New value of Id parameter.
		 * @param {string} sSecret New value of Secret parameter.
		 * @param {string} sKey New value of Key parameter.
		 * @param {array} aScopes New value of Scopes parameter.
		 */
		updateAdmin: function (bEnableModule, sId, sSecret, sKey, aScopes)
		{
			this.EnableModule = bEnableModule;
			this.Id = sId;
			this.Secret = sSecret;
			this.Key = sKey;
			this.Scopes = aScopes;
		}
	};


/***/ }),

/***/ 333:
/*!******************************************************!*\
  !*** ./modules/Google/js/views/AdminSettingsView.js ***!
  \******************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		
		ModulesManager = __webpack_require__(/*! modules/CoreWebclient/js/ModulesManager.js */ 42),
		Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
		
		CAbstractSettingsFormView = ModulesManager.run('AdminPanelWebclient', 'getAbstractSettingsFormViewClass'),
		
		Settings = __webpack_require__(/*! modules/Google/js/Settings.js */ 331)
	;

	/**
	* @constructor
	*/
	function CAdminSettingsView()
	{
		CAbstractSettingsFormView.call(this, Settings.ServerModuleName);
		
		/* Editable fields */
		this.enable = ko.observable(Settings.EnableModule);
		this.id = ko.observable(Settings.Id);
		this.secret = ko.observable(Settings.Secret);
		this.key = ko.observable(Settings.Key);
		this.scopes = ko.observable(Settings.getScopesCopy());
		/*-- Editable fields */
	}

	_.extendOwn(CAdminSettingsView.prototype, CAbstractSettingsFormView.prototype);

	CAdminSettingsView.prototype.ViewTemplate = 'Google_AdminSettingsView';

	/**
	 * Returns current values of changeable parameters. These values are used to compare with their previous version.
	 * @returns {Array}
	 */
	CAdminSettingsView.prototype.getCurrentValues = function()
	{
		var aScopesValues = _.map(this.scopes(), function (oScope) {
			return oScope.Name + oScope.Value();
		});
		return [
			this.enable(),
			this.id(),
			this.secret(),
			this.key(),
			aScopesValues
		];
	};

	/**
	 * Reverts values of changeable parameters to default ones.
	 */
	CAdminSettingsView.prototype.revertGlobalValues = function()
	{
		this.enable(Settings.EnableModule);
		this.id(Settings.Id);
		this.secret(Settings.Secret);
		this.key(Settings.Key);
		this.scopes(Settings.getScopesCopy());
	};

	/**
	 * Validates changeable parameters before their saving.
	 * @returns {Boolean}
	 */
	CAdminSettingsView.prototype.validateBeforeSave = function ()
	{
		if (this.enable() && (this.id() === '' || this.secret() === '' || this.key() === ''))
		{
			Screens.showError(TextUtils.i18n('COREWEBCLIENT/ERROR_REQUIRED_FIELDS_EMPTY'));
			return false;
		}
		return true;
	};

	/**
	 * Returns changeable parameters as object to save them on the server-side.
	 * @returns {object}
	 */
	CAdminSettingsView.prototype.getParametersForSave = function ()
	{
		return {
			'EnableModule': this.enable(),
			'Id': this.id(),
			'Secret': this.secret(),
			'Key': this.key(),
			'Scopes': _.map(this.scopes(), function(oScope) {
				return {
					Name: oScope.Name,
					Description: oScope.Description,
					Value: oScope.Value()
				};
			})
		};
	};

	/**
	 * Uses just saved changeable parameters to update default ones.
	 * @param {object} oParameters
	 */
	CAdminSettingsView.prototype.applySavedValues = function (oParameters)
	{
		Settings.updateAdmin(oParameters.EnableModule, oParameters.Id, oParameters.Secret, oParameters.Key, oParameters.Scopes);
	};

	/**
	 * Sets access level for the view via entity type and entity identifier.
	 * This view is visible only for empty entity type.
	 * @param {string} sEntityType Current entity type.
	 * @param {number} iEntityId Indentificator of current intity.
	 */
	CAdminSettingsView.prototype.setAccessLevel = function (sEntityType, iEntityId)
	{
		this.visible(sEntityType === '');
	};

	module.exports = new CAdminSettingsView();


/***/ }),

/***/ 337:
/*!****************************************************!*\
  !*** ./modules/LogsViewerWebclient/js/Settings.js ***!
  \****************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44)
	;

	module.exports = {
		ServerModuleName: 'LogsViewerWebclient',
		HashModuleName: 'logs-viewer',
		
		EnableLogging: false,
		EnableEventLogging: false,
		LoggingLevel: 0,
		LogSizeBytes: 0,
		EventLogSizeBytes: 0,
		LogFileName: '',
		EventLogFileName: '',
		
		/**
		 * Initializes settings from AppData object sections.
		 * 
		 * @param {Object} oAppData Object contained modules settings.
		 */
		init: function (oAppData)
		{
			var oAppDataSection = oAppData['Core'];
			
			if (!_.isEmpty(oAppDataSection))
			{
				this.ELogLevel = Types.pObject(oAppDataSection.ELogLevel);
				
				this.EnableLogging = Types.pBool(oAppDataSection.EnableLogging);
				this.EnableEventLogging = Types.pBool(oAppDataSection.EnableEventLogging);
				this.LoggingLevel = Types.pEnum(oAppDataSection.LoggingLevel, this.ELogLevel, this.LoggingLevel);
				this.updateLogsData(Types.pObject(oAppDataSection.LogFilesData));
			}
		},
		
		/**
		 * Updates new settings values after saving on server.
		 * 
		 * @param {boolean} bEnableLogging
		 * @param {boolean} bEnableEventLogging
		 * @param {number} iLoggingLevel
		 */
		updateLogging: function (bEnableLogging, bEnableEventLogging, iLoggingLevel)
		{
			this.EnableLogging = !!bEnableLogging;
			this.EnableEventLogging = !!bEnableEventLogging;
			this.LoggingLevel = Types.pInt(iLoggingLevel);
		},
		
		/**
		 * Updates new settings values after requesting from server.
		 * 
		 * @param {Object} oLogFilesData
		 */
		updateLogsData: function (oLogFilesData)
		{
			this.LogSizeBytes = Types.pInt(oLogFilesData.LogSizeBytes);
			this.EventLogSizeBytes = Types.pInt(oLogFilesData.EventLogSizeBytes);
			this.LogFileName = Types.pString(oLogFilesData.LogFileName);
			this.EventLogFileName = Types.pString(oLogFilesData.EventLogFileName);
		}
	};


/***/ }),

/***/ 339:
/*!*******************************************************************!*\
  !*** ./modules/LogsViewerWebclient/js/views/AdminSettingsView.js ***!
  \*******************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		$ = __webpack_require__(/*! jquery */ 1),
		ko = __webpack_require__(/*! knockout */ 46),
		FileSaver = __webpack_require__(/*! modules/CoreWebclient/js/vendors/FileSaver.js */ 266),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44),
		
		Ajax = __webpack_require__(/*! modules/CoreWebclient/js/Ajax.js */ 185),
		WindowOpener = __webpack_require__(/*! modules/CoreWebclient/js/WindowOpener.js */ 194),
		
		Settings = __webpack_require__(/*! modules/LogsViewerWebclient/js/Settings.js */ 337),
		
		ModulesManager = __webpack_require__(/*! modules/CoreWebclient/js/ModulesManager.js */ 42),
		CAbstractSettingsFormView = ModulesManager.run('AdminPanelWebclient', 'getAbstractSettingsFormViewClass')
	;

	/**
	* @constructor
	*/
	function CLoggingAdminSettingsView()
	{
		CAbstractSettingsFormView.call(this, 'Core');
		
		this.iViewLogSizeBytes = 10240;
		this.aLevelOptions = [
			{text: TextUtils.i18n('LOGSVIEWERWEBCLIENT/LABEL_LOGGING_DEBUG'), value: Enums.LogLevel.Full},
			{text: TextUtils.i18n('LOGSVIEWERWEBCLIENT/LABEL_LOGGING_WARNINGS'), value: Enums.LogLevel.Warning},
			{text: TextUtils.i18n('LOGSVIEWERWEBCLIENT/LABEL_LOGGING_ERRORS'), value: Enums.LogLevel.Error}
		];
		
		this.logSize = ko.observable(Settings.LogSizeBytes);
		this.downloadLogText = ko.computed(function () {
			return TextUtils.i18n('LOGSVIEWERWEBCLIENT/BUTTON_LOGGING_DOWNLOAD', {'SIZE': TextUtils.getFriendlySize(this.logSize())});
		}, this);
		this.viewLogText = ko.computed(function () {
			if (this.logSize() < this.iViewLogSizeBytes)
			{
				return TextUtils.i18n('LOGSVIEWERWEBCLIENT/BUTTON_LOGGING_VIEW');
			}
			else
			{
				return TextUtils.i18n('LOGSVIEWERWEBCLIENT/BUTTON_LOGGING_VIEW_LAST', {'SIZE': TextUtils.getFriendlySize(this.iViewLogSizeBytes)});
			}
		}, this);
		this.eventsLogSize = ko.observable(Settings.EventLogSizeBytes);
		this.downloadEventsLogText = ko.computed(function () {
			return TextUtils.i18n('LOGSVIEWERWEBCLIENT/BUTTON_LOGGING_DOWNLOAD_EVENTS', {'SIZE': TextUtils.getFriendlySize(this.eventsLogSize())});
		}, this);
		this.viewEventsLogText = ko.computed(function () {
			if (this.eventsLogSize() < this.iViewLogSizeBytes)
			{
				return TextUtils.i18n('LOGSVIEWERWEBCLIENT/BUTTON_LOGGING_VIEW');
			}
			else
			{
				return TextUtils.i18n('LOGSVIEWERWEBCLIENT/BUTTON_LOGGING_VIEW_LAST', {'SIZE': TextUtils.getFriendlySize(this.iViewLogSizeBytes)});
			}
		}, this);
		
		this.usersWithSeparateLog = ko.observableArray([]);
		
		/* Editable fields */
		this.enableLogging = ko.observable(Settings.EnableLogging);
		this.enableEventLogging = ko.observable(Settings.EnableEventLogging);
		this.loggingLevel = ko.observable(Settings.LoggingLevel);
		/*-- Editable fields */
	}

	_.extendOwn(CLoggingAdminSettingsView.prototype, CAbstractSettingsFormView.prototype);

	CLoggingAdminSettingsView.prototype.ViewTemplate = 'LogsViewerWebclient_AdminSettingsView';

	CLoggingAdminSettingsView.prototype.onRouteChild = function ()
	{
		this.setUpdateStatusTimer();
		Ajax.send(Settings.ServerModuleName, 'GetUsersWithSeparateLog', null, function (oResponse) {
			if (oResponse.Result && _.isArray(oResponse.Result))
			{
				this.usersWithSeparateLog(oResponse.Result);
			}
		}, this);
	};

	CLoggingAdminSettingsView.prototype.turnOffSeparateLogs = function ()
	{
		this.usersWithSeparateLog([]);
		Ajax.send(Settings.ServerModuleName, 'TurnOffSeparateLogs');
	};

	CLoggingAdminSettingsView.prototype.clearSeparateLogs = function ()
	{
		Ajax.send(Settings.ServerModuleName, 'ClearSeparateLogs');
	};

	CLoggingAdminSettingsView.prototype.setUpdateStatusTimer = function ()
	{
		if (this.bShown)
		{
			setTimeout(_.bind(function () {
				Ajax.send(Settings.ServerModuleName, 'GetLogFilesData', null, function (oResponse) {
					if (oResponse.Result)
					{
						Settings.updateLogsData(oResponse.Result);
						this.logSize(Settings.LogSizeBytes);
						this.eventsLogSize(Settings.EventLogSizeBytes);
					}
					this.setUpdateStatusTimer();
				}, this);
			}, this), 5000);
		}
	};

	CLoggingAdminSettingsView.prototype.getCurrentValues = function ()
	{
		return [
			this.enableLogging(),
			this.enableEventLogging(),
			Types.pInt(this.loggingLevel())
		];
	};

	CLoggingAdminSettingsView.prototype.revertGlobalValues = function ()
	{
		this.enableLogging(Settings.EnableLogging);
		this.enableEventLogging(Settings.EnableEventLogging);
		this.loggingLevel(Settings.LoggingLevel);
	};

	CLoggingAdminSettingsView.prototype.getParametersForSave = function ()
	{
		return {
			'EnableLogging': this.enableLogging(),
			'EnableEventLogging': this.enableEventLogging(),
			'LoggingLevel': Types.pInt(this.loggingLevel())
		};
	};

	/**
	 * @param {Object} oParameters
	 */
	CLoggingAdminSettingsView.prototype.applySavedValues = function (oParameters)
	{
		Settings.updateLogging(oParameters.EnableLogging, oParameters.EnableEventLogging, oParameters.LoggingLevel);
	};

	CLoggingAdminSettingsView.prototype.setAccessLevel = function (sEntityType, iEntityId)
	{
		this.visible(sEntityType === '');
	};

	CLoggingAdminSettingsView.prototype.downloadLog = function (bEventsLog, sPublicId)
	{
		Ajax.send(Settings.ServerModuleName, 'GetLogFile', {'EventsLog': bEventsLog, 'PublicId': sPublicId || ''}, function (oResponse) {
			var
				oBlob = new Blob([oResponse.ResponseText], {'type': 'text/plain;charset=utf-8'}),
				sFilePrefix = Types.pString(sPublicId) !== '' ? sPublicId + '-' : ''
			;
			FileSaver.saveAs(oBlob, bEventsLog ? Settings.EventLogFileName : sFilePrefix + Settings.LogFileName);
		}, this, undefined, { Format: 'Raw' });
	};

	CLoggingAdminSettingsView.prototype.viewLog = function (bEventsLog)
	{
		Ajax.send(Settings.ServerModuleName, 'GetLog', {'EventsLog': bEventsLog}, function (oResponse) {
			if (oResponse.Result)
			{
				var oWin = WindowOpener.open('', 'view-log');
				if (oWin)
				{
					$(oWin.document.body).html('<pre>' + oResponse.Result + '</pre>');
				}
			}
		}, this);
	};

	CLoggingAdminSettingsView.prototype.clearLog = function (bEventsLog)
	{
		Ajax.send(Settings.ServerModuleName, 'ClearLog', {'EventsLog': bEventsLog}, function (oResponse) {
			if (oResponse.Result)
			{
				if (bEventsLog)
				{
					this.eventsLogSize(0);
				}
				else
				{
					this.logSize(0);
				}
			}
		}, this);
	};

	module.exports = new CLoggingAdminSettingsView();


/***/ }),

/***/ 341:
/*!****************************************************!*\
  !*** ./modules/MobileSyncWebclient/js/Settings.js ***!
  \****************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44)
	;

	module.exports = {
		ServerModuleName: 'MobileSync',
		HashModuleName: 'mobilesync',
		ServerDavModuleName: 'Dav',
		
		ExternalHostNameOfDAVServer: '',
		
		/**
		 * Initializes settings from AppData object sections.
		 * 
		 * @param {Object} oAppData Object contained modules settings.
		 */
		init: function (oAppData)
		{
			var oAppDataSection = oAppData[this.ServerDavModuleName];
			
			if (!_.isEmpty(oAppDataSection))
			{
				this.ExternalHostNameOfDAVServer = Types.pString(oAppDataSection.ExternalHostNameOfDAVServer, this.ExternalHostNameOfDAVServer);
			}
		},
		
		/**
		 * Updates new settings values after saving on server.
		 * 
		 * @param {string} sExternalHostNameOfDAVServer
		 */
		update: function (sExternalHostNameOfDAVServer)
		{
			this.ExternalHostNameOfDAVServer = sExternalHostNameOfDAVServer;
		}
	};


/***/ }),

/***/ 343:
/*!**********************************************************************!*\
  !*** ./modules/MobileSyncWebclient/js/views/DavAdminSettingsView.js ***!
  \**********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		ModulesManager = __webpack_require__(/*! modules/CoreWebclient/js/ModulesManager.js */ 42),
		CAbstractSettingsFormView = ModulesManager.run('AdminPanelWebclient', 'getAbstractSettingsFormViewClass'),
		
		Settings = __webpack_require__(/*! modules/MobileSyncWebclient/js/Settings.js */ 341)
	;

	/**
	* @constructor
	*/
	function CDavAdminSettingsView()
	{
		CAbstractSettingsFormView.call(this, Settings.ServerDavModuleName);
		
		/* Editable fields */
		this.davServer = ko.observable(Settings.ExternalHostNameOfDAVServer);
		/*-- Editable fields */
	}

	_.extendOwn(CDavAdminSettingsView.prototype, CAbstractSettingsFormView.prototype);

	CDavAdminSettingsView.prototype.ViewTemplate = 'MobileSyncWebclient_DavAdminSettingsView';

	CDavAdminSettingsView.prototype.getCurrentValues = function()
	{
		return [
			this.davServer()
		];
	};

	CDavAdminSettingsView.prototype.revertGlobalValues = function()
	{
		this.davServer(Settings.ExternalHostNameOfDAVServer);
	};

	CDavAdminSettingsView.prototype.getParametersForSave = function ()
	{
		return {
			'ExternalHostNameOfDAVServer': this.davServer()
		};
	};

	/**
	 * Applies saved values to the Settings object.
	 * 
	 * @param {Object} oParameters Parameters which were saved on the server side.
	 */
	CDavAdminSettingsView.prototype.applySavedValues = function (oParameters)
	{
		Settings.update(oParameters.ExternalHostNameOfDAVServer);
	};

	CDavAdminSettingsView.prototype.setAccessLevel = function (sEntityType, iEntityId)
	{
		this.visible(sEntityType === '');
	};

	module.exports = new CDavAdminSettingsView();


/***/ }),

/***/ 352:
/*!******************************************************!*\
  !*** ./modules/StandardAuthWebclient/js/Settings.js ***!
  \******************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		ko = __webpack_require__(/*! knockout */ 46),
		
		App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179)
	;

	module.exports = {
		ServerModuleName: 'StandardAuth',
		HashModuleName: 'standardauth',
		
		userAccountsCount: ko.observable(0),
		accountsEmails: ko.observableArray([]),
		
		/**
		 * Initializes settings from AppData object sections.
		 * 
		 * @param {Object} oAppData Object contained modules settings.
		 */
		init: function (oAppData)
		{
			App.registerUserAccountsCount(this.userAccountsCount);
			App.registerAccountsWithPass(this.accountsEmails);
		}
	};


/***/ }),

/***/ 353:
/*!************************************************************************************!*\
  !*** ./modules/StandardAuthWebclient/js/views/StandardAccountsSettingsFormView.js ***!
  \************************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		$ = __webpack_require__(/*! jquery */ 1),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		
		Popups = __webpack_require__(/*! modules/CoreWebclient/js/Popups.js */ 186),
		ConfirmPopup = __webpack_require__(/*! modules/CoreWebclient/js/popups/ConfirmPopup.js */ 233),
		
		Api = __webpack_require__(/*! modules/CoreWebclient/js/Api.js */ 181),
		App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179),
		ModulesManager = __webpack_require__(/*! modules/CoreWebclient/js/ModulesManager.js */ 42),
		Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
		CAbstractSettingsFormView,
		
		UserSettings = __webpack_require__(/*! modules/CoreWebclient/js/Settings.js */ 45),
		
		Ajax = __webpack_require__(/*! modules/StandardAuthWebclient/js/Ajax.js */ 354),
		Settings = __webpack_require__(/*! modules/StandardAuthWebclient/js/Settings.js */ 352)
	;

	if (App.getUserRole() === Enums.UserRole.SuperAdmin)
	{
		CAbstractSettingsFormView = ModulesManager.run('AdminPanelWebclient', 'getAbstractSettingsFormViewClass');
	}
	else
	{
		CAbstractSettingsFormView = ModulesManager.run('SettingsWebclient', 'getAbstractSettingsFormViewClass');
	}

	/**
	* @constructor for object that is bound to screen with basic account list 
	* and ability to create new basic account for specified user 
	*/
	function CStandardAccountsSettingsFormView()
	{
		CAbstractSettingsFormView.call(this, UserSettings.ServerModuleName);

		this.sFakePass = 'xxxxxxxx'; // fake password uses to display something in password input while account editing
		
		this.iUserId = App.getUserId(); // current user identifier
		
		this.accounts = ko.observableArray([]); // current user account list
		this.currentAccountId = ko.observable(0); // current account identifier
		
		//heading text for account create form
		this.createAccountHeading = ko.computed(function () {
			if (this.accounts().length === 0)
			{
				return TextUtils.i18n('STANDARDAUTHWEBCLIENT/HEADING_CREATE_FIRST_ACCOUNT');
			}
			if (this.currentAccountId() === 0)
			{
				return TextUtils.i18n('STANDARDAUTHWEBCLIENT/HEADING_CREATE_NEW_ACCOUNT');
			}
			return TextUtils.i18n('STANDARDAUTHWEBCLIENT/HEADING_EDIT_NEW_ACCOUNT');
		}, this);
		
		//text for update/create button
		this.updateButtonText = ko.computed(function () {
			return (this.currentAccountId() === 0) ? TextUtils.i18n('STANDARDAUTHWEBCLIENT/ACTION_CREATE') : TextUtils.i18n('STANDARDAUTHWEBCLIENT/ACTION_UPDATE');
		}, this);
		this.updateProgressButtonText = ko.computed(function () {
			return (this.currentAccountId() === 0) ? TextUtils.i18n('STANDARDAUTHWEBCLIENT/ACTION_CREATE_IN_PROGRESS') : TextUtils.i18n('STANDARDAUTHWEBCLIENT/ACTION_UPDATE_IN_PROGRESS');
		}, this);
		
		this.sUserPublicId = '';

		this.login = ko.observable(''); // new account login
		this.loginFocus = ko.observable(false);
		this.pass = ko.observable(''); // new account password
		this.passFocus = ko.observable(false);
		this.confirmPass = ko.observable(''); // new account password
		this.confirmPassFocus = ko.observable(false);
		
		this.visibleCreateForm = ko.observable(false);
		this.isCreating = ko.observable(false);
		
		if (App.getUserRole() === Enums.UserRole.NormalUser)
		{
			this.requestAccounts();
			
			ko.computed(function () {
				this.visible(this.accounts().length > 0);
			}, this);
		}
		
		App.subscribeEvent(Settings.ServerModuleName + '::CreateUserAuthAccount', _.bind(function (oParams) {
			Ajax.send('CreateAuthenticatedUserAccount', {'Login': oParams.Login, 'Password': oParams.Password}, _.bind(function (oResponse) {
				if (oResponse.Result)
				{
					this.accounts.push({
						id: oResponse.Result.EntityId,
						login: oParams.Login
					});
					App.broadcastEvent('OpenSettingTab', {'Name': this.SettingsTabName});
				}
				else
				{
					Api.showErrorByCode(oResponse);
				}
			}, this));
		}, this));
		
		App.subscribeEvent('ReceiveAjaxResponse::after', _.bind(function (oParams) {
			if (oParams.Request.Module === 'AdminPanelWebclient' && oParams.Request.Method === 'GetEntity')
			{
				if (oParams.Response.Result && oParams.Request.Parameters.Id === this.iUserId)
				{
					this.sUserPublicId = oParams.Response.Result.PublicId;
					this.login(this.sUserPublicId);
				}
			}
		}, this));
		
		App.broadcastEvent('StandardAuthWebclient::ConstructView::after', {'Name': this.ViewConstructorName, 'View': this});
	}

	_.extendOwn(CStandardAccountsSettingsFormView.prototype, CAbstractSettingsFormView.prototype);

	CStandardAccountsSettingsFormView.prototype.ViewTemplate = 'StandardAuthWebclient_StandardAccountsSettingsFormView';
	CStandardAccountsSettingsFormView.prototype.ViewConstructorName = 'CStandardAccountsSettingsFormView';

	/**
	 * Runs after routing to this view.
	 */
	CStandardAccountsSettingsFormView.prototype.onShow = function ()
	{
		this.requestAccounts();
		App.broadcastEvent('CStandardAccountsSettingsFormView::onShow::after', {'Name': this.ViewConstructorName, 'View': this});
	};

	CStandardAccountsSettingsFormView.prototype.onRouteChild = CStandardAccountsSettingsFormView.prototype.onShow;

	/**
	 * Requests basic accounts for current user.
	 */
	CStandardAccountsSettingsFormView.prototype.requestAccounts = function ()
	{
		Ajax.send('GetUserAccounts', {'UserId': this.iUserId}, function (oResponse) {
			if (_.isArray(oResponse.Result))
			{
				this.accounts(oResponse.Result);
			}
			else
			{
				Api.showErrorByCode(oResponse);
				this.accounts([]);
			}
			
			if (this.accounts().length === 0)
			{
				this.openEditAccountForm(0);
			}
			else
			{
				this.openEditAccountForm(this.accounts()[0].id);
			}
		}, this);
	};

	/**
	 * Sets access level for the view via entity type and entity identifier.
	 * This view is visible only for entity type 'User'.
	 * 
	 * @param {string} sEntityType Current entity type.
	 * @param {number} iEntityId Indentificator of current intity.
	 */
	CStandardAccountsSettingsFormView.prototype.setAccessLevel = function (sEntityType, iEntityId)
	{
		this.visible(sEntityType === 'User');
		if (this.iUserId !== iEntityId)
		{
			this.accounts([]);
			this.hideEditAccountForm();
			this.iUserId = iEntityId || -1;
			this.sUserPublicId = '';
		}
	};

	/**
	 * Show popup to confirm deleting of basic account with specified identifier.
	 * 
	 * @param {number} iAccountId Identifier of basic account that should be deleted.
	 * @param {string} sLogin Login of basic account that should be deleted. Uses in confirm popup text.
	 */
	CStandardAccountsSettingsFormView.prototype.confirmAccountDeleting = function (iAccountId, sLogin)
	{
		Popups.showPopup(ConfirmPopup, [TextUtils.i18n('STANDARDAUTHWEBCLIENT/CONFIRM_DELETE_ACCOUNT'), _.bind(this.deleteAccount, this, iAccountId), sLogin]);
	};

	/**
	 * Sends request to the server to delete specified basic account.
	 * 
	 * @param {number} iAccountId Identifier of basic account that should be deleted.
	 * @param {boolean} bDelete Indicates if administrator confirmed account deleting or not.
	 */
	CStandardAccountsSettingsFormView.prototype.deleteAccount = function (iAccountId, bDelete)
	{
		if (bDelete)
		{
			Ajax.send('DeleteAccount', {'AccountId': iAccountId}, function (oResponse) {
				if (oResponse.Result)
				{
					Screens.showReport(TextUtils.i18n('STANDARDAUTHWEBCLIENT/REPORT_DELETE_ACCOUNT'));
				}
				else
				{
					Api.showErrorByCode(oResponse, TextUtils.i18n('STANDARDAUTHWEBCLIENT/ERROR_DELETE_ACCOUNT'));
				}
				this.requestAccounts();
			}, this);
		}
	};

	/**
	 * Displays edit account form.
	 * 
	 * @param {number} iAccountId Identifier of basic account that should be deleted.
	 */
	CStandardAccountsSettingsFormView.prototype.openEditAccountForm = function (iAccountId)
	{
		var oAccount = _.find(this.accounts(), function (oAccount) {
			return oAccount.id === iAccountId;
		});
		
		if (oAccount)
		{
			this.currentAccountId(iAccountId);
			this.login(oAccount.login);
			this.pass(this.sFakePass);
			this.passFocus(true);
			this.confirmPass('');
		}
		else
		{
			this.currentAccountId(0);
			this.login(this.sUserPublicId);
			this.loginFocus(true);
			this.pass('');
			this.confirmPass('');
		}
		
		this.visibleCreateForm(true);
	};

	/**
	 * Validates input data and sends request to the server to create new basic account or update existing basic account.
	 */
	CStandardAccountsSettingsFormView.prototype.saveAccount = function ()
	{
		var
			sLogin = $.trim(this.login()),
			sPass = $.trim(this.pass())
		;
		if (sLogin === '')
		{
			this.loginFocus(true);
		}
		else if (sPass === '' || sPass === this.sFakePass)
		{
			this.passFocus(true);
		}
		else if (sPass !== $.trim(this.confirmPass()))
		{
			Screens.showError(TextUtils.i18n('COREWEBCLIENT/ERROR_PASSWORDS_DO_NOT_MATCH'));
			this.confirmPassFocus(true);
		}
		else if (this.currentAccountId() === 0)
		{
			Ajax.send('CreateAuthenticatedUserAccount', {'Login': sLogin, 'Password': sPass}, function (oResponse) {
				if (oResponse.Result)
				{
					Screens.showReport(TextUtils.i18n('STANDARDAUTHWEBCLIENT/REPORT_CREATE_ACCOUNT'));
					this.hideEditAccountForm();
					this.requestAccounts();
				}
				else
				{
					Api.showErrorByCode(oResponse, TextUtils.i18n('STANDARDAUTHWEBCLIENT/ERROR_CREATE_ACCOUNT'));
				}
			}, this);
		}
		else
		{
			Ajax.send('UpdateAccount', {'AccountId': this.currentAccountId(), 'Password': sPass}, function (oResponse) {
				if (oResponse.Result)
				{
					Screens.showReport(TextUtils.i18n('STANDARDAUTHWEBCLIENT/REPORT_UPDATE_ACCOUNT'));
					this.hideEditAccountForm();
				}
				else
				{
					Api.showErrorByCode(oResponse, TextUtils.i18n('STANDARDAUTHWEBCLIENT/ERROR_UPDATE_ACCOUNT'));
				}
				this.requestAccounts();
			}, this);
		}
	};

	/**
	 * Hides edit account form.
	 */
	CStandardAccountsSettingsFormView.prototype.hideEditAccountForm = function ()
	{
		this.currentAccountId(0);
		this.visibleCreateForm(false);
	};

	module.exports = new CStandardAccountsSettingsFormView();


/***/ }),

/***/ 354:
/*!**************************************************!*\
  !*** ./modules/StandardAuthWebclient/js/Ajax.js ***!
  \**************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		Ajax = __webpack_require__(/*! modules/CoreWebclient/js/Ajax.js */ 185),
		
		Settings = __webpack_require__(/*! modules/StandardAuthWebclient/js/Settings.js */ 352)
	;

	module.exports = {
		send: function (sMethod, oParameters, fResponseHandler, oContext) {
			Ajax.send(Settings.ServerModuleName, sMethod, oParameters, fResponseHandler, oContext);
		}
	};

/***/ })

});