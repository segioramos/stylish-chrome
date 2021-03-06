tDocLoader();

function t(key, params) {
	var s = chrome.i18n.getMessage(key, params)
	if (s == "") {
		throw "Missing string '" + key + "'.";
	}
	return s;
}
function o(key) {
	document.write(t(key));
}
function tE(id, key, attr, esc) {
	if (attr) {
		document.getElementById(id).setAttribute(attr, t(key));
	} else if (typeof esc == "undefined" || esc) {
		document.getElementById(id).appendChild(document.createTextNode(t(key)));
	} else {
		document.getElementById(id).innerHTML = t(key);
	}
}

function tHTML(html) {
	var node = document.createElement("div");
	node.innerHTML = html.replace(/>\s+</g, '><'); // spaces are removed; use &nbsp; for an explicit space
	tNodeList(node.querySelectorAll("*"));
	var child = node.removeChild(node.firstElementChild);
	node.remove();
	return child;
}

function tNodeList(nodes) {
	for (var n = 0; n < nodes.length; n++) {
		var node = nodes[n];
		if (node.nodeType != 1) { // not an ELEMENT_NODE
			continue;
		}
		for (var a = 0; a < node.attributes.length; a++) {
			var name = node.attributes[a].nodeName;
			if (name.indexOf("i18n-") != 0) {
				continue;
			}
			name = name.substr(5); // "i18n-".length
			var value = t(node.attributes[a].nodeValue);
			switch (name) {
				case "text":
					node.insertBefore(document.createTextNode(value), node.firstChild);
					break;
				case "html":
					node.insertAdjacentHTML("afterbegin", value);
					break;
				default:
					node.setAttribute(name, value);
			}
		}
	}
}

function tDocLoader() {
	// localize HEAD
	tNodeList(document.querySelectorAll("*"));

	// localize BODY
	var observer = new MutationObserver(function(mutations) {
		for (var m = 0; m < mutations.length; m++) {
			tNodeList(mutations[m].addedNodes);
		}
	});
	observer.observe(document, {subtree: true, childList: true});
	document.addEventListener("DOMContentLoaded", function() {
		observer.disconnect();
	});
}
