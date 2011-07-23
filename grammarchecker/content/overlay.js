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
 * Alexander Slesarev <alex.slesarev@gmail.com>.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): Alexander Slesarev <alex.slesarev@gmail.com>
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

if ("undefined" == typeof(grammarchecker)) {
    let Cc = Components.classes;
    let Ci = Components.interfaces;
    var grammarchecker = {
        onLoad: function() {
            this._overlayCss = "chrome://grammarchecker/skin/overlay.css";
            this._strings = document.getElementById("grammarchecker-strings");
            this._nodesMapping = new NodesMapping();
            this._ranges = [];

            let that = this;
            let nsGrammarCommand = {
                isCommandEnabled: function(aCommand, dummy) {
                    return (IsDocumentEditable() && !IsInHTMLSourceMode());
                },
                getCommandStateParams: function(aCommand, aParams, aRefCon) {},
                doCommandParams: function(aCommand, aParams, aRefCon) {},
                doCommand: function(aCommand) {
                    that.onMenuItemCommand(aCommand);
                }
            };
            let commandTable = GetComposerCommandTable();
            commandTable.registerCommand("cmd_grammar", nsGrammarCommand);
        },
        clearPreview: function() {
            let preview = document.getElementById("grammarchecker-preview");
            while (preview.firstChild) {
                //The list is LIVE so it will re-index each call
                preview.removeChild(preview.firstChild);
            };
            this._ranges = [];
            let editor = GetCurrentEditor();
            if (editor != null) {
                this._prepareEditor(editor);
            }
        },
        _getResolver: function(xmlDoc) {
            let element = null;
            if (xmlDoc.ownerDocument == null) {
                element = xmlDoc.documentElement;
            } else {
                element = xmlDoc.ownerDocument.documentElement;
            }
            return xmlDoc.createNSResolver(element);
        },
        _prepareEditor: function(editor) {
            editor.QueryInterface(nsIEditorStyleSheets);
            editor.addOverrideStyleSheet(this._overlayCss);
            let xmlDoc = editor.document;
            let nsResolver = this._getResolver(xmlDoc);
            let getPath = function() {
                let cls = "//span[@class='grammarchecker-highlight']";
                return xmlDoc.evaluate(cls, xmlDoc, nsResolver,
                                       XPathResult.ANY_UNORDERED_NODE_TYPE,
                                       null).singleNodeValue;
            };
            let node = getPath();
            while (node != null) {
                let s = this._prepareSelection();
                let range = xmlDoc.createRange();
                range.selectNode(node);
                s.addRange(range);
                editor.removeInlineProperty("span", "class");
                node = getPath();
            }
        },
        _isInRanges: function(fromx, tox, y) {
            let index = fromx + "," + tox + "," + y;
            if (this._ranges.indexOf(index) == -1) {
                this._ranges.push(index);
                return false;
            }
            return true;
        },
        _prepareSelection: function() {
            let editor = GetCurrentEditor();
            let s = editor.selection;
            if (s.rangeCount > 0) {
                s.removeAllRanges();
            }
            return s;
        },
        _getContent: function(item, attr) {
            return item.attributes[attr].textContent;
        },
        _createDescription: function(item, li) {
            this._nodesMapping.init();
            let editor = GetCurrentEditor();
            let s = editor.selection;

            let context = this._getContent(item, "context");
            let offset = parseInt(this._getContent(item, "contextoffset"));
            let len = parseInt(this._getContent(item, "errorlength"));

            let fromx = parseInt(this._getContent(item, "fromx"));
            let fromy = parseInt(this._getContent(item, "fromy"));
            let tox = parseInt(this._getContent(item, "tox")) - 1;

            if (!this._isInRanges(fromx, tox, fromy)) {
                let startItem = this._nodesMapping.findNode(fromx, fromy);
                let endItem = this._nodesMapping.findNode(tox, fromy);
		
                if (startItem != null && endItem != null) {
                    let range = document.createRange();
                    range.setStart(startItem.node, startItem.offset);
                    range.setEnd(endItem.node, endItem.offset);
                    let s = this._prepareSelection();
                    s.addRange(range);
                    let atomS = "@mozilla.org/atom-service;1";
                    let atomService = Cc[atomS].getService(Ci.nsIAtomService);
                    let span = atomService.getAtom("span");
                    editor.QueryInterface(nsIHTMLEditor);
                    editor.setInlineProperty(span, "class",
                                             "grammarchecker-highlight");
                }
            }

            let contextLen = context.length;
            let overall = offset + len;

            let left = String(context).substring(0, offset);
            let middle = String(context).substring(offset, overall);
            let right = String(context).substring(overall, contextLen);
            if (left.length > 0) {
                li.appendChild(document.createTextNode(left));
            }
            if (middle.length > 0) {
                let bold = document.createElement("b");
                bold.appendChild(document.createTextNode(middle));
                li.appendChild(bold);
            }
            if (right.length > 0) {
                li.appendChild(document.createTextNode(right));
            }
        },
        _addRule: function(item, ul) {
            let that = this;
            let msg = this._getContent(item, "msg");
            let replacements = this._getContent(item, "replacements");
            let append = function(labelId, text) {
                let li = document.createElement("li");
                let label = that._strings.getString(labelId);
                li.appendChild(document.createTextNode(label + ": " + text));
                ul.appendChild(li);
            };
            append("ruleMessage", msg);
            append("replacementsMessage", replacements);
        },
        _showNodes: function(nodes) {
            this.clearPreview();
            let preview=document.getElementById("grammarchecker-preview");
            let ul = document.createElement("ul");
            preview.appendChild(ul);
            for (let i = 0; i < nodes.snapshotLength; i++) {
                let item = nodes.snapshotItem(i);
                let li = document.createElement("li");
                this._createDescription(item, li);
                ul.appendChild(li);
                let innerUl = document.createElement("ul");
                this._addRule(item, innerUl);
                ul.appendChild(innerUl);
            }
            this._prepareSelection();
        },
        _showResult: function(xmlDoc) {
            let nsResolver = this._getResolver(xmlDoc);
            let unordered = XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE;
            let nodes = xmlDoc.evaluate('/matches/error', xmlDoc, nsResolver,
                                        unordered, null);

            if (nodes.snapshotLength > 0) {
                this._showNodes(nodes);
            } else {
                this._showText("noErrorsMessage", null);
            }
        },
        _showText: function(textId, appendix) {
            this.clearPreview();
            let preview = document.getElementById("grammarchecker-preview");
            let text = this._strings.getString(textId);
            if (appendix != null) {
                text += appendix;
            }
            let textNode = document.createTextNode(text);
            preview.appendChild(textNode);
        },
        _showError: function(errorId) {
            this.clearPreview();
            let preview = document.getElementById("grammarchecker-preview");
            let text = this._strings.getString(errorId);
            let errorMsg = document.createTextNode(text);
            let errorDiv = document.createElement("div");
            errorDiv.setAttribute("id", "grammarchecker-error");
            errorDiv.appendChild(errorMsg);
            preview.appendChild(errorDiv);
        },
        _getLangFromSpellChecker: function(prefs) {
            let editor = GetCurrentEditor();
            try {
                let gSpellChecker = editor.getInlineSpellChecker(true);
                let lang = gSpellChecker.spellChecker.GetCurrentDictionary();
                return lang.substr(0, 2);
            } catch (ex) {
                return prefs.getCharPref("langpref");
            }
        },
        _checkGrammar: function(server, lang, mothertongue, errorHandler) {
            let that = this;
            this._showText("processingMessage"," "+server+" ["+lang+"] ...");

            //Get the html Source message document
            let htmlSource = encodeURIComponent(this._nodesMapping.init());
            let xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"];
            let req = xhr.createInstance(Ci.nsIXMLHttpRequest);
            req.open('POST', server, true);
            req.setRequestHeader('Content-Type',
                                 'application/x-www-form-urlencoded');
            req.onreadystatechange = function(){
                if (req.readyState == 4) {
                    let result = req.responseXML;
                    if (result == null) {
                        that._showError("errorMessage");
                        errorHandler();
                    } else {
                        that._showResult(result);
                    }
                }
            };
            try {
		let uri = "language=" + lang + "&text=" + htmlSource;
		if (mothertongue.lenght > 0) {
			uri = "motherTongue=" + mothertongue + uri;
		}
                req.send(uri);
            } catch (ex) {
                this._showError("errorMessage");
                errorHandler();
            }
        },
        onMenuItemCommand: function(e) {
            let that = this;
            let prefS = "@mozilla.org/preferences-service;1";
            let prefSrv = Cc[prefS].getService(Ci.nsIPrefService);
            let prefs = prefSrv.getBranch("extensions.grammarchecker.");
            prefs.QueryInterface(Ci.nsIPrefBranch2);
            let server1 = prefs.getCharPref("urlpref1");
            let server2 = prefs.getCharPref("urlpref2");
            let lang = this._getLangFromSpellChecker(prefs);
            let mothertongue = prefs.getCharPref("mothertongue");
            this._checkGrammar(server1, lang, mothertongue, function() {
                    that._checkGrammar(server2, lang, mothertongue, null);
                });
        }
    };
};
window.addEventListener("load",function(e) { grammarchecker.onLoad(e); },
                        false);
window.addEventListener("compose-window-init",
                        function() { grammarchecker.clearPreview(); },
                        true);
