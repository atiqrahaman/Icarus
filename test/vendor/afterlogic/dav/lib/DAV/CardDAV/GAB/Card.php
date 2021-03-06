<?php

/* -AFTERLOGIC LICENSE HEADER- */

namespace Afterlogic\DAV\CardDAV\GAB;

class Card extends \Sabre\DAV\File implements \Sabre\CardDAV\ICard {

    /**
     * Contact info
     * 
     * @var array 
     */
    private $_cardInfo;

    /**
     * Constructor
     * 
     * @param array $cardInfo 
     */
    public function __construct(array $cardInfo) {

        $this->_cardInfo = $cardInfo;

    }

    /**
     * Returns the node name
     *
     * @return void
     */
    public function getName() {

        return $this->_cardInfo['uri'];

    }
	
    /**
     * Returns the mime content-type
     *
     * @return string
     */
    public function getContentType() {

        return 'text/x-vcard; charset=utf-8';

    }	

    /**
     * Returns the vcard 
     * 
     * @return string 
     */
    public function get() {

        return $this->_cardInfo['carddata'];

    }

    /**
     * Returns the last modification timestamp
     * 
     * @return int 
     */
    public function getLastModified() {

        return $this->_cardInfo['lastmodified'];

    }

    /**
     * Returns the size of the vcard
     * 
     * @return int 
     */
    public function getSize() {

        return strlen($this->_cardInfo['carddata']);

    }
	
    function getETag() {

        if (isset($this->cardData['etag'])) {
            return $this->cardData['etag'];
        } else {
            $data = $this->get();
            if (is_string($data)) {
                return '"' . md5($data) . '"';
            } else {
                // We refuse to calculate the md5 if it's a stream.
                return null;
            }
        }

    }
}
