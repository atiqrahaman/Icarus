<?php
/*
 * @copyright Copyright (c) 2017, Afterlogic Corp.
 * @license AGPL-3.0 or Afterlogic Software License
 *
 * This code is licensed under AGPLv3 license or Afterlogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

namespace Aurora\System;

class SettingsProperty
{
	/**
	 * @var string
	 */
	public $Name;

	/**
	 * @var mixed
	 */
	public $Value;

	/**
	 * @var string
	 */
	public $Type;
	
	/**
	 * @var string
	 */
	public $SpecType;
	
	/**
	 * 
	 * @param string $sName
	 * @param mixed $mValue
	 * @param string $sType
	 * @param string $sSpecType
	 */
	public function __construct($sName, $mValue, $sType, $sSpecType = null) 
	{
		$this->Name = $sName;
		$this->Value = $mValue;
		$this->Type = $sType;
		$this->SpecType = $sSpecType;
	}
}
