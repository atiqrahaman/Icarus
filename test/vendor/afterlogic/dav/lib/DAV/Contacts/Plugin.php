<?php

/* -AFTERLOGIC LICENSE HEADER- */

namespace Afterlogic\DAV\Contacts;

class Plugin extends \Sabre\DAV\ServerPlugin
{

    /**
     * Reference to main server object
     *
     * @var \Sabre\DAV\Server
     */
    private $oServer;
	
	private $oContactsDecorator;
	private $oDavContactsDecorator;

    /**
     * __construct
     *
     * @return void
     */
    public function __construct()
    {
		$this->oContactsDecorator = \Aurora\Modules\Contacts\Module::Decorator();
		$this->oDavContactsDecorator = \Aurora\Modules\DavContacts\Module::Decorator();
	}

    public function initialize(\Sabre\DAV\Server $oServer)
    {
        $this->oServer = $oServer;
		$this->oServer->on('beforeUnbind', array($this, 'beforeUnbind'),30);
        $this->oServer->on('afterUnbind', array($this, 'afterUnbind'),30);
		$this->oServer->on('afterWriteContent', array($this, 'afterWriteContent'), 30);
		$this->oServer->on('afterCreateFile', array($this, 'afterCreateFile'), 30);
    }

    /**
     * Returns a plugin name.
     *
     * Using this name other plugins will be able to access other plugins
     * using \Sabre\DAV\Server::getPlugin
     *
     * @return string
     */
    public function getPluginName()
    {
        return 'contacts';
    }

    /**
     * @param string $sPath
     * @throws \Sabre\DAV\Exception\NotAuthenticated
     * @return bool
     */
    public function beforeUnbind($sPath)
    {
		return true;
	}    
	
	/**
     * @param string $sPath
     * @throws \Sabre\DAV\Exception\NotAuthenticated
     * @return bool
     */
    public function afterUnbind($sPath)
    {
		if ($this->oContactsDecorator) 
		{
			$iUserId = 0;
			$sUserPublicId = $this->oServer->getUser();
			$oCoreDecorator = \Aurora\Modules\Core\Module::Decorator();
			if ($oCoreDecorator)
			{
				$oUser = $oCoreDecorator->GetUserByUUID($sUserPublicId);
				if ($oUser instanceof \Aurora\Modules\Core\Classes\User)
				{
					$iUserId = $oUser->iId;
				}
			}
			
			if ($iUserId > 0) 
			{
				$aPathInfo = pathinfo($sPath);
				\Aurora\System\Api::setUserId($iUserId);
				$this->oContactsDecorator->DeleteContacts(
					array($aPathInfo['filename'])
				);
			}
		}
		return true;
	}
	
	function afterCreateFile($sPath, \Sabre\DAV\ICollection $oParent)
	{
		$aPathInfo = pathinfo($sPath);
		$sUUID = $aPathInfo['filename'];
		$oNode = $oParent->getChild($aPathInfo['basename']);
		if ($oNode instanceof \Sabre\CardDAV\ICard && $this->oContactsDecorator) 
		{
			$iUserId = 0;
			$sUserPublicId = $this->oServer->getUser();
			$oCoreDecorator = \Aurora\Modules\Core\Module::Decorator();
			if ($oCoreDecorator)
			{
				$oUser = $oCoreDecorator->GetUserByPublicId($sUserPublicId);
				if ($oUser instanceof \Aurora\Modules\Core\Classes\User)
				{
					$iUserId = $oUser->EntityId;
				}
			}
			
			if ($iUserId > 0) 
			{
				\Aurora\System\Api::setUserId($iUserId);
				$this->oDavContactsDecorator->CreateContact($iUserId, $oNode->get(), $sUUID);
			}
		}
	}

	function afterWriteContent($sPath, \Sabre\DAV\IFile $oNode)
	{
		if ($oNode instanceof \Sabre\CardDAV\ICard && $this->oContactsDecorator) 
		{
			$iUserId = 0;
			$sUserPublicId = $this->oServer->getUser();
			
			$oCoreDecorator = \Aurora\Modules\Core\Module::Decorator();
			if ($oCoreDecorator)
			{
				$oUser = $oCoreDecorator->GetUserByPublicId($sUserPublicId);
				if ($oUser instanceof \Aurora\Modules\Core\Classes\User)
				{
					$iUserId = $oUser->EntityId;
				}
			}
			
			if ($iUserId > 0) 
			{
				\Aurora\System\Api::setUserId($iUserId);

				$sPath = $oNode->getName();
				$aPathInfo = pathinfo($sPath);
				$sUUID = $aPathInfo['filename'];
				$oContactDb = $this->oContactsDecorator->GetContact(
					$sUUID
				);
				if (!isset($oContactDb)) 
				{
					$oVCard = \Sabre\VObject\Reader::read(
						$oNode->get(), 
						\Sabre\VObject\Reader::OPTION_IGNORE_INVALID_LINES
					);

					if ($oVCard && $oVCard->UID)
					{
						$oContactDb = $this->oContactsDecorator->GetContact(
							(string)$oVCard->UID
						);
					}
				}

				\Aurora\System\Api::LogObject($iUserId, \Aurora\System\Enums\LogLevel::Full, 'dav-');
				if (isset($oContactDb)) 
				{
					\Aurora\System\Api::Log('UpdateContact', \Aurora\System\Enums\LogLevel::Full, 'dav-');
					$this->oDavContactsDecorator->UpdateContact($oNode->get(), $sUUID);
				} 
				else 
				{
					\Aurora\System\Api::Log('CreateContact', \Aurora\System\Enums\LogLevel::Full, 'dav-');
					$this->oDavContactsDecorator->CreateContact($iUserId, $oNode->get(), $sUUID);
				}
			}
		}
	}

}
