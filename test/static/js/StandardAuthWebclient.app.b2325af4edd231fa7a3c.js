webpackJsonp([18],{

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

/***/ 351:
/*!*****************************************************!*\
  !*** ./modules/StandardAuthWebclient/js/manager.js ***!
  \*****************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';


	module.exports = function (oAppData) {
		var
			_ = __webpack_require__(/*! underscore */ 2),
			
			TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
			
			App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179),
			ModulesManager = __webpack_require__(/*! modules/CoreWebclient/js/ModulesManager.js */ 42),
			
			Settings = __webpack_require__(/*! modules/StandardAuthWebclient/js/Settings.js */ 352),
			
			bAdminUser = App.getUserRole() === Enums.UserRole.SuperAdmin,
			bNormalUser = App.getUserRole() === Enums.UserRole.NormalUser
		;
		
		Settings.init(oAppData);
		
		if (!ModulesManager.isModuleAvailable(Settings.ServerModuleName))
		{
			return null;
		}
		
		if (bAdminUser)
		{
			return {
				/**
				 * Runs after app initializing. Adds standard auth tab to admin panel.
				 * 
				 * @param {Object} ModulesManager Modules manager object.
				 */
				start: function (ModulesManager) {
					ModulesManager.run('AdminPanelWebclient', 'registerAdminPanelTab', [
						//callback for promise
						function(resolve) {
							__webpack_require__.e/* nsure */(1/*! admin-bundle */, function() {
									resolve(__webpack_require__(/*! modules/StandardAuthWebclient/js/views/StandardAccountsSettingsFormView.js */ 353));
								});
						},
						Settings.HashModuleName + '-accounts',
						TextUtils.i18n('STANDARDAUTHWEBCLIENT/ADMIN_PANEL_TAB_LABEL')
					]);
				}
			};
		}
		
		if (bNormalUser)
		{
			return {
				/**
				 * Runs after app initializing. Adds standard auth tab to user settings.
				 * 
				 * @param {Object} ModulesManager Modules manager object.
				 */
				start: function (ModulesManager) {
					App.subscribeEvent('ReceiveAjaxResponse::after', function (oParams) {
						if (oParams.Request.Module === Settings.ServerModuleName && oParams.Request.Method === 'GetUserAccounts')
						{
							Settings.userAccountsCount(_.isArray(oParams.Response.Result) ? oParams.Response.Result.length : 0);
							Settings.accountsEmails(_.isArray(oParams.Response.Result) ? _.map(oParams.Response.Result, function (oAccount) {
								return oAccount.login || '';
							}) : 0);
						}
					});
					
					ModulesManager.run('SettingsWebclient', 'registerSettingsTab', [
						function () { return __webpack_require__(/*! modules/StandardAuthWebclient/js/views/StandardAccountsSettingsFormView.js */ 353); },
						Settings.HashModuleName + '-accounts',
						TextUtils.i18n('STANDARDAUTHWEBCLIENT/USER_SETTINGS_TAB_LABEL')
					]);
				}
			};
		}
		
		return null;
	};


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