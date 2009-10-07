/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Grammar Checker.
 *
 * The Initial Developer of the Original Code is
 * Alexander Slesarev.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */

var grammarchecker = {
	clearPreview: function() {
		var preview=document.getElementById("grammarchecker-preview");
		while (preview.firstChild) {
			//The list is LIVE so it will re-index each call
			preview.removeChild(preview.firstChild);
		}
	},
	onLoad: function() {
		// initialization code
		this.initialized = true;
		this.strings = document.getElementById("grammarchecker-strings");
		var msgCompose = document.getElementById("msgComposeContext");
		msgCompose.addEventListener(
		    "popupshowing",
		    function(e) { this.showContextMenu(e); },
		    false
		);
	},
	showContextMenu: function(event) {
		// show or hide the menuitem based on what the context menu is on
		// see http://kb.mozillazine.org/Adding_items_to_menus
		var context = document.getElementById("context-grammarchecker");
		context.hidden = (GetNumSelectedMessages() > 0);
	},
	createDescription: function(item, li) {
		var context = item.attributes["context"].textContent;
		var offset = parseInt(item.attributes["contextoffset"].textContent);
		var len = parseInt(item.attributes["errorlength"].textContent);
		var contextLen = context.length;
		var overall = offset + len;

		var left = String(context).substring(0, offset);
		var middle = String(context).substring(offset, overall);
		var right = String(context).substring(overall, contextLen);
		if (left.length > 0) {
			li.appendChild(document.createTextNode(left));
		}
		if (middle.length > 0) {
			var bold = document.createElement("b");
			bold.appendChild(document.createTextNode(middle));
			li.appendChild(bold);
		}
		if (right.length > 0) {
			li.appendChild(document.createTextNode(right));
		}
	},
	addRule: function(item, ul) {
		var msg = item.attributes["msg"].textContent;
		var replacements = item.attributes["replacements"].textContent;
		var append = function(labelId, text) {
			var li = document.createElement("li");
			var label = grammarchecker.strings.getString(labelId);
			li.appendChild(document.createTextNode(label + ": " + text));
		    ul.appendChild(li);
		};
		append("ruleMessage", msg);
		append("replacementsMessage", replacements);
    },
    showNodes: function(nodes) {
		grammarchecker.clearPreview();
		var preview=document.getElementById("grammarchecker-preview");
		var ul = document.createElement("ul");
		preview.appendChild(ul);
		for (var i = 0; i < nodes.snapshotLength; i++) {
			var item = nodes.snapshotItem(i);
			var li = document.createElement("li");
			grammarchecker.createDescription(item, li);
			ul.appendChild(li);
			var innerUl = document.createElement("ul");
			grammarchecker.addRule(item, innerUl);
			ul.appendChild(innerUl);
		}
	},
	showResult: function(xmlDoc) {
		var nsResolver = xmlDoc.createNSResolver(
			xmlDoc.ownerDocument == null ?
			    xmlDoc.documentElement : xmlDoc.ownerDocument.documentElement);

		var nodes = xmlDoc.evaluate('/matches/error', xmlDoc, nsResolver,
			XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null );

		if (nodes.snapshotLength > 0) {
			grammarchecker.showNodes(nodes);
		} else {
			grammarchecker.showText("noErrorsMessage", null);
		}
	},
	showText: function(textId, appendix) {
		grammarchecker.clearPreview();
		var preview = document.getElementById("grammarchecker-preview");
		var text = this.strings.getString(textId);
		if (appendix != null) {
			text += appendix;
		}
		var textNode = document.createTextNode(text);
		preview.appendChild(textNode);
	},
	showError: function(errorId) {
		grammarchecker.clearPreview();
		var preview = document.getElementById("grammarchecker-preview");
		var text = this.strings.getString(errorId);
		var errorMsg = document.createTextNode(text);
		var errorDiv = document.createElement("div");
		errorDiv.setAttribute("id", "grammarchecker-error");
		errorDiv.appendChild(errorMsg);
		preview.appendChild(errorDiv);
	},
	onMenuItemCommand: function(e) {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("extensions.grammarchecker.");
		prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
		var server = prefs.getCharPref("urlpref");
		var lang = prefs.getCharPref("langpref");

		grammarchecker.showText("processingMessage",
								" " + server + " [" + lang + "] ...");
		//Get the current editor
		var editor = GetCurrentEditor();
		//Get the html Source message document
		var htmlSource = editor.outputToString('text/plain', 4);
		var xhr=Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"];
		var req = xhr.createInstance(Components.interfaces.nsIXMLHttpRequest);
		req.open('POST', server, true);
		req.setRequestHeader('Content-Type',
							 'application/x-www-form-urlencoded');
		req.onreadystatechange = function(){
			if (req.readyState == 4) {
				var result = req.responseXML;
				if (result == null) {
					grammarchecker.showError("errorMessage");
				} else {
					grammarchecker.showResult(result);
				}
			}
		};
		try {
			req.send("language=" + lang + "&text=" + htmlSource);
		} catch (ex) {
			grammarchecker.showError("errorMessage");
			return;
		}
	},
	onToolbarButtonCommand: function(e) {
		// just reuse the function above.  you can change this, obviously!
		grammarchecker.onMenuItemCommand(e);
	}
};
window.addEventListener(
	"load",
    function(e) { grammarchecker.onLoad(e); },
    false
);
window.addEventListener(
    "compose-window-init",
    function() {grammarchecker.clearPreview()},
    true
);
