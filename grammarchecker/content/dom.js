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

function NodesMapping() {

	this.nodes = {};
	this.counterY = 0;
	this.counterX = 0;

	this.init = function() {
		this.nodes = {};
		this.counterX = 0;
		this.counterY = 0;
		this.nodes[0] = {};
		var editor = GetCurrentEditor();
		var root = editor.rootElement;
		return this.parseNodes("", root);
	};

	this.parseNodes = function(result, root) {
		var i = 0;
		for (i = 0; i < root.childNodes.length; i++) {
			var item = root.childNodes[i];
			if (item.nodeType == Node.TEXT_NODE) {
				var text = String(item.textContent);
				if (text.length > 0) {
					result += text;
					var previousX = this.counterX;
					this.counterX = previousX + text.length;
					var currentNodes = this.nodes[this.counterY];
					currentNodes[previousX + "," + this.counterX] = item;
				}
			} else if (item.localName.toUpperCase() == "BR") {
				result += "\n";
				this.counterY += 1;
				this.counterX = 0;
				this.nodes[this.counterY] = {};
			} else {
				result = this.parseNodes(result, item);
			}
		}
		return result;
	};

	this.findNode = function(x, y) {
		var currentNodes = this.nodes[y];
		for (var key in currentNodes) {
			var range = key.split(",");
			var left = parseInt(range[0]);
			var right = parseInt(range[1]);
			if (x >= left && x < right) {
				var item = {};
				item["node"] = currentNodes[key];
				item["offset"] = x - left;
				return item;
			}
		}
		return null;
	};
}