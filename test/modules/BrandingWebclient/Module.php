<?php
/**
 * @copyright Copyright (c) 2017, Afterlogic Corp.
 * @license AGPL-3.0 or AfterLogic Software License
 *
 * This code is licensed under AGPLv3 license or AfterLogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

namespace Aurora\Modules\BrandingWebclient;

/**
 * @package Modules
 */
class Module extends \Aurora\System\Module\AbstractWebclientModule
{
	/***** private functions *****/
	/**
	 * Initializes module.
	 * 
	 * @ignore
	 */
	public function init()
	{
		$oUser = \Aurora\System\Api::getAuthenticatedUser();

		//if (!empty($oUser) && $oUser->Role === \Aurora\System\Enums\UserRole::SuperAdmin)
		// {
			//$this->includeTemplate('StandardAuthWebclient_StandardAccountsSettingsFormView', 'Edit-Standard-Account-After', 'templates/AccountPasswordHintView.html', $this->sName);
		// }
	}
	

	/***** private functions *****/
	
	/***** public functions might be called with web API *****/
	/**
	 * Obtains list of module settings for authenticated user.
	 * 
	 * @return array
	 */
	public function GetSettings()
	{
		\Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::Anonymous);
		
		return array(
			'LoginLogo' => $this->getConfig('LoginLogo'),
			'TabsbarLogo' => $this->getConfig('TabsbarLogo')
		);
	}

	/**
	 * Updates module's settings - saves them to config.json file or to user settings in db.
	 * @param int $ContactsPerPage Count of contacts per page.
	 * @return boolean
	 */
	public function UpdateSettings($LoginLogo, $TabsbarLogo)
	{
		\Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::SuperAdmin);
		
		$this->setConfig('LoginLogo', $LoginLogo);
		$this->setConfig('TabsbarLogo', $TabsbarLogo);

		return $this->saveModuleConfig();
	}

	/***** public functions might be called with web API *****/
}
