webpackJsonp([5],{

/***/ 233:
/*!*********************************************************!*\
  !*** ./modules/CoreWebclient/js/popups/ConfirmPopup.js ***!
  \*********************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		$ = __webpack_require__(/*! jquery */ 1),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		
		CAbstractPopup = __webpack_require__(/*! modules/CoreWebclient/js/popups/CAbstractPopup.js */ 188)
	;

	/**
	 * @constructor
	 */
	function CConfirmPopup()
	{
		CAbstractPopup.call(this);
		
		this.fConfirmCallback = null;
		this.confirmDesc = ko.observable('');
		this.popupHeading = ko.observable('');
		this.okButtonText = ko.observable(TextUtils.i18n('COREWEBCLIENT/ACTION_OK'));
		this.cancelButtonText = ko.observable(TextUtils.i18n('COREWEBCLIENT/ACTION_CANCEL'));
		this.shown = false;
	}

	_.extendOwn(CConfirmPopup.prototype, CAbstractPopup.prototype);

	CConfirmPopup.prototype.PopupTemplate = 'CoreWebclient_ConfirmPopup';

	/**
	 * @param {string} sDesc
	 * @param {Function} fConfirmCallback
	 * @param {string=} sHeading = ''
	 * @param {string=} sOkButtonText = ''
	 * @param {string=} sCancelButtonText = ''
	 */
	CConfirmPopup.prototype.onOpen = function (sDesc, fConfirmCallback, sHeading, sOkButtonText, sCancelButtonText)
	{
		this.confirmDesc(sDesc);
		this.popupHeading(sHeading || '');
		this.okButtonText(sOkButtonText || TextUtils.i18n('COREWEBCLIENT/ACTION_OK'));
		this.cancelButtonText(sCancelButtonText || TextUtils.i18n('COREWEBCLIENT/ACTION_CANCEL'));
		if ($.isFunction(fConfirmCallback))
		{
			this.fConfirmCallback = fConfirmCallback;
		}
		this.shown = true;
	};

	CConfirmPopup.prototype.onHide = function ()
	{
		this.shown = false;
	};

	CConfirmPopup.prototype.onEnterHandler = function ()
	{
		this.yesClick();
	};

	CConfirmPopup.prototype.yesClick = function ()
	{
		if (this.shown && this.fConfirmCallback)
		{
			this.fConfirmCallback(true);
		}

		this.closePopup();
	};

	CConfirmPopup.prototype.cancelPopup = function ()
	{
		if (this.fConfirmCallback)
		{
			this.fConfirmCallback(false);
		}

		this.closePopup();
	};

	module.exports = new CConfirmPopup();


/***/ }),

/***/ 266:
/*!*******************************************************!*\
  !*** ./modules/CoreWebclient/js/vendors/FileSaver.js ***!
  \*******************************************************/
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* FileSaver.js
	 * A saveAs() FileSaver implementation.
	 * 1.3.2
	 * 2016-06-16 18:25:19
	 *
	 * By Eli Grey, http://eligrey.com
	 * License: MIT
	 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
	 */

	/*global self */
	/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

	/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

	var saveAs = saveAs || (function(view) {
		"use strict";
		// IE <10 is explicitly unsupported
		if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
			return;
		}
		var
			  doc = view.document
			  // only get URL when necessary in case Blob.js hasn't overridden it yet
			, get_URL = function() {
				return view.URL || view.webkitURL || view;
			}
			, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
			, can_use_save_link = "download" in save_link
			, click = function(node) {
				var event = new MouseEvent("click");
				node.dispatchEvent(event);
			}
			, is_safari = /constructor/i.test(view.HTMLElement) || view.safari
			, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
			, throw_outside = function(ex) {
				(view.setImmediate || view.setTimeout)(function() {
					throw ex;
				}, 0);
			}
			, force_saveable_type = "application/octet-stream"
			// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
			, arbitrary_revoke_timeout = 1000 * 40 // in ms
			, revoke = function(file) {
				var revoker = function() {
					if (typeof file === "string") { // file is an object URL
						get_URL().revokeObjectURL(file);
					} else { // file is a File
						file.remove();
					}
				};
				setTimeout(revoker, arbitrary_revoke_timeout);
			}
			, dispatch = function(filesaver, event_types, event) {
				event_types = [].concat(event_types);
				var i = event_types.length;
				while (i--) {
					var listener = filesaver["on" + event_types[i]];
					if (typeof listener === "function") {
						try {
							listener.call(filesaver, event || filesaver);
						} catch (ex) {
							throw_outside(ex);
						}
					}
				}
			}
			, auto_bom = function(blob) {
				// prepend BOM for UTF-8 XML and text/* types (including HTML)
				// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
				if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
					return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
				}
				return blob;
			}
			, FileSaver = function(blob, name, no_auto_bom) {
				if (!no_auto_bom) {
					blob = auto_bom(blob);
				}
				// First try a.download, then web filesystem, then object URLs
				var
					  filesaver = this
					, type = blob.type
					, force = type === force_saveable_type
					, object_url
					, dispatch_all = function() {
						dispatch(filesaver, "writestart progress write writeend".split(" "));
					}
					// on any filesys errors revert to saving with object URLs
					, fs_error = function() {
						if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
							// Safari doesn't allow downloading of blob urls
							var reader = new FileReader();
							reader.onloadend = function() {
								var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
								var popup = view.open(url, '_blank');
								if(!popup) view.location.href = url;
								url=undefined; // release reference before dispatching
								filesaver.readyState = filesaver.DONE;
								dispatch_all();
							};
							reader.readAsDataURL(blob);
							filesaver.readyState = filesaver.INIT;
							return;
						}
						// don't create more object URLs than needed
						if (!object_url) {
							object_url = get_URL().createObjectURL(blob);
						}
						if (force) {
							view.location.href = object_url;
						} else {
							var opened = view.open(object_url, "_blank");
							if (!opened) {
								// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
								view.location.href = object_url;
							}
						}
						filesaver.readyState = filesaver.DONE;
						dispatch_all();
						revoke(object_url);
					}
				;
				filesaver.readyState = filesaver.INIT;

				if (can_use_save_link) {
					object_url = get_URL().createObjectURL(blob);
					setTimeout(function() {
						save_link.href = object_url;
						save_link.download = name;
						click(save_link);
						dispatch_all();
						revoke(object_url);
						filesaver.readyState = filesaver.DONE;
					});
					return;
				}

				fs_error();
			}
			, FS_proto = FileSaver.prototype
			, saveAs = function(blob, name, no_auto_bom) {
				return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
			}
		;
		// IE 10+ (native saveAs)
		if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
			return function(blob, name, no_auto_bom) {
				name = name || blob.name || "download";

				if (!no_auto_bom) {
					blob = auto_bom(blob);
				}
				return navigator.msSaveOrOpenBlob(blob, name);
			};
		}

		FS_proto.abort = function(){};
		FS_proto.readyState = FS_proto.INIT = 0;
		FS_proto.WRITING = 1;
		FS_proto.DONE = 2;

		FS_proto.error =
		FS_proto.onwritestart =
		FS_proto.onprogress =
		FS_proto.onwrite =
		FS_proto.onabort =
		FS_proto.onerror =
		FS_proto.onwriteend =
			null;

		return saveAs;
	}(
		   typeof self !== "undefined" && self
		|| typeof window !== "undefined" && window
		|| this.content
	));
	// `self` is undefined in Firefox for Android content script context
	// while `this` is nsIContentFrameMessageManager
	// with an attribute `content` that corresponds to the window

	if (typeof module !== "undefined" && module.exports) {
	  module.exports.saveAs = saveAs;
	} else if (("function" !== "undefined" && __webpack_require__(/*! !webpack amd define */ 48) !== null) && (__webpack_require__(/*! !webpack amd options */ 267) !== null)) {
	  !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	    return saveAs;
	  }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}


