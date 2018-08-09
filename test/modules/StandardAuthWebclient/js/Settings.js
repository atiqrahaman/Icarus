'use strict';

var
	ko = require('knockout'),
	
	App = require('%PathToCoreWebclientModule%/js/App.js')
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
