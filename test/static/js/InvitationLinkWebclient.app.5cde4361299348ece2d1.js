webpackJsonp([13],{

/***/ 334:
/*!*******************************************************!*\
  !*** ./modules/InvitationLinkWebclient/js/manager.js ***!
  \*******************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = function (oAppData) {
		__webpack_require__(/*! modules/CoreWebclient/js/vendors/jquery.cookie.js */ 208);
		
		var
			$ = __webpack_require__(/*! jquery */ 1),
			ko = __webpack_require__(/*! knockout */ 46),
			
			TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
			Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44),
			
			Ajax = __webpack_require__(/*! modules/CoreWebclient/js/Ajax.js */ 185),
			App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179),
			Routing = __webpack_require__(/*! modules/CoreWebclient/js/Routing.js */ 189),
			Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
			UserSettings = __webpack_require__(/*! modules/CoreWebclient/js/Settings.js */ 45),
			
			Settings = __webpack_require__(/*! modules/InvitationLinkWebclient/js/Settings.js */ 335),
			
			bAdminUser = App.getUserRole() === Enums.UserRole.SuperAdmin,
			bAnonimUser = App.getUserRole() === Enums.UserRole.Anonymous,
			
			fGetInvitationLinkHash = function () {
				var aHashArray = Routing.getCurrentHashArray();
				if (aHashArray.length >= 2 && aHashArray[0] === Settings.RegisterModuleHash)
				{
					return aHashArray[1];
				}
				return '';
			},
			sInvitationLinkHash = fGetInvitationLinkHash()
		;
		
		Settings.init(oAppData);

		if (!App.isPublic() && bAnonimUser)
		{
			return {
				start: function (ModulesManager) {
					App.subscribeEvent('StandardRegisterFormWebclient::ShowView::after', function (oParams) {
						if ('CRegisterView' === oParams.Name)
						{
							sInvitationLinkHash = fGetInvitationLinkHash();
							if (sInvitationLinkHash !== '')
							{
								$.cookie('InvitationLinkHash', sInvitationLinkHash, { expires: 30 });
							}
							else
							{
								$.removeCookie('InvitationLinkHash');
							}
							Ajax.send(Settings.ServerModuleName, 'GetUserPublicId', { 'InvitationLinkHash': sInvitationLinkHash }, function (oResponse) {
								if (oResponse.Result)
								{
									App.broadcastEvent('ShowWelcomeRegisterText', { 'UserName': oResponse.Result, 'WelcomeText': TextUtils.i18n('INVITATIONLINKWEBCLIENT/INFO_WELCOME', {'USERNAME': oResponse.Result, 'SITE_NAME': UserSettings.SiteName}) });
								}
								else
								{
									Screens.showError(TextUtils.i18n('INVITATIONLINKWEBCLIENT/REPORT_INVITATION_LINK_INCORRECT'), true);
									Routing.setHash([Settings.LoginModuleHash]);
								}
							});
						}
					});
					App.subscribeEvent('SendAjaxRequest::before', function (oParams) {
						if (oParams.Module === Settings.RegisterModuleName && oParams.Method === 'Register')
						{
							oParams.Parameters.InvitationLinkHash = sInvitationLinkHash;
						}
					});
				}
			};
		}
		
		$.removeCookie('InvitationLinkHash');
		
		if (sInvitationLinkHash !== '')
		{
			Ajax.send(Settings.ServerModuleName, 'GetUserPublicId', { 'InvitationLinkHash': sInvitationLinkHash }, function (oResponse) {
				if (oResponse.Result)
				{
					Screens.showReport(TextUtils.i18n('INVITATIONLINKWEBCLIENT/REPORT_LOGGED_IN'), 0);
				}
			});
			App.subscribeEvent('clearAndReloadLocation::before', function (oParams) {
				oParams.OnlyReload = true;
			});
		}
		
		if (bAdminUser)
		{
			return {
				start: function (ModulesManager) {
					var
						iId = 0,
						iJustCreatedId = 0,
						aInvitationLinks = {},
						aInvitationHashes = {},
						oInvitationView = null
					;
					
					App.subscribeEvent('ReceiveAjaxResponse::after', function (oParams) {
						if (oParams.Response.Method === 'CreateAuthenticatedUserAccount' && oParams.Response.Module === 'StandardAuth' && oParams.Response.Result)
						{
							var iId = App.getUserId();
							
							delete aInvitationLinks[iId];
							delete aInvitationHashes[iId];
						}
					});
					App.subscribeEvent('StandardAuthWebclient::ConstructView::after', function (oParams) {
						if (oParams.Name === 'CStandardAccountsSettingsFormView')
						{
							oParams.View.showPasswordRevokesInvitationHint = ko.observable(false);
						}
					});
					App.subscribeEvent('CStandardAccountsSettingsFormView::onShow::after', function (oParams) {
						iId = oParams.View.iUserId;
						oParams.View.showPasswordRevokesInvitationHint(!!aInvitationHashes[iId]);
						if (!aInvitationLinks[iId])
						{
							Ajax.send(Settings.ServerModuleName, 'GetInvitationLinkHash', { 'UserId': iId }, function (oResponse, oRequest) {
								var
									iParamId = Types.pInt(oRequest && oRequest.Parameters && oRequest.Parameters.UserId),
									sLink = oResponse.Result ? Routing.getAppUrlWithHash([Settings.RegisterModuleHash, oResponse.Result]) : ''
								;
								if (iParamId > 0 && iParamId === iId)
								{
									aInvitationLinks[iId] = sLink;
									aInvitationHashes[iId] = oResponse.Result;
									oParams.View.showPasswordRevokesInvitationHint(!!aInvitationHashes[iId]);
								}
							});
						}
					});
					App.subscribeEvent('AdminPanelWebclient::ConstructView::after', function (oParams) {
						if ('CEditUserView' === oParams.Name)
						{
							oParams.View.invitationLink = ko.observable('');
							oParams.View.bEnableSendInvitationLinkViaMail = Settings.EnableSendInvitationLinkViaMail;
							oParams.View.resendInvitationLink = function () {
								Ajax.send(Settings.ServerModuleName, 'SendNotification', { 'Email': oParams.View.publicId(), 'Hash': aInvitationHashes[iId] }, function (oResponse) {
									if (oResponse.Result)
									{
										Screens.showReport(TextUtils.i18n('INVITATIONLINKWEBCLIENT/REPORT_SEND_LINK'));
									}
									else
									{
										Screens.showError(TextUtils.i18n('INVITATIONLINKWEBCLIENT/ERROR_SEND_LINK'));
									}
								});
							};
							oInvitationView = oParams.View;
						}
					});
					App.subscribeEvent('CCommonSettingsPaneView::onRoute::after', function (oParams) {
						iId = Types.pInt(oParams.Id);
						if (iId > 0)
						{
							oParams.View.invitationLink(aInvitationLinks[iId] ? aInvitationLinks[iId] : '');
							if (!aInvitationLinks[iId])
							{
								Ajax.send(Settings.ServerModuleName, 'GetInvitationLinkHash', { 'UserId': iId }, function (oResponse, oRequest) {
									var
										iParamId = Types.pInt(oRequest && oRequest.Parameters && oRequest.Parameters.UserId),
										sLink = oResponse.Result ? Routing.getAppUrlWithHash([Settings.RegisterModuleHash, oResponse.Result]) : ''
									;
									if (iParamId > 0 && iParamId === iId)
									{
										oParams.View.invitationLink(sLink);
										aInvitationLinks[iId] = sLink;
										aInvitationHashes[iId] = oResponse.Result;
									}
								});
							}
						}
						else
						{
							oParams.View.invitationLink('');
						}
					});
					App.subscribeEvent('ReceiveAjaxResponse::after', function (oParams) {
						var oResponse = oParams.Response;
						if (oInvitationView && oResponse.Module === 'AdminPanelWebclient' && oResponse.Method === 'CreateUser' && oResponse.Result)
						{
							iJustCreatedId = Types.pInt(oResponse.Result);
						}
						if (iJustCreatedId === iId && oInvitationView && oResponse.Module === 'InvitationLinkWebclient' && oResponse.Method === 'GetInvitationLinkHash' && oResponse.Result)
						{
							iJustCreatedId = 0;
							Ajax.send(Settings.ServerModuleName, 'SendNotification', { 'Email': oInvitationView.publicId(), 'Hash': aInvitationHashes[iId] }, function (oResponse) {
								if (!oResponse.Result)
								{
									Screens.showReport(TextUtils.i18n('INVITATIONLINKWEBCLIENT/ERROR_AUTO_SEND_LINK'));
								}
							});
						}
					});
				}
			};
		}
		
		return null;
	};


