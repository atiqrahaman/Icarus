webpackJsonp([15],{

/***/ 340:
/*!***************************************************!*\
  !*** ./modules/MobileSyncWebclient/js/manager.js ***!
  \***************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = function (oAppData) {
		var
			TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
			
			App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179),

			Settings = __webpack_require__(/*! modules/MobileSyncWebclient/js/Settings.js */ 341)
		;
		
		Settings.init(oAppData);

		if (App.getUserRole() === Enums.UserRole.NormalUser)
		{
			return {
				start: function (ModulesManager) {
					ModulesManager.run('SettingsWebclient', 'registerSettingsTab', [function () { return __webpack_require__(/*! modules/MobileSyncWebclient/js/views/MobileSyncSettingsPaneView.js */ 342); }, Settings.HashModuleName, TextUtils.i18n('MOBILESYNCWEBCLIENT/LABEL_SETTINGS_TAB')]);
				}
			};
		}
		
		if (App.getUserRole() === Enums.UserRole.SuperAdmin)
		{
			return {
				start: function (ModulesManager) {
					ModulesManager.run('AdminPanelWebclient', 'registerAdminPanelTab', [
						function(resolve) {
							__webpack_require__.e/* nsure */(1/*! admin-bundle */, function() {
									resolve(__webpack_require__(/*! modules/MobileSyncWebclient/js/views/DavAdminSettingsView.js */ 343));
								});
						},
						Settings.HashModuleName,
						TextUtils.i18n('MOBILESYNCWEBCLIENT/LABEL_SETTINGS_TAB')
					]);
				}
			};
		}
		
		return null;
	};


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

/***/ 342:
/*!****************************************************************************!*\
  !*** ./modules/MobileSyncWebclient/js/views/MobileSyncSettingsPaneView.js ***!
  \****************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		$ = __webpack_require__(/*! jquery */ 1),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		UrlUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Url.js */ 177),
		
		Ajax = __webpack_require__(/*! modules/CoreWebclient/js/Ajax.js */ 185),
		Api = __webpack_require__(/*! modules/CoreWebclient/js/Api.js */ 181),
		App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179),
		Browser = __webpack_require__(/*! modules/CoreWebclient/js/Browser.js */ 178),
		ModulesManager = __webpack_require__(/*! modules/CoreWebclient/js/ModulesManager.js */ 42),
		UserSettings = __webpack_require__(/*! modules/CoreWebclient/js/Settings.js */ 45),
		
		Settings = __webpack_require__(/*! modules/MobileSyncWebclient/js/Settings.js */ 341)
	;

	/**
	 * @constructor
	 */
	function CMobileSyncSettingsPaneView()
	{
		this.oFilesMobileSyncSettingsView = ModulesManager.run('FilesWebclient', 'getMobileSyncSettingsView');
		this.oCalendarMobileSyncSettingsView = ModulesManager.run('CalendarWebclient', 'getMobileSyncSettingsView');
		this.oContactsMobileSyncSettingsView = ModulesManager.run('ContactsWebclient', 'getMobileSyncSettingsView');
		
		this.oCreateLoginPasswordView = ModulesManager.run('OAuthIntegratorWebclient', 'getCreateLoginPasswordView');
		
		this.enableDav = ko.observable(false);
		
		this.showSyncViaUrlSection = ko.computed(function () {
			return this.enableDav() && (ModulesManager.isModuleEnabled('CalendarWebclient') || ModulesManager.isModuleEnabled('ContactsWebclient'));
		}, this);
		
		this.sSyncViaUrlSectionInfo = this.getSyncViaUrlSectionInfo();
		this.sSyncViaUrlIOSDeviceSectionInfo = TextUtils.i18n('MOBILESYNCWEBCLIENT/INFO_DAVSYNC_IOS_DEVICE', {
			'WEBMAIL_URL': UrlUtils.getAppPath()
		});
		
		this.davServer = ko.observable('');
		
		this.bIosDevice = Browser.iosDevice;
		this.bDemo = UserSettings.IsDemo;
		
		this.visibleDavViaUrls = ko.computed(function () {
			return !!this.oCalendarMobileSyncSettingsView && this.oCalendarMobileSyncSettingsView.visible() || !!this.oContactsMobileSyncSettingsView;
		}, this);
		
		this.credentialsHintText = App.mobileCredentialsHintText;
	}

	CMobileSyncSettingsPaneView.prototype.ViewTemplate = 'MobileSyncWebclient_MobileSyncSettingsPaneView';

	CMobileSyncSettingsPaneView.prototype.showTab = function ()
	{
		Ajax.send(Settings.ServerModuleName, 'GetInfo', null, this.onGetInfoResponse, this);
	};

	/**
	 * Returns info text for "Sync via URL" section
	 * 
	 * @returns {String}
	 */
	CMobileSyncSettingsPaneView.prototype.getSyncViaUrlSectionInfo = function ()
	{
		var
			bAllowCalendar = ModulesManager.isModuleEnabled('CalendarWebclient'),
			bAllowContacts = ModulesManager.isModuleEnabled('ContactsWebclient')
		;
		
		if (bAllowCalendar && bAllowContacts)
		{
			return TextUtils.i18n('MOBILESYNCWEBCLIENT/INFO_DAVSYNC');
		}
		if (bAllowCalendar)
		{
			return TextUtils.i18n('MOBILESYNCWEBCLIENT/INFO_DAVSYNC_CALENDAR_ONLY');
		}
		if (bAllowContacts)
		{
			return TextUtils.i18n('MOBILESYNCWEBCLIENT/INFO_DAVSYNC_CONTACTS_ONLY');
		}
		return '';
	};

	/**
	 * @param {Object} oResponse
	 * @param {Object} oRequest
	 */
	CMobileSyncSettingsPaneView.prototype.onGetInfoResponse = function (oResponse, oRequest)
	{
		var
			oResult = oResponse.Result,
			oDav = !!oResult.EnableDav ? oResult.Dav : null
		;
		
		if (!oResult)
		{
			Api.showErrorByCode(oResponse);
		}
		else
		{
			this.enableDav(!!oResult.EnableDav);

			if (this.enableDav() && oDav)
			{
				this.davServer(oDav.Server);
				if (this.oFilesMobileSyncSettingsView && $.isFunction(this.oFilesMobileSyncSettingsView.populate))
				{
					this.oFilesMobileSyncSettingsView.populate(oDav);
				}
				if (this.oCalendarMobileSyncSettingsView && $.isFunction(this.oCalendarMobileSyncSettingsView.populate))
				{
					this.oCalendarMobileSyncSettingsView.populate(oDav);
				}
				if (this.oContactsMobileSyncSettingsView && $.isFunction(this.oContactsMobileSyncSettingsView.populate))
				{
					this.oContactsMobileSyncSettingsView.populate(oDav);
				}
			}
		}
	};

	module.exports = new CMobileSyncSettingsPaneView();


/***/ })

});