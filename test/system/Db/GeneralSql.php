<?php
/*
 * @copyright Copyright (c) 2017, Afterlogic Corp.
 * @license AGPL-3.0 or Afterlogic Software License
 *
 * This code is licensed under AGPLv3 license or Afterlogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

/**
 * @package Api
 * @subpackage Db
 */

namespace Aurora\System\Db;

class GeneralSql
{
	/**
	 * @var	int
	 */
	protected $iExecuteCount;

	/**
	 * @var	int
	 */
	public $ErrorCode;

	/**
	 * @var	string
	 */
	public $ErrorDesc;

	/**
	 * @return bool
	 */
	function IsConnected()
	{
		return false;
	}

	/**
	 * @param string $sLogDesc
	 * @param string $bIsSlaveExecute = false
	 * @return void
	 */
	protected function log($sLogDesc, $bIsSlaveExecute = false)
	{
		if (\Aurora\System\Api::$bUseDbLog)
		{
			if ($bIsSlaveExecute)
			{
				\Aurora\System\Api::Log('DB-Slave['.$this->iExecuteCount.'] > '.trim($sLogDesc));
			}
			else
			{
				\Aurora\System\Api::Log('DB['.$this->iExecuteCount.'] > '.trim($sLogDesc));
			}
		}
	}

	/**
	 * @param string $sErrorDesc
	 * @return void
	 */
	protected function errorLog($sErrorDesc)
	{
		\Aurora\System\Api::Log('DB ERROR < '.trim($sErrorDesc), \Aurora\System\Enums\LogLevel::Error);
	}
}