/***/ }),

/***/ 267:
/*!****************************************!*\
  !*** (webpack)/buildin/amd-options.js ***!
  \****************************************/
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;

	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ }),

/***/ 275:
/*!*********************************************************************!*\
  !*** ./modules/CoreParanoidEncryptionWebclientPlugin/js/manager.js ***!
  \*********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/enums.js */ 276);

	var	
		_ = __webpack_require__(/*! underscore */ 2),
		
		App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179),
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
		CCrypto = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/CCrypto.js */ 277),
		Settings = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/Settings.js */ 280),
		Popups = __webpack_require__(/*! modules/CoreWebclient/js/Popups.js */ 186),
		ConfirmEncryptionPopup = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/popups/ConfirmEncryptionPopup.js */ 281),
		ConfirmUploadPopup = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/popups/ConfirmUploadPopup.js */ 282),
		Browser = __webpack_require__(/*! modules/CoreWebclient/js/Browser.js */ 178),
		AwaitConfirmationQueue = [],	//List of files waiting for the user to decide on encryption
		isConfirmPopupShown = false
	;
			
	function IsJscryptoSupported()
	{
		if (Browser.chrome && !IsHttpsEnable())
		{
			return !!window.crypto;
		}
		return !!window.crypto && !!window.crypto.subtle;
	}

	function IsHttpsEnable()
	{
		return window.location.protocol === "https:";
	}

	function ShowUploadPopup(sUid, oFileInfo, fUpload, fCancel, sErrorText)
	{
		if (isConfirmPopupShown)
		{
			AwaitConfirmationQueue.push({
				sUid: sUid,
				oFileInfo: oFileInfo
			});
		}
		else
		{
			setTimeout(function () {
				Popups.showPopup(ConfirmUploadPopup, [
					fUpload,
					fCancel,
					AwaitConfirmationQueue.length,
					_.map(AwaitConfirmationQueue, function(element) {
						return element.oFileInfo.FileName; 
					}),
					sErrorText
				]);
			}, 10);
			isConfirmPopupShown = true;
			AwaitConfirmationQueue.push({
				sUid: sUid,
				oFileInfo: oFileInfo
			});
		}
	}

	module.exports = function (oAppData) {
		Settings.init(oAppData);
		
		return {
			/**
			 * Runs before application start. Subscribes to the event before post displaying.
			 * 
			 * @param {Object} ModulesManager
			 */
			start: function (ModulesManager) {
				if (IsJscryptoSupported())
				{
					ModulesManager.run('SettingsWebclient', 'registerSettingsTab', [
						function () { return __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/views/ParanoidEncryptionSettingsFormView.js */ 283); },
						Settings.HashModuleName,
						TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/LABEL_SETTINGS_TAB')
					]);
					
					App.subscribeEvent('AbstractFileModel::FileDownload::before', function (oParams) {
						var
							oFile = oParams.File,
							iv = 'oExtendedProps' in oFile ? ('InitializationVector' in oFile.oExtendedProps ? oFile.oExtendedProps.InitializationVector : false) : false
						;
						//User can decrypt only own files
						if (!Settings.EnableJscrypto() || !iv || oFile.sOwnerName !== App.getUserPublicId())
						{
							//regular upload will start in Jua in this case
						}
						else if (!IsHttpsEnable())
						{
							Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_HTTPS_NEEDED'));
							oParams.CancelDownload = true;
						}
						else if (!CCrypto.getCryptoKey())
						{
							Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/INFO_EMPTY_JSCRYPTO_KEY'));
							oParams.CancelDownload = true;
						}
						else
						{
							oParams.CustomDownloadHandler = function () {
								oFile.startDownloading();
								CCrypto.downloadDividedFile(oFile, iv);
							};
						}
					});
					
					App.subscribeEvent('Jua::FileUpload::before', function (oParams) {
						var
							sUid = oParams.sUid,
							sModuleName = oParams.sModuleName,
							oFileInfo = oParams.oFileInfo,
							fOnChunkEncryptCallback = oParams.fOnChunkReadyCallback,
							fRegularUploadFileCallback = oParams.fRegularUploadFileCallback,
							fCancelFunction = oParams.fCancelFunction,
							fStartUploadCallback = function (oFileInfo, sUid, fOnChunkEncryptCallback) {
								// Starts upload an encrypted file
								CCrypto.oChunkQueue.isProcessed = true;
								CCrypto.start(oFileInfo);
								CCrypto.readChunk(sUid, fOnChunkEncryptCallback);
							},
							fUpload = _.bind(function () {
								AwaitConfirmationQueue.forEach(function (element) {
									fRegularUploadFileCallback(element.sUid, element.oFileInfo);
								});
								AwaitConfirmationQueue = [];
								isConfirmPopupShown = false;
							}, this),
							fEncrypt = _.bind(function () {
								AwaitConfirmationQueue.forEach(function (element) {
									// if another file is being uploaded now - add a file to the queue
									CCrypto.oChunkQueue.aFiles.push({
										fStartUploadCallback: fStartUploadCallback,
										oFileInfo: element.oFileInfo, 
										sUid: element.sUid, 
										fOnChunkEncryptCallback: fOnChunkEncryptCallback
									});
								});
								AwaitConfirmationQueue = [];
								isConfirmPopupShown = false;
								if (!CCrypto.oChunkQueue.isProcessed)
								{
									CCrypto.oChunkQueue.isProcessed = true;
									CCrypto.checkQueue();
								}
							}),
							fCancel = _.bind(function () {
								AwaitConfirmationQueue.forEach(function (element) {
									fCancelFunction(element.sUid);
								});
								AwaitConfirmationQueue = [];
								isConfirmPopupShown = false;
							})
						;

						if (!Settings.EnableJscrypto() || (Settings.EncryptionAllowedModules && Settings.EncryptionAllowedModules.length > 0 && !Settings.EncryptionAllowedModules.includes(sModuleName))
							|| Settings.EncryptionMode() == Enums.EncryptionMode.Never)
						{
							fRegularUploadFileCallback(sUid, oFileInfo);
						}
						else if (!IsHttpsEnable())
						{
							if (Settings.EncryptionMode() == Enums.EncryptionMode.Always)
							{
								//for Always encryption mode show error
								Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_HTTPS_NEEDED'));
								fCancelFunction(sUid);
							}
							else if (Settings.EncryptionMode() == Enums.EncryptionMode.AskMe)
							{
								//for AskMe encryption mode show dialog with warning and regular upload button
								ShowUploadPopup(sUid, oFileInfo, fUpload, fCancel, TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_HTTPS_NEEDED'));
							}
						}
						else if (!CCrypto.getCryptoKey())
						{
							if (Settings.EncryptionMode() == Enums.EncryptionMode.Always)
							{
								//for Always encryption mode show error
								Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/INFO_EMPTY_JSCRYPTO_KEY'));
								fCancelFunction(sUid);
							}
							else if (Settings.EncryptionMode() == Enums.EncryptionMode.AskMe)
							{
								//for AskMe encryption mode show dialog with warning and regular upload button
								ShowUploadPopup(sUid, oFileInfo, fUpload, fCancel, TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/INFO_EMPTY_JSCRYPTO_KEY'));
							}
						}
						else
						{
							if (Settings.EncryptionMode() == Enums.EncryptionMode.AskMe)
							{
								if (isConfirmPopupShown)
								{
									AwaitConfirmationQueue.push({
										sUid: sUid,
										oFileInfo: oFileInfo
									});
								}
								else
								{
									setTimeout(function () {
										Popups.showPopup(ConfirmEncryptionPopup, [
											fEncrypt,
											fUpload,
											fCancel,
											AwaitConfirmationQueue.length,
											_.map(AwaitConfirmationQueue, function(element) {
												return element.oFileInfo.FileName; 
											})
										]);
									}, 10);
									isConfirmPopupShown = true;
									AwaitConfirmationQueue.push({
										sUid: sUid,
										oFileInfo: oFileInfo
									});
								}
							}
							else
							{
								if (CCrypto.oChunkQueue.isProcessed === true)
								{ // if another file is being uploaded now - add a file to the queue
									CCrypto.oChunkQueue.aFiles.push({
										fStartUploadCallback: fStartUploadCallback,
										oFileInfo: oFileInfo, 
										sUid: sUid, 
										fOnChunkEncryptCallback: fOnChunkEncryptCallback
									});
								}
								else
								{ // If the queue is not busy - start uploading
									fStartUploadCallback(oFileInfo, sUid, fOnChunkEncryptCallback);
								}
							}
						}
					});
					
					App.subscribeEvent('CFilesView::FileDownloadCancel', function (oParams) {
						if (Settings.EnableJscrypto() && IsHttpsEnable())
						{
							oParams.oFile.stopDownloading();
						}
					});
					
					App.subscribeEvent('CFilesView::FileUploadCancel', function (oParams) {
						if (Settings.EnableJscrypto() && IsHttpsEnable())
						{
							CCrypto.stopUploading(oParams.sFileUploadUid , oParams.fOnUploadCancelCallback);
						}
					});
					App.subscribeEvent('Jua::FileUploadingError', function () {
						if (Settings.EnableJscrypto() && IsHttpsEnable())
						{
							CCrypto.oChunkQueue.isProcessed = false;
							CCrypto.checkQueue();
						}
					});
					App.subscribeEvent('FilesWebclient::ParseFile::after', function (oFile) {
						var 
							bIsEncrypted = typeof(oFile.oExtendedProps) !== 'undefined' &&  typeof(oFile.oExtendedProps.InitializationVector) !== 'undefined',
							iv = bIsEncrypted ? oFile.oExtendedProps.InitializationVector : false
						;

						if (bIsEncrypted)
						{
							oFile.thumbnailSrc('');
							if (oFile.sOwnerName === App.getUserPublicId() && (/\.(png|jpe?g|gif)$/).test(oFile.fileName()) && Settings.EnableJscrypto())
							{// change view action for images
								oFile.oActionsData.view.Handler = _.bind(function () {
									CCrypto.viewEncryptedImage(this.oFile, this.iv);
								}, {oFile: oFile, iv: iv});
							}
							else
							{// remove view action for non-images
								oFile.removeAction('view');
							}
							oFile.removeAction('list');
							oFile.bIsSecure(true);
						}
					});
					App.subscribeEvent('FileViewerWebclientPlugin::FilesCollection::after', function (oParams) {
						oParams.aFilesCollection(_.filter(oParams.aFilesCollection(), function (oArg) {
							return !(typeof(oArg.oExtendedProps) !== 'undefined' &&  typeof(oArg.oExtendedProps.InitializationVector) !== 'undefined');
						}));
					});
				}
			}
		};
	};


/***/ }),

