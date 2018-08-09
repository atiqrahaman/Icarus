webpackJsonp([3],{

/***/ 244:
/*!*************************************************!*\
  !*** ./modules/BrandingWebclient/js/manager.js ***!
  \*************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = function (oAppData) {
		__webpack_require__(/*! modules/CoreWebclient/js/vendors/jquery.cookie.js */ 208);
		
		var
			$ = __webpack_require__(/*! jquery */ 1),
			ko = __webpack_require__(/*! knockout */ 46),
			
			TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
			Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44),
			
			App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179),
			
			Settings = __webpack_require__(/*! modules/BrandingWebclient/js/Settings.js */ 245)
		;
		
		Settings.init(oAppData);

		if (App.getUserRole() === Enums.UserRole.SuperAdmin)
		{
			return {
				start: function (ModulesManager) {
					ModulesManager.run('AdminPanelWebclient', 'registerAdminPanelTab', [
						function(resolve) {
							__webpack_require__.e/* nsure */(1/*! admin-bundle */, function() {
									resolve(__webpack_require__(/*! modules/BrandingWebclient/js/views/AdminSettingsView.js */ 246));
								});
						},
						Settings.HashModuleName,
						TextUtils.i18n('BRANDINGWEBCLIENT/ADMIN_SETTINGS_TAB_LABEL')
					]);
				}
			};
		}
		
		return null;
	};


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


/***/ })

});