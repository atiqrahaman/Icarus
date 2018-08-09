<?php
/**
 * @copyright Copyright (c) 2017, Afterlogic Corp.
 * @license AGPL-3.0 or AfterLogic Software License
 *
 * This code is licensed under AGPLv3 license or AfterLogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

/**
 * @internal
 * 
 * @package Filestorage
 * @subpackage Storages
 */

namespace Aurora\Modules\PersonalFiles\Storages\Sabredav;

class Storage extends \Aurora\Modules\PersonalFiles\Storages\Storage
{
	/**
	 * @var $oApiMinManager \CApiMinManager
	 */
	protected $oApiMinManager = null;

	/**
	 * @param \Aurora\Modules\StandardAuth\Classes\Account|CHelpdeskUser $iUserId
	 * @param string $sType
	 * @param string $sPath
	 * @param string $sFileName
	 * 
	 * @return string
	 */
	public function generateHashId($iUserId, $sType, $sPath, $sFileName)
	{
		return implode('|', array($iUserId, $sType, $sPath, $sFileName));
	}
	
	public function getApiMinManager()
	{
		if ($this->oApiMinManager === null)
		{
			$oMinModule = \Aurora\System\Api::GetModule('Min');
			if ($oMinModule)
			{
				$this->oApiMinManager = $oMinModule->oApiMinManager;
			}
		}
		
		return $this->oApiMinManager;
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param bool $bUser
	 *
	 * @return string|null
	 */
	protected function getRootPath($iUserId, $sType, $bUser = false)
	{
		$sRootPath = null;
		if ($iUserId)
		{
			$oCoreDecorator = \Aurora\System\Api::GetModuleDecorator('Core');
			$oUser = $oCoreDecorator->GetUserByPublicId($iUserId);
			if ($oUser)
			{
				$sUser = $bUser ? '/' . $oUser->UUID : '';
				$sRootPath = \Aurora\System\Api::DataPath() . \Afterlogic\DAV\Constants::FILESTORAGE_PATH_ROOT . 
					\Afterlogic\DAV\Constants::FILESTORAGE_PATH_PERSONAL . $sUser;
			}

			if ($sType === \Aurora\System\Enums\FileStorageType::Corporate)
			{
				$iTenantId = /*$oAccount ? $oAccount->IdTenant :*/ 0;

				$sTenant = $bUser ? $sTenant = '/' . $iTenantId : '';
				$sRootPath = \Aurora\System\Api::DataPath() . \Afterlogic\DAV\Constants::FILESTORAGE_PATH_ROOT . 
					\Afterlogic\DAV\Constants::FILESTORAGE_PATH_CORPORATE . $sTenant;
			}
			else if ($sType === \Aurora\System\Enums\FileStorageType::Shared)
			{
				$sRootPath = \Aurora\System\Api::DataPath() . \Afterlogic\DAV\Constants::FILESTORAGE_PATH_ROOT . 
					\Afterlogic\DAV\Constants::FILESTORAGE_PATH_SHARED . $sUser;
			}
		}

		return $sRootPath;
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param string $sPath
	 *
	 * @return Afterlogic\DAV\FS\Directory|null
	 */
	public function getDirectory($iUserId, $sType, $sPath = '')
	{
		$oDirectory = null;
		
		if ($iUserId)
		{
			$sRootPath = $this->getRootPath($iUserId, $sType);
			
			if ($sType === \Aurora\System\Enums\FileStorageType::Personal) 
			{
				$oDirectory = new \Afterlogic\DAV\FS\RootPersonal($sRootPath);
			} 
			else if ($sType === \Aurora\System\Enums\FileStorageType::Corporate) 
			{
				$oDirectory = new \Afterlogic\DAV\FS\RootCorporate($sRootPath);
			} 
			else if ($sType === \Aurora\System\Enums\FileStorageType::Shared) 
			{
				$oDirectory = new \Afterlogic\DAV\FS\RootShared($sRootPath);
			}
			
			if ($oDirectory && !empty($sPath)) 
			{
				$oDirectory = $oDirectory->getChild($sPath);
			}
		}

		return $oDirectory;
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param string $sPath
	 * @param string $sName
	 *
	 * @return bool
	 */
	public function isFileExists($iUserId, $sType, $sPath, $sName)
	{
		$bResult = false;
		$oDirectory = $this->getDirectory($iUserId, $sType, $sPath);
		if ($oDirectory instanceof \Afterlogic\DAV\FS\Directory)
		{
			if($oDirectory->childExists($sName))
			{
				$oItem = $oDirectory->getChild($sName);
				if ($oItem instanceof \Afterlogic\DAV\FS\File)
				{
					$bResult = true;
				}
			}
		}
		
		return $bResult;
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param string $sPath
	 * @param string $sName
	 *
	 * @return string|null
	 */
	public function getSharedFile($iUserId, $sType, $sPath, $sName)
	{
		$sResult = null;
		$sRootPath = $this->getRootPath($iUserId, $sType, true);
		$FilePath = $sRootPath . '/' . $sPath . '/' . $sName;
		if (file_exists($FilePath))
		{
			$sResult = fopen($FilePath, 'r');
		}
		
		return $sResult;
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param object $oItem
	 * @param string $sPublicHash
	 *
	 * @return \Aurora\Modules\Files\Classes\FileItem|null
	 */
	public function getFileInfo($iUserId, $sType, $oItem, $sPublicHash = null)
	{
		$oResult = null;
		if ($oItem !== null)
		{
			$oMin = $this->getApiMinManager();
			$sRootPath = $this->getRootPath($iUserId, $sType, true);
			$sFilePath = str_replace($sRootPath, '', dirname($oItem->getPath()));
			if ($oItem instanceof \Afterlogic\DAV\FS\File)
			{
				$aProps = $oItem->getProperties(
					array(
						'Owner', 
						'Shared', 
						'Name' ,
						'Link', 
						'ExtendedProps'
					)
				);
			}
			$oResult /*@var $oResult \Aurora\Modules\Files\Classes\FileItem */ = new  \Aurora\Modules\Files\Classes\FileItem();

			$oResult->Type = $sType;
			$oResult->TypeStr = $sType;
			$oResult->RealPath = $oItem->getPath();
			$oResult->Path = $sFilePath;
			$oResult->Name = $oItem->getName();
			$oResult->Id = $oItem->getName();
			$oResult->FullPath = $oResult->Name !== '' ? $oResult->Path . '/' . $oResult->Name : $oResult->Path ;

			$sID = '';
			if ($oItem instanceof \Afterlogic\DAV\FS\Directory)
			{
				$sID = $this->generateHashId($iUserId, $sType, $sFilePath, $oItem->getName());
				$oResult->IsFolder = true;
				$oResult->AddAction([
					'list' => []
				]);
			}

			if ($oItem instanceof \Afterlogic\DAV\FS\File)
			{
				$oResult->AddAction([
					'view' => [
						'url' => '?download-file/' . $oResult->getHash($sPublicHash) .'/view'
					]
				]);
				$sID = $this->generateHashId($iUserId, $sType, $sFilePath, $oItem->getName());
				$oResult->IsFolder = false;
				$oResult->Size = $oItem->getSize();

				$aPathInfo = pathinfo($oResult->Name);
				if (isset($aPathInfo['extension']) && strtolower($aPathInfo['extension']) === 'url')
				{
					$aUrlFileInfo = \Aurora\System\Utils::parseIniString(stream_get_contents($oItem->get()));
					if ($aUrlFileInfo && isset($aUrlFileInfo['URL']))
					{
						$oResult->IsLink = true;
						$oResult->LinkUrl = $aUrlFileInfo['URL'];
						$oResult->AddAction([
							'open' => [
								'url' => $aUrlFileInfo['URL']
							]
						]);
					}
					else
					{
						$oResult->AddAction([
							'download' => [
								'url' => '?download-file/' . $oResult->getHash($sPublicHash)
							]
						]);						
					}
					if (!$oResult->ContentType && isset($aPathInfo['filename']))
					{
						$oResult->ContentType = \Aurora\System\Utils::MimeContentType($aPathInfo['filename']);
					}							
				}
				else						
				{
					$oResult->AddAction([
						'download' => [
							'url' => '?download-file/' . $oResult->getHash($sPublicHash)
						]
					]);
					$oResult->ContentType = $oItem->getContentType();
				}

				$aArgs = array(
					'UserId' => $iUserId
				);

				$oResult->LastModified = $oItem->getLastModified();
				if (!$oResult->ContentType)
				{
					$oResult->ContentType = \Aurora\System\Utils::MimeContentType($oResult->Name);
				}

				$oSettings =& \Aurora\System\Api::GetSettings();
				if ($oSettings->GetConf('AllowThumbnail', true) && !$oResult->Thumb)
				{
					$iThumbnailLimit = ((int) $oSettings->GetConf('ThumbnailMaxFileSizeMb', 5)) * 1024 * 1024;
					$oResult->Thumb = $oResult->Size < $iThumbnailLimit && \Aurora\System\Utils::IsGDImageMimeTypeSuppoted($oResult->ContentType, $oResult->Name);
				}
			}

			$mMin = $oMin->getMinByID($sID);

			$oResult->Shared = isset($aProps['Shared']) ? $aProps['Shared'] : empty($mMin['__hash__']) ? false : true;
			$oResult->Owner = isset($aProps['Owner']) ? $aProps['Owner'] : $iUserId;
			$oResult->ExtendedProps = isset($aProps['ExtendedProps']) ? $aProps['ExtendedProps'] : false;
		}

		return $oResult;
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param string $sPath
	 *
	 * @return Afterlogic\DAV\FS\Directory|null
	 */
	public function getDirectoryInfo($iUserId, $sType, $sPath)
	{
		$sResult = null;
		$oDirectory = $this->getDirectory($iUserId, $sType, $sPath);
		if ($oDirectory !== null && $oDirectory instanceof \Afterlogic\DAV\FS\Directory)
		{
			$sResult = $oDirectory->getChildrenProperties();
		}

		return $sResult;
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param string $sPath
	 * @param string $sName
	 *
	 * @return Afterlogic\DAV\FS\File|null
	 */
	public function getFile($iUserId, $sType, $sPath, $sName)
	{
		$sResult = null;
		$oDirectory = $this->getDirectory($iUserId, $sType, $sPath);
		if ($oDirectory instanceof \Afterlogic\DAV\FS\Directory)
		{
			$oItem = $oDirectory->getChild($sName);
			if ($oItem instanceof \Afterlogic\DAV\FS\File)
			{
				$sResult = $oItem->get();
			}
		}

		return $sResult;
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param string $sPath
	 * @param string $sName
	 *
	 * @return string|false
	 */
	public function createPublicLink($iUserId, $sType, $sPath, $sName, $sSize, $bIsFolder)
	{
		$mResult = false;

		$sID = $this->generateHashId($iUserId, $sType, $sPath, $sName);
		
		$oMin = $this->getApiMinManager();
		$mMin = $oMin->getMinByID($sID);
		if (!empty($mMin['__hash__']))
		{
			$mResult = $mMin['__hash__'];
		}
		else
		{
			$mResult = $oMin->createMin(
				$sID, 
				array(
					'UserId' => $iUserId,
					'Type' => $sType, 
					'Path' => $sPath, 
					'Name' => $sName,
					'Size' => $sSize,
					'IsFolder' => $bIsFolder
				)
			);
		}
		
		return '?/files-pub/' . $mResult . '/list';
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param string $sPath
	 * @param string $sName
	 *
	 * @return bool
	 */
	public function deletePublicLink($iUserId, $sType, $sPath, $sName)
	{
		$oMin = $this->getApiMinManager();

		return $oMin->deleteMinByID(
			$this->generateHashId($iUserId, $sType, $sPath, $sName)
		);
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param string $sPath
	 * @param string $sPattern
	 * @param string $sPublicHash
	 *
	 * @return array
	 */
	public function getFiles($iUserId, $sType = \Aurora\System\Enums\FileStorageType::Personal, $sPath = '', $sPattern = '', $sPublicHash = null)
	{
		
		$oDirectory = null;
		$aItems = array();
		$aResult = array();
		
		$oTenant = null;
		$oApiTenants = false; //\Aurora\System\Api::GetCoreManager('tenants');
		if ($oApiTenants)
		{
			$oTenant = /*(0 < $oAccount->IdTenant) ? $oApiTenants->getTenantById($oAccount->IdTenant) :*/
				$oApiTenants->getDefaultGlobalTenant();
		}

		$oDirectory = $this->getDirectory($iUserId, $sType, $sPath);
		if ($oDirectory !== null && $oDirectory instanceof \Afterlogic\DAV\FS\Directory)
		{
			if (!empty($sPattern) || is_numeric($sPattern))
			{
				$aItems = $oDirectory->Search($sPattern);
				$aDirectoryInfo = $oDirectory->getChildrenProperties();
				foreach ($aDirectoryInfo as $oDirectoryInfo)
				{
					if (isset($oDirectoryInfo['Link']) && strpos($oDirectoryInfo['Name'], $sPattern) !== false)
					{
						$aItems[] = new \Afterlogic\DAV\FS\File($oDirectory->getPath() . '/' . $oDirectoryInfo['@Name']);
					}
				}
			}
			else
			{
				$aItems = $oDirectory->getChildren();
			}

			foreach ($aItems as $oItem) 
			{
				$aResult[] = $this->getFileInfo($iUserId, $sType, $oItem, $sPublicHash);
			}
		}
		
		return $aResult;
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param string $sPath
	 * @param string $sFolderName
	 *
	 * @return bool
	 */
	public function createFolder($iUserId, $sType, $sPath, $sFolderName)
	{
		$oDirectory = $this->getDirectory($iUserId, $sType, $sPath);

		if ($oDirectory instanceof \Afterlogic\DAV\FS\Directory)
		{
			$oDirectory->createDirectory($sFolderName);
			return true;
		}

		return false;
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param string $sPath
	 * @param string $sLink
	 * @param string $sName
	 *
	 * @return bool
	 */
	public function createLink($iUserId, $sType, $sPath, $sLink, $sName)
	{
		$oDirectory = $this->getDirectory($iUserId, $sType, $sPath);

		if ($oDirectory instanceof \Afterlogic\DAV\FS\Directory)
		{
			$sFileName = $sName . '.url';

			$oDirectory->createFile(
				$sFileName, 
				"[InternetShortcut]\r\nURL=\"" . $sLink . "\"\r\n"
			);
			$oItem = $oDirectory->getChild($sFileName);
			$oItem->updateProperties(array(
				'Owner' => $iUserId
			));

			return true;
		}

		return false;
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param string $sPath
	 * @param string $sFileName
	 * @param string $sData
	 *
	 * @return bool
	 */
	public function createFile($iUserId, $sType, $sPath, $sFileName, $sData, $rangeType, $offset, $extendedProps = [])
	{
		$oDirectory = $this->getDirectory($iUserId, $sType, $sPath);

		if ($oDirectory instanceof \Afterlogic\DAV\FS\Directory)
		{
			$oDirectory->createFile($sFileName, $sData, $rangeType, $offset, $extendedProps);
			return true;
		}

		return false;
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param string $sPath
	 * @param string $sName
	 *
	 * @return bool
	 */
	public function delete($iUserId, $sType, $sPath, $sName)
	{
		$oDirectory = $this->getDirectory($iUserId, $sType, $sPath);
		$oItem = $oDirectory->getChild($sName);
		if ($oItem !== null)
		{
			if ($oItem instanceof \Afterlogic\DAV\FS\Directory)
			{
				$this->updateMin($iUserId, $sType, $sPath, $sName, $sName, $oItem, true);
			}
			$oItem->delete();
			return true;
		}

		return false;
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param string $sPath
	 * @param string $sName
	 * @param string $sNewName
	 * @param Afterlogic\DAV\FS\File|Afterlogic\DAV\FS\Directory
	 * @param bool $bDelete Default value is **false**.
	 *
	 * @return bool
	 */
	public function updateMin($iUserId, $sType, $sPath, $sName, $sNewName, $oItem, $bDelete = false)
	{
		if ($iUserId)
		{
			$oApiMinManager = $this->getApiMinManager();

			$sRootPath = $this->getRootPath($iUserId, $sType, true);

			$sOldPath = $sPath . '/' . $sName;
			$sNewPath = $sPath . '/' . $sNewName;

			if ($oItem instanceof \Afterlogic\DAV\FS\Directory)
			{
				foreach ($oItem->getChildren() as $oChild)
				{
					if ($oChild instanceof \Afterlogic\DAV\FS\File)
					{
						$sChildPath = substr(dirname($oChild->getPath()), strlen($sRootPath));
						$sID = $this->generateHashId($iUserId, $sType, $sChildPath, $oChild->getName());
						if ($bDelete)
						{
							$oApiMinManager->deleteMinByID($sID);
						}
						else
						{
							$mMin = $oApiMinManager->getMinByID($sID);
							if (!empty($mMin['__hash__']))
							{
								$sNewChildPath = $sNewPath . substr($sChildPath, strlen($sOldPath));
								$sNewID = $this->generateHashId($iUserId, $sType, $sNewChildPath, $oChild->getName());
								$mMin['Path'] = $sNewChildPath;
								$oApiMinManager->updateMinByID($sID, $mMin, $sNewID);
							}					
						}
					}
					if ($oChild instanceof \Afterlogic\DAV\FS\Directory)
					{
						$this->updateMin($iUserId, $sType, $sPath, $sName, $sNewName, $oChild, $bDelete);
					}
				}
			}
		}
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param string $sPath
	 * @param string $sName
	 * @param string $sNewName
	 *
	 * @return bool
	 */
	public function rename($iUserId, $sType, $sPath, $sName, $sNewName)
	{
		$oDirectory = $this->getDirectory($iUserId, $sType, $sPath);
		if ($oDirectory instanceof \Afterlogic\DAV\FS\Directory)
		{
			$oItem = $oDirectory->getChild($sName);
			if ($oItem !== null)
			{
				if (strlen($sNewName) < 200)
				{
					$this->updateMin($iUserId, $sType, $sPath, $sName, $sNewName, $oItem);
					$oItem->setName($sNewName);
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * @param int $iUserId
	 * @param string $sType
	 * @param string $sPath
	 * @param string $sName
	 * @param string $sNewName
	 *
	 * @return bool
	 */
	public function renameLink($iUserId, $sType, $sPath, $sName, $sNewName)
	{
		$oDirectory = $this->getDirectory($iUserId, $sType, $sPath);
		$oItem = $oDirectory->getChild($sName);

		if ($oItem)
		{
			$oItem->updateProperties(array(
				'Name' => $sNewName
			));
			return true;
		}
		return false;
	}

	/**
	 * @param int $iUserId
	 * @param string $sFromType
	 * @param string $sToType
	 * @param string $sFromPath
	 * @param string $sToPath
	 * @param string $sName
	 * @param string $sNewName
	 * @param bool $bMove Default value is **false**.
	 *
	 * @return bool
	 */
	public function copy($iUserId, $sFromType, $sToType, $sFromPath, $sToPath, $sName, $sNewName, $bMove = false)
	{
		$oApiMinManager = $this->getApiMinManager();

		if (empty($sNewName) && !is_numeric($sNewName))
		{
			$sNewName = $sName;
		}

		$sFromRootPath = $this->getRootPath($iUserId, $sFromType, true);
		$sToRootPath = $this->getRootPath($iUserId, $sToType, true);

		$oFromDirectory = $this->getDirectory($iUserId, $sFromType, $sFromPath);
		$oToDirectory = $this->getDirectory($iUserId, $sToType, $sToPath);

		if ($oToDirectory && $oFromDirectory)
		{
			$oItem = $oFromDirectory->getChild($sName);
			if ($oItem !== null)
			{
				if ($oItem instanceof \Afterlogic\DAV\FS\File)
				{
					$oToDirectory->createFile($sNewName, $oItem->get());

					$oItemNew = $oToDirectory->getChild($sNewName);
					$aProps = $oItem->getProperties(array());
					if (!$bMove)				
					{
						$aProps['Owner'] = $iUserId;
					}
					else
					{
						$sChildPath = substr(dirname($oItem->getPath()), strlen($sFromRootPath));
						$sID = $this->generateHashId($iUserId, $sFromType, $sChildPath, $oItem->getName());

						$sNewChildPath = substr(dirname($oItemNew->getPath()), strlen($sToRootPath));

						$mMin = $oApiMinManager->getMinByID($sID);
						if (!empty($mMin['__hash__']))
						{
							$sNewID = $this->generateHashId($iUserId, $sToType, $sNewChildPath, $oItemNew->getName());

							$mMin['Path'] = $sNewChildPath;
							$mMin['Type'] = $sToType;
							$mMin['Name'] = $oItemNew->getName();

							$oApiMinManager->updateMinByID($sID, $mMin, $sNewID);
						}					
					}
					$oItemNew->updateProperties($aProps);
				}
				if ($oItem instanceof \Afterlogic\DAV\FS\Directory)
				{
					$oToDirectory->createDirectory($sNewName);
					$oChildren = $oItem->getChildren();
					foreach ($oChildren as $oChild)
					{
						$sChildNewName = $this->getNonExistentFileName(
								$iUserId, 
								$sToType, 
								$sToPath . '/' . $sNewName, 
								$oChild->getName()
						);
						$this->copy(
							$iUserId, 
							$sFromType, 
							$sToType, 
							$sFromPath . '/' . $sName, 
							$sToPath . '/' . $sNewName, 
							$oChild->getName(), 
							$sChildNewName, 
							$bMove
						);
					}
				}
				if ($bMove)
				{
					$oItem->delete();
				}
				return true;
			}
		}
		return false;
	}

	/**
	 * Returns user used space in bytes for specified storages.
	 * 
	 * @param int $iUserId User identifier.
	 * @param string $aTypes Storage type list. Accepted values in array: **\Aurora\System\Enums\FileStorageType::Personal**, **\Aurora\System\Enums\FileStorageType::Corporate**, **\Aurora\System\Enums\FileStorageType::Shared**.
	 * 
	 * @return int;
	 */
	public function getUserSpaceUsed($iUserId, $aTypes)
	{
		$iUsageSize = 0;
		
		if ($iUserId)
		{
			foreach ($aTypes as $sType)
			{
				$sRootPath = $this->getRootPath($iUserId, $sType, true);
				$aSize = \Aurora\System\Utils::GetDirectorySize($sRootPath);
				$iUsageSize += (int) $aSize['size'];
			}
		}
		
		return $iUsageSize;
	}

	/**
	 * @param \Aurora\Modules\StandardAuth\Classes\Account $oAccount
	 * @param int $iType
	 * @param string $sPath
	 * @param string $sFileName
	 *
	 * @return string
	 */
	public function getNonExistentFileName($oAccount, $iType, $sPath, $sFileName)
	{
		$iIndex = 0;
		$sFileNamePathInfo = pathinfo($sFileName);
		$sUploadNameExt = '';
		$sUploadNameWOExt = $sFileName;
		if (isset($sFileNamePathInfo['extension']))
		{
			$sUploadNameExt = '.'.$sFileNamePathInfo['extension'];
		}

		if (isset($sFileNamePathInfo['filename']))
		{
			$sUploadNameWOExt = $sFileNamePathInfo['filename'];
		}

		while ($this->isFileExists($oAccount, $iType, $sPath, $sFileName))
		{
			$sFileName = $sUploadNameWOExt.'_'.$iIndex.$sUploadNameExt;
			$iIndex++;
		}

		return $sFileName;
	}

	/**
	 * @param int $iUserId
	 */
	public function clearPrivateFiles($iUserId)
	{
		if ($iUserId)
		{
			$sRootPath = $this->getRootPath($iUserId, \Aurora\System\Enums\FileStorageType::Personal, true);
			\Aurora\System\Utils::RecRmdir($sRootPath);
		}
	}

	/**
	 * @param int $iUserId
	 */
	public function clearCorporateFiles($iUserId)
	{
		// TODO
	}
}