/***/ 276:
/*!*******************************************************************!*\
  !*** ./modules/CoreParanoidEncryptionWebclientPlugin/js/enums.js ***!
  \*******************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		Enums = {}
	;

	/**
	 * @enum {number}
	 */
	Enums.EncryptionMode = {
		Always: 0,
		AskMe: 1,
		Never: 2
	};

	if (typeof window.Enums === 'undefined')
	{
		window.Enums = {};
	}

	_.extendOwn(window.Enums, Enums);


/***/ }),

/***/ 277:
/*!*********************************************************************!*\
  !*** ./modules/CoreParanoidEncryptionWebclientPlugin/js/CCrypto.js ***!
  \*********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		$ = __webpack_require__(/*! jquery */ 1),
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		FileSaver = __webpack_require__(/*! modules/CoreWebclient/js/vendors/FileSaver.js */ 266),
		JscryptoKey = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/JscryptoKey.js */ 278),
		HexUtils = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/utils/Hex.js */ 279)
	;

	/**
	 * @constructor
	 */
	function CCrypto()
	{ 
		this.iChunkNumber = 0;
		this.iChunkSize = 5 * 1024 * 1024;
		this.iCurrChunk = 0;
		this.oChunk = null;
		this.iv = null;
		this.cryptoKey = ko.observable(JscryptoKey.getKey());
		JscryptoKey.getKeyObservable().subscribe(function () {
			this.cryptoKey(JscryptoKey.getKey());
		}, this);
		// Queue of files awaiting upload
		this.oChunkQueue = {
			isProcessed: false,
			aFiles: []
		};
		this.aStopList = [];
		this.fOnUploadCancelCallback = null;
	}
	CCrypto.prototype.start = function (oFileInfo)
	{
		this.oFileInfo = oFileInfo;
		this.oFile = oFileInfo.File;
		this.iChunkNumber = Math.ceil(oFileInfo.File.size/this.iChunkSize);
		this.iCurrChunk = 0;
		this.oChunk = null;
		this.iv = window.crypto.getRandomValues(new Uint8Array(16));
		this.oFileInfo.Hidden = { 'RangeType': 1 };
		this.oFileInfo.Hidden.ExtendedProps = { 'InitializationVector': HexUtils.Array2HexString(new Uint8Array(this.iv)) };
	};

	CCrypto.prototype.getCryptoKey = function ()
	{
		return this.cryptoKey();
	};

	CCrypto.prototype.readChunk = function (sUid, fOnChunkEncryptCallback)
	{
		var
			iStart = this.iChunkSize * this.iCurrChunk,
			iEnd = (this.iCurrChunk < (this.iChunkNumber - 1)) ? this.iChunkSize * (this.iCurrChunk + 1) : this.oFile.size,
			oReader = new FileReader(),
			oBlob = null
		;
		
		if (this.aStopList.indexOf(sUid) !== -1)
		{ // if user canceled uploading file with uid = sUid
			this.aStopList.splice(this.aStopList.indexOf(sUid), 1);
			if (this.fOnUploadCancelCallback !== null)
			{
				this.fOnUploadCancelCallback(sUid, this.oFileInfo.FileName);
			}
			this.checkQueue();
			return;
		}
		else
		{
			// Get file chunk
			if (this.oFile.slice)
			{
				oBlob = this.oFile.slice(iStart, iEnd);
			}
			else if (this.oFile.webkitSlice)
			{
				oBlob = this.oFile.webkitSlice(iStart, iEnd);
			}
			else if (this.oFile.mozSlice)
			{
				oBlob = this.oFile.mozSlice(iStart, iEnd);
			}

			if (oBlob)
			{
				try
				{ //Encrypt file chunk
					oReader.onloadend = _.bind(function(evt) {
						if (evt.target.readyState === FileReader.DONE)
						{
							this.oChunk = evt.target.result;
							this.iCurrChunk++;
							this.encryptChunk(sUid, fOnChunkEncryptCallback);
						}
					}, this);

					oReader.readAsArrayBuffer(oBlob);
				}
				catch(err)
				{
					Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_ENCRYPTION'));
				}
			}
		}
	};

	CCrypto.prototype.encryptChunk = function (sUid, fOnChunkEncryptCallback)
	{
		crypto.subtle.encrypt({ name: 'AES-CBC', iv: this.iv }, this.cryptoKey(), this.oChunk)
			.then(_.bind(function (oEncryptedContent) {
				//delete padding for all chunks except last one
				oEncryptedContent = (this.iChunkNumber > 1 && this.iCurrChunk !== this.iChunkNumber) ? oEncryptedContent.slice(0, oEncryptedContent.byteLength - 16) : oEncryptedContent;
				var
					oEncryptedFile = new Blob([oEncryptedContent], {type: "text/plain", lastModified: new Date()}),
					//fProcessNextChunkCallback runs after previous chunk uploading
					fProcessNextChunkCallback = _.bind(function (sUid, fOnChunkEncryptCallback) {
						if (this.iCurrChunk < this.iChunkNumber)
						{// if it was not last chunk - read another chunk
							this.readChunk(sUid, fOnChunkEncryptCallback);
						}
						else
						{// if it was last chunk - check Queue for files awaiting upload
							this.oChunkQueue.isProcessed = false;
							this.checkQueue();
						}
					}, this)
				;
				this.oFileInfo.File = oEncryptedFile;
				//use last 16 byte of current chunk as initial vector for next chunk
				this.iv = new Uint8Array(oEncryptedContent.slice(oEncryptedContent.byteLength - 16));
				if (this.iCurrChunk === 1)
				{ // for first chunk enable 'FirstChunk' attribute. This is necessary to solve the problem of simultaneous loading of files with the same name
					this.oFileInfo.Hidden.ExtendedProps.FirstChunk = true;
				}
				else
				{
					delete this.oFileInfo.Hidden.ExtendedProps.FirstChunk;
				}
				
				if (this.iCurrChunk == this.iChunkNumber)
				{ // unmark file as loading
					delete this.oFileInfo.Hidden.ExtendedProps.Loading;
				}
				else
				{ // mark file as loading until upload doesn't finish
					this.oFileInfo.Hidden.ExtendedProps.Loading = true;
				}
				// call upload of encrypted chunk
				fOnChunkEncryptCallback(sUid, this.oFileInfo, fProcessNextChunkCallback, this.iCurrChunk, this.iChunkNumber, (this.iCurrChunk - 1) * this.iChunkSize);
			}, this))
			.catch(function(err) {
				Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_ENCRYPTION'));
			})
		;
	};

	CCrypto.prototype.downloadDividedFile = function (oFile, iv)
	{
		new CDownloadFile(oFile, iv, this.cryptoKey(), this.iChunkSize);
	};
	/**
	* Checking Queue for files awaiting upload
	*/
	CCrypto.prototype.checkQueue = function ()
	{
		var aNode = null;
		if (this.oChunkQueue.aFiles.length > 0)
		{
			aNode = this.oChunkQueue.aFiles.shift();
			aNode.fStartUploadCallback.apply(aNode.fStartUploadCallback, [aNode.oFileInfo, aNode.sUid, aNode.fOnChunkEncryptCallback]);
		}
	};
	/**
	* Stop file uploading
	* 
	* @param {String} sUid
	* @param {Function} fOnUploadCancelCallback
	*/
	CCrypto.prototype.stopUploading = function (sUid, fOnUploadCancelCallback)
	{
		var bFileInQueue = false;
		 // If file await to be uploaded - delete it from queue
		this.oChunkQueue.aFiles.forEach(function (oData, index, array) {
			if (oData.sUid === sUid)
			{
				fOnUploadCancelCallback(sUid, oData.oFileInfo.FileName);
				array.splice(index, 1);
				bFileInQueue = true;
			}
		});
		if (!bFileInQueue)
		{
			this.aStopList.push(sUid);
			this.oChunkQueue.isProcessed = false;
			this.fOnUploadCancelCallback = fOnUploadCancelCallback;
		}
	};

	CCrypto.prototype.viewEncryptedImage = function (oFile, iv)
	{
		if (!this.getCryptoKey())
		{
			Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/INFO_EMPTY_JSCRYPTO_KEY'));
		}
		else
		{
			new CViewImage(oFile, iv, this.cryptoKey(), this.iChunkSize);
		}
	};

	function CDownloadFile(oFile, iv, cryptoKey, iChunkSize)
	{
		this.oFile = oFile;
		this.sFileName = oFile.fileName();
		this.iFileSize = oFile.size();
		this.sDownloadLink = oFile.getActionUrl('download');
		this.oWriter = new CWriter(this.sFileName);
		this.iCurrChunk = 0;
		this.iv = new Uint8Array(HexUtils.HexString2Array(iv));
		this.key = cryptoKey;
		this.iChunkNumber = Math.ceil(this.iFileSize/iChunkSize);
		this.iChunkSize = iChunkSize;
		this.decryptChunk();
	}
	CDownloadFile.prototype.writeChunk = function (oDecryptedUint8Array)
	{
		if (this.oFile.downloading() !== true)
		{ // if download was canceled
			return;
		}
		else
		{
			this.oWriter.write(oDecryptedUint8Array); //write decrypted chunk
			if (this.iCurrChunk < this.iChunkNumber)
			{ //if it was not last chunk - decrypting another chunk
				this.decryptChunk();
			}
			else
			{
				this.stopDownloading();
				this.oWriter.close();
			}
		}
	}

	CDownloadFile.prototype.decryptChunk = function ()
	{
		var oReq = new XMLHttpRequest();
		oReq.open("GET", this.getChunkLink(), true);

		oReq.responseType = 'arraybuffer';

		oReq.onprogress = _.bind(function(oEvent) {
			if (this.oFile.downloading())
			{
				this.oFile.onDownloadProgress(oEvent.loaded + (this.iCurrChunk-1) * this.iChunkSize, this.iFileSize);
			}
			else
			{
				oReq.abort();
			}
		}, this);
		oReq.onload =_.bind(function (oEvent)
		{
			var
				oArrayBuffer = oReq.response,
				oDataWithPadding = {}
			;
			if (oReq.status === 200 && oArrayBuffer)
			{
				oDataWithPadding = new Uint8Array(oArrayBuffer.byteLength + 16);
				oDataWithPadding.set( new Uint8Array(oArrayBuffer), 0);
				if (this.iCurrChunk !== this.iChunkNumber)
				{// for all chunk except last - add padding
					crypto.subtle.encrypt(
						{
							name: 'AES-CBC',
							iv: new Uint8Array(oArrayBuffer.slice(oArrayBuffer.byteLength - 16))
						},
						this.key,
						(new Uint8Array([16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16])).buffer // generate padding for chunk
					).then(_.bind(function(oEncryptedContent) {
							// add generated padding to data
							// oEncryptedContent.slice(0, 16) - use only first 16 bytes of generated padding, other data is padding for our padding
							oDataWithPadding.set(new Uint8Array(new Uint8Array(oEncryptedContent.slice(0, 16))), oArrayBuffer.byteLength);
							// decrypt data
							crypto.subtle.decrypt({ name: 'AES-CBC', iv: this.iv }, this.key, oDataWithPadding.buffer)
								.then(_.bind(function (oDecryptedArrayBuffer) {
									var oDecryptedUint8Array = new Uint8Array(oDecryptedArrayBuffer);
									// use last 16 byte of current chunk as initial vector for next chunk
									this.iv = new Uint8Array(oArrayBuffer.slice(oArrayBuffer.byteLength - 16));
									this.writeChunk(oDecryptedUint8Array);
								}, this))
								.catch(_.bind(function(err) {
									this.stopDownloading();
									Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_DECRYPTION'));
								}, this));
						}, this)
					);
				}
				else
				{ //for last chunk just decrypt data
					crypto.subtle.decrypt({ name: 'AES-CBC', iv: this.iv }, this.key, oArrayBuffer)
						.then(_.bind(function (oDecryptedArrayBuffer) {
							var oDecryptedUint8Array = new Uint8Array(oDecryptedArrayBuffer);
							// use last 16 byte of current chunk as initial vector for next chunk
							this.iv = new Uint8Array(oArrayBuffer.slice(oArrayBuffer.byteLength - 16));
							this.writeChunk(oDecryptedUint8Array);
						}, this))
						.catch(_.bind(function(err) {
							this.stopDownloading();
							Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_DECRYPTION'));
						}, this))
						;
				}
			}
		}, this);
		oReq.send(null);
	}

	CDownloadFile.prototype.stopDownloading = function ()
	{
		this.oFile.stopDownloading();
	}

	/**
	 * Generate link for downloading current chunk
	 */
	CDownloadFile.prototype.getChunkLink = function ()
	{
		return this.sDownloadLink + '/download/' + this.iCurrChunk++ + '/' + this.iChunkSize;
	}

	function CViewImage(oFile, iv, cryptoKey, iChunkSize)
	{
		this.oFile = oFile;
		this.sFileName = oFile.fileName();
		this.iFileSize = oFile.size();
		this.sDownloadLink = oFile.getActionUrl('download');
		this.oWriter = null;
		this.iCurrChunk = 0;
		this.iv = new Uint8Array(HexUtils.HexString2Array(iv));
		this.key = cryptoKey;
		this.iChunkNumber = Math.ceil(this.iFileSize/iChunkSize);
		this.iChunkSize = iChunkSize;
		this.decryptChunk();
	}
	CViewImage.prototype = Object.create(CDownloadFile.prototype);
	CViewImage.prototype.constructor = CViewImage;

	CViewImage.prototype.writeChunk = function (oDecryptedUint8Array)
	{
			this.oWriter = this.oWriter === null ? new CBlobViewer(this.sFileName) : this.oWriter;
			this.oWriter.write(oDecryptedUint8Array); //write decrypted chunk
			if (this.iCurrChunk < this.iChunkNumber)
			{ //if it was not last chunk - decrypting another chunk
				this.decryptChunk();
			}
			else
			{
				this.stopDownloading();
				this.oWriter.close();
			}
	}

	CViewImage.prototype.stopDownloading = function ()
	{
	}
	/**
	* Writing chunks in file
	* 
	* @constructor
	* @param {String} sFileName
	*/
	function CWriter(sFileName)
	{
		this.sName = sFileName;
		this.aBuffer = [];
	}
	CWriter.prototype.write = function (oDecryptedUint8Array)
	{
		this.aBuffer.push(oDecryptedUint8Array);
	};
	CWriter.prototype.close = function ()
	{
		var file = new Blob(this.aBuffer);
		FileSaver.saveAs(file, this.sName);
		file = null;
	};

	/**
	* Writing chunks in blob for viewing
	* 
	* @constructor
	* @param {String} sFileName
	*/
	function CBlobViewer(sFileName) {
		this.sName = sFileName;
		this.aBuffer = [];
		this.imgWindow = window.open("", "_blank", "height=auto, width=auto,toolbar=no,scrollbars=no,resizable=yes");
	}

	CBlobViewer.prototype = Object.create(CWriter.prototype);
	CBlobViewer.prototype.constructor = CBlobViewer;
	CBlobViewer.prototype.close = function ()
	{
		try
		{
			var
				file = new Blob(this.aBuffer),
				link = window.URL.createObjectURL(file),
				img = null
			;
			this.imgWindow.document.write("<head><title>" + this.sName + '</title></head><body><img src="' + link + '" /></body>');

			img = $(this.imgWindow.document.body).find('img');
			img.on('load', function () {
				//remove blob after showing image
				window.URL.revokeObjectURL(link);
			});
		}
		catch (err)
		{
			Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_POPUP_WINDOWS'));
		}
	};

	module.exports = new  CCrypto();

