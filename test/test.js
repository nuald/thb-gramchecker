const assert = require('assert');
const vm = require('vm');
const fs = require("fs");

const elem = {
    currentSet: '',
    setAttribute: function() {},
    appendChild: function() {}

}

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

const doc = {
    childNodes: [
        {
            nodeType: TEXT_NODE,
            textContent: "content"
        },
        {
            nodeType: ELEMENT_NODE,
            localName: "br"
        }
    ],
    getElementById: function(id) {
        if (id === 'grammarchecker-strings') {
            return {
                getString: function() {}
            }
        }
        return elem;
    },
    querySelectorAll: function() { return {}; },
    persist: function() {},
    createTextNode: function() {},
    createElement: function() {
        return elem;
    }
};

const XmlHTTPRequest = {
    open: function() {},
    send: function() {},
    setRequestHeader: function() {}
};

const sandbox = {
    XMLHttpRequest: function() { return XmlHTTPRequest; },
    Components: {
        interfaces: {},
        utils: {
            importGlobalProperties: function() {}
        }
    },
    Node: {
        TEXT_NODE: TEXT_NODE
    },
    window: {
        addEventListener: function() {}
    },
    document: doc,
    GetCurrentEditor: function() {
        return {
            document: doc,
            rootElement: doc,
            QueryInterface: function() {},
            addOverrideStyleSheet: function() {}
        };
    },
    GetComposerCommandTable: function() {
        return {
            registerCommand: function() {}
        }
    }
};

const dom = fs.readFileSync("grammarchecker/content/dom.js");
const overlay = fs.readFileSync("grammarchecker/content/overlay.js");
const context = new vm.createContext(sandbox);
vm.runInNewContext(dom, context);
vm.runInNewContext(overlay, context);

describe('grammarchecker', function() {
    describe('#_checkGrammar()', function() {
        it('should send correct HTTP POST request', function() {
            XmlHTTPRequest.open = function(type, url) {
                assert.equal(type, "POST");
                assert.equal(url, "http://localhost:8081/v2/check");
            };
            XmlHTTPRequest.send = function(uri) {
                assert.equal(uri, "language=en&text=content%0A");
            };
            sandbox.grammarchecker.onLoad();
            sandbox.grammarchecker._checkGrammar(
                'http://localhost:8081', 'en', '', function(ex) {
                    assert.ok(false,
                        "no error handler should have been called, but got " + ex);
                }
            );
        });
    });
});
