<?php
/**
 * @copyright Copyright (c) 2017, Afterlogic Corp.
 * @license AGPL-3.0 or AfterLogic Software License
 *
 * This code is licensed under AGPLv3 license or AfterLogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

namespace Aurora\Modules\LogsViewerWebclient;

/**
 * @package Modules
 */
class Module extends \Aurora\System\Module\AbstractWebclientModule
{
	public function GetUsersWithSeparateLog()
	{
		\Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::TenantAdmin);
		return \Aurora\Modules\Core\Module::Decorator()->GetUsersWithSeparateLog();
	}
	
	public function TurnOffSeparateLogs()
	{
		\Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::TenantAdmin);
		return \Aurora\Modules\Core\Module::Decorator()->TurnOffSeparateLogs();
	}
	
	public function ClearSeparateLogs()
	{
		\Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::TenantAdmin);
		return \Aurora\Modules\Core\Module::Decorator()->ClearSeparateLogs();
	}

	public function GetLogFilesData()
	{
		\Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::TenantAdmin);
		return \Aurora\Modules\Core\Module::Decorator()->GetLogFilesData();
	}
	
	public function GetLogFile($EventsLog = false, $PublicId = '')
	{
		\Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::TenantAdmin);
		return \Aurora\Modules\Core\Module::Decorator()->GetLogFile($EventsLog, $PublicId);
	}
	
	public function GetLog($EventsLog, $PartSize = 10240)
	{
		\Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::TenantAdmin);
		return \Aurora\Modules\Core\Module::Decorator()->GetLog($EventsLog, $PartSize);
	}
	
	public function ClearLog($EventsLog)
	{
		\Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::TenantAdmin);
		return \Aurora\Modules\Core\Module::Decorator()->ClearLog($EventsLog);
	}
}