/***/ }),

/***/ 278:
/*!*************************************************************************!*\
  !*** ./modules/CoreParanoidEncryptionWebclientPlugin/js/JscryptoKey.js ***!
  \*************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		Storage = __webpack_require__(/*! modules/CoreWebclient/js/Storage.js */ 215),
		Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
		UserSettings = __webpack_require__(/*! modules/CoreWebclient/js/Settings.js */ 45),
		HexUtils = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/utils/Hex.js */ 279)
	;

	/**
	 * @constructor
	 */
	function CJscryptoKey()
	{
		this.sPrefix = 'user_' + (UserSettings.UserId || '0') + '_';

		this.key = ko.observable();
		this.sKeyName = ko.observable();

		this.loadKeyFromStorage();
	}

	CJscryptoKey.prototype.key = null;
	CJscryptoKey.prototype.sPrefix = '';

	CJscryptoKey.prototype.getKey = function ()
	{
		return this.key();
	};

	CJscryptoKey.prototype.getKeyName = function ()
	{
		if (Storage.hasData(this.sPrefix + 'cryptoKey'))
		{
			return Storage.getData(this.sPrefix + 'cryptoKey').keyname;
		}
		return false;
	};

	CJscryptoKey.prototype.getKeyObservable = function ()
	{
		return this.key;
	};

	/**
	 *  import key from data in local storage
	 */
	CJscryptoKey.prototype.loadKeyFromStorage = function (fOnGenerateCallback)
	{
		var 
			aKey = [],
			sKey = ''
		;
		if (Storage.hasData(this.sPrefix + 'cryptoKey'))
		{
			sKey = Storage.getData(this.sPrefix + 'cryptoKey').keydata;
			aKey = HexUtils.HexString2Array(sKey);
			if (aKey.length > 0)
			{
				aKey = new Uint8Array(aKey);
				window.crypto.subtle.importKey(
					"raw",
					aKey.buffer,
					{
						name: "AES-CBC",
					},
					true,
					["encrypt", "decrypt"]
				)
				.then(_.bind(function(key) {
					this.key(key);
					if (fOnGenerateCallback)
					{
						fOnGenerateCallback(true);
					}
				}, this))
				.catch(function(err) {
					Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_LOAD_KEY'));
				});
			}
			else
			{
				Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_LOAD_KEY'));
			}
		}
	};

	/**
	 *  generate new key
	 */
	CJscryptoKey.prototype.generateKey = function (fOnGenerateCallback, sKeyName)
	{
		window.crypto.subtle.generateKey(
			{
				name: "AES-CBC",
				length: 256
			},
			true,
			["encrypt", "decrypt"]
		)
		.then(_.bind(function (key) {
			window.crypto.subtle.exportKey(
				"raw",
				key
			)
			.then(_.bind(function(keydata) {
				Storage.setData(
					this.sPrefix + 'cryptoKey', 
					{
						keyname: sKeyName,
						keydata: HexUtils.Array2HexString(new Uint8Array(keydata))
					}
				);
				this.loadKeyFromStorage(fOnGenerateCallback);
			}, this))
			.catch(function(err) {
				Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_EXPORT_KEY'));
			});
		}, this))
		.catch(function(err) {
			Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_GENERATE_KEY'));
		});
	};

	CJscryptoKey.prototype.importKeyFromString = function (sKeyName, sKey)
	{
		try
		{
			this.sKeyName(sKeyName);
			Storage.setData(this.sPrefix + 'cryptoKey', {keyname: sKeyName, keydata: sKey});
		}
		catch (e)
		{
			Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_IMPORT_KEY'));
		}
		this.loadKeyFromStorage();
	}

	CJscryptoKey.prototype.exportKey = function ()
	{
		return window.crypto.subtle.exportKey(
			"raw",
			this.getKey()
		);
	}

	CJscryptoKey.prototype.deleteKey = function ()
	{
		try
		{
			this.key(null);
			Storage.removeData(this.sPrefix + 'cryptoKey');
		}
		catch (e)
		{
			return {error: e}
		}

		this.loadKeyFromStorage();

		return {status: 'ok'};
	};

	module.exports = new CJscryptoKey();

