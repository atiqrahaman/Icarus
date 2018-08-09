'use strict';

var
	_ = require('underscore'),
	$ = require('jquery'),
	ko = require('knockout'),
	
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
	
	Popups = require('%PathToCoreWebclientModule%/js/Popups.js'),
	ConfirmPopup = require('%PathToCoreWebclientModule%/js/popups/ConfirmPopup.js'),
	
	Api = require('%PathToCoreWebclientModule%/js/Api.js'),
	App = require('%PathToCoreWebclientModule%/js/App.js'),
	ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),
	Screens = require('%PathToCoreWebclientModule%/js/Screens.js'),
	CAbstractSettingsFormView,
	
	UserSettings = require('%PathToCoreWebclientModule%/js/Settings.js'),
	
	Ajax = require('modules/%ModuleName%/js/Ajax.js'),
	Settings = require('modules/%ModuleName%/js/Settings.js')
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
			return TextUtils.i18n('%MODULENAME%/HEADING_CREATE_FIRST_ACCOUNT');
		}
		if (this.currentAccountId() === 0)
		{
			return TextUtils.i18n('%MODULENAME%/HEADING_CREATE_NEW_ACCOUNT');
		}
		return TextUtils.i18n('%MODULENAME%/HEADING_EDIT_NEW_ACCOUNT');
	}, this);
	
	//text for update/create button
	this.updateButtonText = ko.computed(function () {
		return (this.currentAccountId() === 0) ? TextUtils.i18n('%MODULENAME%/ACTION_CREATE') : TextUtils.i18n('%MODULENAME%/ACTION_UPDATE');
	}, this);
	this.updateProgressButtonText = ko.computed(function () {
		return (this.currentAccountId() === 0) ? TextUtils.i18n('%MODULENAME%/ACTION_CREATE_IN_PROGRESS') : TextUtils.i18n('%MODULENAME%/ACTION_UPDATE_IN_PROGRESS');
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
	
	App.broadcastEvent('%ModuleName%::ConstructView::after', {'Name': this.ViewConstructorName, 'View': this});
}

_.extendOwn(CStandardAccountsSettingsFormView.prototype, CAbstractSettingsFormView.prototype);

CStandardAccountsSettingsFormView.prototype.ViewTemplate = '%ModuleName%_StandardAccountsSettingsFormView';
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
	Popups.showPopup(ConfirmPopup, [TextUtils.i18n('%MODULENAME%/CONFIRM_DELETE_ACCOUNT'), _.bind(this.deleteAccount, this, iAccountId), sLogin]);
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
				Screens.showReport(TextUtils.i18n('%MODULENAME%/REPORT_DELETE_ACCOUNT'));
			}
			else
			{
				Api.showErrorByCode(oResponse, TextUtils.i18n('%MODULENAME%/ERROR_DELETE_ACCOUNT'));
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
				Screens.showReport(TextUtils.i18n('%MODULENAME%/REPORT_CREATE_ACCOUNT'));
				this.hideEditAccountForm();
				this.requestAccounts();
			}
			else
			{
				Api.showErrorByCode(oResponse, TextUtils.i18n('%MODULENAME%/ERROR_CREATE_ACCOUNT'));
			}
		}, this);
	}
	else
	{
		Ajax.send('UpdateAccount', {'AccountId': this.currentAccountId(), 'Password': sPass}, function (oResponse) {
			if (oResponse.Result)
			{
				Screens.showReport(TextUtils.i18n('%MODULENAME%/REPORT_UPDATE_ACCOUNT'));
				this.hideEditAccountForm();
			}
			else
			{
				Api.showErrorByCode(oResponse, TextUtils.i18n('%MODULENAME%/ERROR_UPDATE_ACCOUNT'));
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
