'use strict';
var $ = require('jquery'), _ = require('underscore'), Promise = require('bluebird');
$('body').ready(function () {
	var oAvailableModules = {};
	if (window.aAvailableModules) {
		if (window.aAvailableModules.indexOf('AdminPanelWebclient') >= 0) {
			oAvailableModules['AdminPanelWebclient'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/AdminPanelWebclient/js/manager.js'); resolve(oModule); }, 'AdminPanelWebclient');
			});
		}
		if (window.aAvailableModules.indexOf('BrandingWebclient') >= 0) {
			oAvailableModules['BrandingWebclient'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/BrandingWebclient/js/manager.js'); resolve(oModule); }, 'BrandingWebclient');
			});
		}
		if (window.aAvailableModules.indexOf('ContactsWebclient') >= 0) {
			oAvailableModules['ContactsWebclient'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/ContactsWebclient/js/manager.js'); resolve(oModule); }, 'ContactsWebclient');
			});
		}
		if (window.aAvailableModules.indexOf('CoreParanoidEncryptionWebclientPlugin') >= 0) {
			oAvailableModules['CoreParanoidEncryptionWebclientPlugin'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/CoreParanoidEncryptionWebclientPlugin/js/manager.js'); resolve(oModule); }, 'CoreParanoidEncryptionWebclientPlugin');
			});
		}
		if (window.aAvailableModules.indexOf('Dropbox') >= 0) {
			oAvailableModules['Dropbox'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/Dropbox/js/manager.js'); resolve(oModule); }, 'Dropbox');
			});
		}
		if (window.aAvailableModules.indexOf('Facebook') >= 0) {
			oAvailableModules['Facebook'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/Facebook/js/manager.js'); resolve(oModule); }, 'Facebook');
			});
		}
		if (window.aAvailableModules.indexOf('FileViewerWebclientPlugin') >= 0) {
			oAvailableModules['FileViewerWebclientPlugin'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/FileViewerWebclientPlugin/js/manager.js'); resolve(oModule); }, 'FileViewerWebclientPlugin');
			});
		}
		if (window.aAvailableModules.indexOf('FilesCutCopyPasteWebclientPlugin') >= 0) {
			oAvailableModules['FilesCutCopyPasteWebclientPlugin'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/FilesCutCopyPasteWebclientPlugin/js/manager.js'); resolve(oModule); }, 'FilesCutCopyPasteWebclientPlugin');
			});
		}
		if (window.aAvailableModules.indexOf('FilesTableviewWebclientPlugin') >= 0) {
			oAvailableModules['FilesTableviewWebclientPlugin'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/FilesTableviewWebclientPlugin/js/manager.js'); resolve(oModule); }, 'FilesTableviewWebclientPlugin');
			});
		}
		if (window.aAvailableModules.indexOf('FilesWebclient') >= 0) {
			oAvailableModules['FilesWebclient'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/FilesWebclient/js/manager.js'); resolve(oModule); }, 'FilesWebclient');
			});
		}
		if (window.aAvailableModules.indexOf('Google') >= 0) {
			oAvailableModules['Google'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/Google/js/manager.js'); resolve(oModule); }, 'Google');
			});
		}
		if (window.aAvailableModules.indexOf('InvitationLinkWebclient') >= 0) {
			oAvailableModules['InvitationLinkWebclient'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/InvitationLinkWebclient/js/manager.js'); resolve(oModule); }, 'InvitationLinkWebclient');
			});
		}
		if (window.aAvailableModules.indexOf('LogsViewerWebclient') >= 0) {
			oAvailableModules['LogsViewerWebclient'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/LogsViewerWebclient/js/manager.js'); resolve(oModule); }, 'LogsViewerWebclient');
			});
		}
		if (window.aAvailableModules.indexOf('MobileSyncWebclient') >= 0) {
			oAvailableModules['MobileSyncWebclient'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/MobileSyncWebclient/js/manager.js'); resolve(oModule); }, 'MobileSyncWebclient');
			});
		}
		if (window.aAvailableModules.indexOf('OAuthIntegratorWebclient') >= 0) {
			oAvailableModules['OAuthIntegratorWebclient'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/OAuthIntegratorWebclient/js/manager.js'); resolve(oModule); }, 'OAuthIntegratorWebclient');
			});
		}
		if (window.aAvailableModules.indexOf('SettingsWebclient') >= 0) {
			oAvailableModules['SettingsWebclient'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/SettingsWebclient/js/manager.js'); resolve(oModule); }, 'SettingsWebclient');
			});
		}
		if (window.aAvailableModules.indexOf('StandardAuthWebclient') >= 0) {
			oAvailableModules['StandardAuthWebclient'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/StandardAuthWebclient/js/manager.js'); resolve(oModule); }, 'StandardAuthWebclient');
			});
		}
		if (window.aAvailableModules.indexOf('StandardLoginFormWebclient') >= 0) {
			oAvailableModules['StandardLoginFormWebclient'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/StandardLoginFormWebclient/js/manager.js'); resolve(oModule); }, 'StandardLoginFormWebclient');
			});
		}
		if (window.aAvailableModules.indexOf('StandardRegisterFormWebclient') >= 0) {
			oAvailableModules['StandardRegisterFormWebclient'] = new Promise(function(resolve, reject) {
				require.ensure([], function(require) {var oModule = require('modules/StandardRegisterFormWebclient/js/manager.js'); resolve(oModule); }, 'StandardRegisterFormWebclient');
			});
		}
	}
	Promise.all(_.values(oAvailableModules)).then(function(aModules){
	var
		ModulesManager = require('modules/CoreWebclient/js/ModulesManager.js'),
		App = require('modules/CoreWebclient/js/App.js'),
		bSwitchingToMobile = App.checkMobile()
	;
	if (!bSwitchingToMobile)
	{
		if (window.isPublic) {
			App.setPublic();
		}
		if (window.isNewTab) {
			App.setNewTab();
		}
		ModulesManager.init(_.object(_.keys(oAvailableModules), aModules));
		App.init();
	}
	});
});