/***/ }),

/***/ 279:
/*!***********************************************************************!*\
  !*** ./modules/CoreParanoidEncryptionWebclientPlugin/js/utils/Hex.js ***!
  \***********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		HexUtils = {}
	;

	HexUtils.Array2HexString = function (aInput)
	{
		var sHexAB = '';
		_.each(aInput, function(element) {
			var sHex = element.toString(16);
			sHexAB += ((sHex.length === 1) ? '0' : '') + sHex;
		})
		return sHexAB;
	};

	HexUtils.HexString2Array = function (sHex)
	{
		var aResult = [];
		if (sHex.length === 0 || sHex.length % 2 !== 0)
		{
			return aResult;
		}
		for (var i = 0; i < sHex.length; i+=2)
		{
			aResult.push(parseInt(sHex.substr(i, 2), 16));
		}
		return aResult;
	};

	module.exports = HexUtils;

/***/ }),

/***/ 280:
/*!**********************************************************************!*\
  !*** ./modules/CoreParanoidEncryptionWebclientPlugin/js/Settings.js ***!
  \**********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		ko = __webpack_require__(/*! knockout */ 46),
		_ = __webpack_require__(/*! underscore */ 2),
		
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44)
	;

	module.exports = {
		ServerModuleName: 'CoreParanoidEncryptionWebclientPlugin',
		HashModuleName: 'paranoid-encryption',
		EncryptionAllowedModules: ['Files'],
		
		EnableJscrypto: ko.observable(true),
		EncryptionMode: ko.observable(Enums.EncryptionMode.Always),
		
		/**
		 * Initializes settings from AppData object sections.
		 * 
		 * @param {Object} oAppData Object contained modules settings.
		 */
		init: function (oAppData)
		{
			var oAppDataSection = _.extend({}, oAppData[this.ServerModuleName] || {}, oAppData['CoreParanoidEncryptionWebclientPlugin'] || {});
			
			if (!_.isEmpty(oAppDataSection))
			{
				this.EnableJscrypto(Types.pBool(oAppDataSection.EnableModule, this.EnableJscrypto()));
				this.EncryptionMode(Types.pEnum(oAppDataSection.EncryptionMode, Enums.EncryptionMode, this.EncryptionMode()));
			}
		},
		
		/**
		 * Updates new settings values after saving on server.
		 * 
		 * @param {boolean} bEnableJscrypto
		 * @param {number} iEncryptionMode
		 */
		update: function (bEnableJscrypto, iEncryptionMode)
		{
			this.EnableJscrypto(bEnableJscrypto);
			this.EncryptionMode(iEncryptionMode);
		}
	};


