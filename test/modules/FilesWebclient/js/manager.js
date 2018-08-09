'use strict';

module.exports = function (oAppData) {
	require('modules/%ModuleName%/js/enums.js');

	var
		App = require('%PathToCoreWebclientModule%/js/App.js'),

		TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),

		Settings = require('modules/%ModuleName%/js/Settings.js'),

		HeaderItemView = null,
		
		bAdminUser = App.getUserRole() === Enums.UserRole.SuperAdmin,
		bNormalUser = App.getUserRole() === Enums.UserRole.NormalUser,
		
		aToolbarButtons = [],
		oFilesView = null
	;
	
	Settings.init(oAppData);

	if (App.isPublic())
	{
		return {
			getScreens: function () {
				var oScreens = {};
				oScreens[Settings.HashModuleName] = function () {
					var CFilesView = require('modules/%ModuleName%/js/views/CFilesView.js');
					return new CFilesView();
				};
				return oScreens;
			}
		};
	}
	else if (bAdminUser || bNormalUser)
	{
		if (bAdminUser)
		{
			return {
				start: function (ModulesManager) {
					ModulesManager.run('AdminPanelWebclient', 'registerAdminPanelTab', [
						function(resolve) {
							require.ensure(
								['modules/%ModuleName%/js/views/FilesAdminSettingsView.js'],
								function() {
									resolve(require('modules/%ModuleName%/js/views/FilesAdminSettingsView.js'));
								},
								"admin-bundle"
							);
						},
						Settings.HashModuleName,
						TextUtils.i18n('%MODULENAME%/LABEL_SETTINGS_TAB')
					]);
				}
			};
		}
		else if (bNormalUser)
		{
			if (App.isNewTab())
			{
				return {
					getSelectFilesPopup: function () {
						return require('modules/%ModuleName%/js/popups/SelectFilesPopup.js');
					}
				};
			}
			else
			{
				return {
					enableModule: Settings.enableModule,
					start: function (ModulesManager) {
						if (Settings.ShowCommonSettings || Settings.ShowFilesApps)
						{
							ModulesManager.run('SettingsWebclient', 'registerSettingsTab', [
								function () { return require('modules/%ModuleName%/js/views/FilesSettingsFormView.js'); },
								Settings.HashModuleName,
								TextUtils.i18n('%MODULENAME%/LABEL_SETTINGS_TAB')
							]);
						}
					},
					getScreens: function () {
						var oScreens = {};
						oScreens[Settings.HashModuleName] = function () {
							var CFilesView = require('modules/%ModuleName%/js/views/CFilesView.js');
							oFilesView = new CFilesView();
							oFilesView.registerToolbarButtons(aToolbarButtons);
							aToolbarButtons = [];
							return oFilesView;
						};
						return oScreens;
					},
					getHeaderItem: function () {
						if (HeaderItemView === null)
						{
							var
								CHeaderItemView = require('%PathToCoreWebclientModule%/js/views/CHeaderItemView.js'),
								sTabTitle = Settings.CustomTabTitle !== '' ? Settings.CustomTabTitle : TextUtils.i18n('%MODULENAME%/ACTION_SHOW_FILES')
							;

							HeaderItemView = new CHeaderItemView(sTabTitle);
						}

						return {
							item: HeaderItemView,
							name: Settings.HashModuleName
						};
					},
					getSelectFilesPopup: function () {
						return require('modules/%ModuleName%/js/popups/SelectFilesPopup.js');
					},
					getMobileSyncSettingsView: function () {
						return require('modules/%ModuleName%/js/views/MobileSyncSettingsView.js');
					},
					registerToolbarButtons: function (oToolbarButtons) {
						if (oFilesView)
						{
							oFilesView.registerToolbarButtons([oToolbarButtons]);
						}
						else
						{
							aToolbarButtons.push(oToolbarButtons);
						}
					}
				};
			}
		}
	}
	
	return null;
};
