'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),
	
	ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),
	CAbstractSettingsFormView = ModulesManager.run('AdminPanelWebclient', 'getAbstractSettingsFormViewClass'),
	
	Settings = require('modules/%ModuleName%/js/Settings.js')
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

СAdminSettingsView.prototype.ViewTemplate = '%ModuleName%_AdminSettingsView';

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