/***/ }),

/***/ 281:
/*!*******************************************************************************************!*\
  !*** ./modules/CoreParanoidEncryptionWebclientPlugin/js/popups/ConfirmEncryptionPopup.js ***!
  \*******************************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),

		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		CAbstractPopup = __webpack_require__(/*! modules/CoreWebclient/js/popups/CAbstractPopup.js */ 188)
	;

	/**
	 * @constructor
	 */
	function CConfirmEncryptionPopup()
	{
		CAbstractPopup.call(this);
		
		this.fEncrypt = null;
		this.fUpload = null;
		this.fCancel = null;
		this.message = ko.observable('');
		this.filesConfirmText = ko.observable('');
	}

	_.extendOwn(CConfirmEncryptionPopup.prototype, CAbstractPopup.prototype);

	CConfirmEncryptionPopup.prototype.PopupTemplate = 'CoreParanoidEncryptionWebclientPlugin_ConfirmEncryptionPopup';

	CConfirmEncryptionPopup.prototype.onOpen = function (fEncrypt, fUpload, fCancel, iFilesCount, aFileList)
	{
		var aEncodedFiles = _.map(aFileList, function (sFileName) {
			return TextUtils.encodeHtml(sFileName);
		});
		
		this.filesConfirmText('');
		this.fEncrypt = fEncrypt;
		this.fUpload = fUpload;
		this.fCancel = fCancel;
		this.message(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/CONFIRM_ENCRYPT_PLURAL', {'VALUE': iFilesCount > 1 ? iFilesCount : '"' + aFileList[0] + '"'}, null, iFilesCount));
		if (iFilesCount > 1)
		{
			this.filesConfirmText(aEncodedFiles.join('<br />'));
		}
	};

	CConfirmEncryptionPopup.prototype.cancelUpload = function ()
	{
		this.fCancel();
		this.closePopup();
	};

	CConfirmEncryptionPopup.prototype.encrypt = function ()
	{
		this.fEncrypt();
		this.closePopup();
	};

	CConfirmEncryptionPopup.prototype.upload = function ()
	{
		this.fUpload();
		this.closePopup();
	};

	module.exports = new CConfirmEncryptionPopup();


/***/ }),

