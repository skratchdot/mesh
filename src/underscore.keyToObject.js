/*jslint indent: 4, nomen: true, plusplus: true */
/*global _:true */

_.mixin({
	keyToObject : (function () {
		'use strict';

		// declare some variables
		var defaultDelimiter = '.', keyToObject;

		keyToObject = function (key, value, delimiter) {
			var obj = {}, arr = [];
			if (typeof delimiter !== 'string') {
				delimiter = defaultDelimiter;
			}
			if (typeof key === 'string') {
				arr = key.split(delimiter);
				key = arr[0];
				if (arr.length > 1) {
					arr.shift();
					obj[key] = keyToObject(arr.join(delimiter), value, delimiter);
				} else {
					obj[key] = value;
				}
			}
			return obj;
		};

		// allow the default delimiter to be overridden
		keyToObject.setDelimiter = function (delimiter) {
			defaultDelimiter = delimiter;
		};

		return keyToObject;
	}())
});