/***/ }),

/***/ 335:
/*!********************************************************!*\
  !*** ./modules/InvitationLinkWebclient/js/Settings.js ***!
  \********************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44)
	;

	module.exports = {
		ServerModuleName: 'InvitationLinkWebclient',
		
		RegisterModuleName: 'StandardRegisterFormWebclient',
		RegisterModuleHash: 'register',
		LoginModuleHash: 'login',
		EnableSendInvitationLinkViaMail: true,
		
		/**
		 * Initializes settings from AppData object sections.
		 * 
		 * @param {Object} oAppData Object contained modules settings.
		 */
		init: function (oAppData)
		{
			var oAppDataSection = oAppData['InvitationLinkWebclient'];
			
			if (!_.isEmpty(oAppDataSection))
			{
				this.RegisterModuleName = Types.pString(oAppDataSection.RegisterModuleName, this.RegisterModuleName);
				this.RegisterModuleHash = Types.pString(oAppDataSection.RegisterModuleHash, this.RegisterModuleHash);
				this.LoginModuleHash = Types.pString(oAppDataSection.LoginModuleHash, this.LoginModuleHash);
				this.EnableSendInvitationLinkViaMail = Types.pBool(oAppDataSection.EnableSendInvitationLinkViaMail, this.EnableSendInvitationLinkViaMail);
			}
		}
	};


/***/ })

});