/***/ 282:
/*!***************************************************************************************!*\
  !*** ./modules/CoreParanoidEncryptionWebclientPlugin/js/popups/ConfirmUploadPopup.js ***!
  \***************************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),

		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		CAbstractPopup = __webpack_require__(/*! modules/CoreWebclient/js/popups/CAbstractPopup.js */ 188)
	;

	/**
	 * @constructor
	 */
	function CConfirmUploadPopup()
	{
		CAbstractPopup.call(this);
		
		this.fUpload = null;
		this.fCancel = null;
		this.message = ko.observable('');
		this.filesConfirmText = ko.observable('');
		this.sErrorText = ko.observable('');
	}

	_.extendOwn(CConfirmUploadPopup.prototype, CAbstractPopup.prototype);

	CConfirmUploadPopup.prototype.PopupTemplate = 'CoreParanoidEncryptionWebclientPlugin_ConfirmUploadPopup';

	CConfirmUploadPopup.prototype.onOpen = function (fUpload, fCancel, iFilesCount, aFileList, sErrorText)
	{
		var aEncodedFiles = _.map(aFileList, function (sFileName) {
			return TextUtils.encodeHtml(sFileName);
		});
		
		this.filesConfirmText('');
		this.fUpload = fUpload;
		this.fCancel = fCancel;
		this.message(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/CONFIRM_UPLOAD_PLURAL', {'VALUE': iFilesCount > 1 ? iFilesCount : '"' + aFileList[0] + '"'}, null, iFilesCount));
		if (iFilesCount > 1)
		{
			this.filesConfirmText(aEncodedFiles.join('<br />'));
		}
		this.sErrorText(sErrorText);
	};

	CConfirmUploadPopup.prototype.cancelUpload = function ()
	{
		this.fCancel();
		this.closePopup();
	};

	CConfirmUploadPopup.prototype.upload = function ()
	{
		this.fUpload();
		this.closePopup();
	};

	module.exports = new CConfirmUploadPopup();


/***/ }),

/***/ 283:
/*!******************************************************************************************************!*\
  !*** ./modules/CoreParanoidEncryptionWebclientPlugin/js/views/ParanoidEncryptionSettingsFormView.js ***!
  \******************************************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		$ = __webpack_require__(/*! jquery */ 1),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		Types = __webpack_require__(/*! modules/CoreWebclient/js/utils/Types.js */ 44),
		
		ModulesManager = __webpack_require__(/*! modules/CoreWebclient/js/ModulesManager.js */ 42),
		Screens = __webpack_require__(/*! modules/CoreWebclient/js/Screens.js */ 182),
		
		CAbstractSettingsFormView = ModulesManager.run('SettingsWebclient', 'getAbstractSettingsFormViewClass'),
		
		Popups = __webpack_require__(/*! modules/CoreWebclient/js/Popups.js */ 186),
		
		JscryptoKey = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/JscryptoKey.js */ 278),
		Settings = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/Settings.js */ 280),
		ImportKeyStringPopup = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/popups/ImportKeyStringPopup.js */ 284),
		GenerateKeyPopup = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/popups/GenerateKeyPopup.js */ 285),
		ExportInformationPopup = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/popups/ExportInformationPopup.js */ 286),
		DeleteKeyPopup = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/popups/DeleteKeyPopup.js */ 287),
		HexUtils = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/utils/Hex.js */ 279)
	;

	/**
	 * @constructor
	 */
	function CParanoidEncryptionSettingsFormView()
	{
		CAbstractSettingsFormView.call(this, Settings.ServerModuleName);
		
		this.EnableJscrypto = ko.observable(Settings.EnableJscrypto());
		
		this.key = ko.observable(JscryptoKey.getKey());
		this.keyName = ko.observable(JscryptoKey.getKeyName());
		
		this.downloadLinkHref = ko.observable('#');

		this.setExportUrl();
		JscryptoKey.getKeyObservable().subscribe(function () {
			this.key(JscryptoKey.getKey());
			this.keyName(JscryptoKey.getKeyName());
			this.setExportUrl();
		}, this);
		
		this.bIsHttpsEnable = window.location.protocol === "https:";
		this.EncryptionMode = ko.observable(Settings.EncryptionMode());
		this.isImporting = ko.observable(false);
	}

	_.extendOwn(CParanoidEncryptionSettingsFormView.prototype, CAbstractSettingsFormView.prototype);

	CParanoidEncryptionSettingsFormView.prototype.ViewTemplate = 'CoreParanoidEncryptionWebclientPlugin_ParanoidEncryptionSettingsFormView';

	CParanoidEncryptionSettingsFormView.prototype.setExportUrl =	function (bShowDialog)
	{
		var
			sHref = '#',
			oBlob = null
		;

		this.downloadLinkHref(sHref);
		if (window.Blob && window.URL && _.isFunction(window.URL.createObjectURL))
		{
			if (JscryptoKey.getKey())
			{
				JscryptoKey.exportKey()
					.then(_.bind(function(keydata) {
						oBlob = new Blob([HexUtils.Array2HexString(new Uint8Array(keydata))], {type: 'text/plain'});
						sHref = window.URL.createObjectURL(oBlob);
						this.downloadLinkHref(sHref);
						if (bShowDialog)
						{
							Popups.showPopup(ExportInformationPopup, [sHref, this.keyName()]);
						}
					}, this));
			}
		}

	};

	CParanoidEncryptionSettingsFormView.prototype.importFileKey = function ()
	{
		$("#import-key-file").click();
	};

	CParanoidEncryptionSettingsFormView.prototype.importStringKey = function ()
	{
		Popups.showPopup(ImportKeyStringPopup, [false]);
	};

	CParanoidEncryptionSettingsFormView.prototype.readKeyFromFile = function ()
	{
		var 
			input = document.getElementById('import-key-file'),
			file = input.files[0],
			reader = new FileReader(),
			sContents = '',
			aFileNameParts = input.files[0].name.split('.'),
			sKeyName = ''
		;
		aFileNameParts.splice(aFileNameParts.length - 1, 1);
		sKeyName = aFileNameParts.join('');
		if (!file)
		{
			Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_IMPORT_KEY'));
			return;
		}
		this.isImporting(true);
		reader.onload =_.bind( function(e) {
			sContents = e.target.result;
			JscryptoKey.importKeyFromString(sKeyName, sContents);
			this.isImporting(false);
		}, this);
		try
		{
			reader.readAsText(file);
		}
		catch (e)
		{
			Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_IMPORT_KEY'));
		}
	};

	CParanoidEncryptionSettingsFormView.prototype.generateNewKey = function ()
	{
		Popups.showPopup(GenerateKeyPopup, [_.bind(this.setExportUrl, this)]);
	};

	CParanoidEncryptionSettingsFormView.prototype.removeJscryptoKey = function ()
	{
		var
			fRemove = _.bind(function (bRemove) {
				if (bRemove)
				{
					var oResult = JscryptoKey.deleteKey();
					if (oResult.error)
					{
						Screens.showError(TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/ERROR_DELETE_KEY'));
					}
				}
			}, this)
		;
		
		Popups.showPopup(DeleteKeyPopup, [this.downloadLinkHref(), this.keyName(), fRemove]);
	};

	CParanoidEncryptionSettingsFormView.prototype.getCurrentValues = function ()
	{
		return [
			this.EnableJscrypto(),
			this.EncryptionMode()
		];
	};

	CParanoidEncryptionSettingsFormView.prototype.revertGlobalValues = function ()
	{
		this.EnableJscrypto(Settings.EnableJscrypto());
		this.EncryptionMode(Settings.EncryptionMode());
	};

	CParanoidEncryptionSettingsFormView.prototype.getParametersForSave = function ()
	{
		return {
			'EnableModule': this.EnableJscrypto(),
			'EncryptionMode': Types.pInt(this.EncryptionMode())
		};
	};

	CParanoidEncryptionSettingsFormView.prototype.applySavedValues = function ()
	{
		Settings.update(this.EnableJscrypto(), this.EncryptionMode());
	};

	module.exports = new CParanoidEncryptionSettingsFormView();


/***/ }),

/***/ 284:
/*!*****************************************************************************************!*\
  !*** ./modules/CoreParanoidEncryptionWebclientPlugin/js/popups/ImportKeyStringPopup.js ***!
  \*****************************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179),
		CAbstractPopup = __webpack_require__(/*! modules/CoreWebclient/js/popups/CAbstractPopup.js */ 188),
		JscryptoKey = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/JscryptoKey.js */ 278)
	;

	/**
	 * @constructor
	 */
	function CImportKeyStringPopup()
	{
		CAbstractPopup.call(this);
		
		this.keyName = ko.observable(App.getUserPublicId());
		this.newKey = ko.observable('');
	}

	_.extendOwn(CImportKeyStringPopup.prototype, CAbstractPopup.prototype);

	CImportKeyStringPopup.prototype.PopupTemplate = 'CoreParanoidEncryptionWebclientPlugin_ImportKeyStringPopup';

	CImportKeyStringPopup.prototype.onOpen = function ()
	{
		this.newKey('');
	};

	CImportKeyStringPopup.prototype.importKey = function ()
	{	
		JscryptoKey.importKeyFromString(this.keyName(), this.newKey());
		this.closePopup();
	};

	module.exports = new CImportKeyStringPopup();


/***/ }),

/***/ 285:
/*!*************************************************************************************!*\
  !*** ./modules/CoreParanoidEncryptionWebclientPlugin/js/popups/GenerateKeyPopup.js ***!
  \*************************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		App = __webpack_require__(/*! modules/CoreWebclient/js/App.js */ 179),
		CAbstractPopup = __webpack_require__(/*! modules/CoreWebclient/js/popups/CAbstractPopup.js */ 188),
		JscryptoKey = __webpack_require__(/*! modules/CoreParanoidEncryptionWebclientPlugin/js/JscryptoKey.js */ 278)
	;

	/**
	 * @constructor
	 */
	function CGenerateKeyPopup()
	{
		CAbstractPopup.call(this);
		
		this.keyName = ko.observable(App.getUserPublicId());
		this.fOnGenerateCallback = null;
	}

	_.extendOwn(CGenerateKeyPopup.prototype, CAbstractPopup.prototype);

	CGenerateKeyPopup.prototype.PopupTemplate = 'CoreParanoidEncryptionWebclientPlugin_GenerateKeyPopup';

	CGenerateKeyPopup.prototype.onOpen = function (fOnGenerateCallback)
	{
		this.fOnGenerateCallback = fOnGenerateCallback;
	};

	CGenerateKeyPopup.prototype.generateKey = function ()
	{	
		JscryptoKey.generateKey(this.fOnGenerateCallback, this.keyName());
		this.closePopup();
	};

	module.exports = new CGenerateKeyPopup();


/***/ }),

/***/ 286:
/*!*******************************************************************************************!*\
  !*** ./modules/CoreParanoidEncryptionWebclientPlugin/js/popups/ExportInformationPopup.js ***!
  \*******************************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		CAbstractPopup = __webpack_require__(/*! modules/CoreWebclient/js/popups/CAbstractPopup.js */ 188)
	;

	/**
	 * @constructor
	 */
	function CExportInformationPopup()
	{
		CAbstractPopup.call(this);
		
		this.downloadLink = ko.observable('#');
		this.keyName = ko.observable('');
	}

	_.extendOwn(CExportInformationPopup.prototype, CAbstractPopup.prototype);

	CExportInformationPopup.prototype.PopupTemplate = 'CoreParanoidEncryptionWebclientPlugin_ExportInformationPopup';

	CExportInformationPopup.prototype.onOpen = function (sDownloadLink, sKeyName)
	{
		this.downloadLink(sDownloadLink);
		this.keyName(sKeyName);
	};

	module.exports = new CExportInformationPopup();


/***/ }),

/***/ 287:
/*!***********************************************************************************!*\
  !*** ./modules/CoreParanoidEncryptionWebclientPlugin/js/popups/DeleteKeyPopup.js ***!
  \***********************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var
		_ = __webpack_require__(/*! underscore */ 2),
		ko = __webpack_require__(/*! knockout */ 46),
		
		TextUtils = __webpack_require__(/*! modules/CoreWebclient/js/utils/Text.js */ 43),
		
		CAbstractPopup = __webpack_require__(/*! modules/CoreWebclient/js/popups/CAbstractPopup.js */ 188),
		Popups = __webpack_require__(/*! modules/CoreWebclient/js/Popups.js */ 186),
		ConfirmPopup = __webpack_require__(/*! modules/CoreWebclient/js/popups/ConfirmPopup.js */ 233)
	;

	/**
	 * @constructor
	 */
	function CExportInformationPopup()
	{
		CAbstractPopup.call(this);
		
		this.downloadLink = ko.observable('');
		this.keyName = ko.observable('');
		this.fDelete = null;
		this.fDeleteCallback = null;
	}

	_.extendOwn(CExportInformationPopup.prototype, CAbstractPopup.prototype);

	CExportInformationPopup.prototype.PopupTemplate = 'CoreParanoidEncryptionWebclientPlugin_DeleteKeyPopup';

	CExportInformationPopup.prototype.onOpen = function (sDownloadLink, sKeyName, fDelete)
	{
		this.downloadLink(sDownloadLink);
		this.keyName(sKeyName);
		this.fDeleteCallback = _.bind(function (bRemove) {
			fDelete.call(this, bRemove);
			
			if (bRemove)
			{
				this.closePopup();
			}
			else
			{
				this.showPopup();
			}
		}, this);
	};

	CExportInformationPopup.prototype.deleteKey = function ()
	{
		this.hidePopup();
		Popups.showPopup(ConfirmPopup, [TextUtils.i18n('COREPARANOIDENCRYPTIONWEBCLIENTPLUGIN/CONFIRM_DELETE_KEY'), this.fDeleteCallback]);
	};

	module.exports = new CExportInformationPopup();


/***/ })

});