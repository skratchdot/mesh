/*jslint indent: 4, nomen: true, plusplus: true */
/*global _:true */

_.mixin({
	deepPluck : (function () {
		'use strict';

		// declare some variables
		var defaultDelimiter = '.', deepPluck;

		// implement the deepPluck function
		deepPluck = function (obj, key, delimiter) {
			if (typeof delimiter !== 'string') {
				delimiter = defaultDelimiter;
			}
			return _.map(obj, function (value) {
		        var arr, i;
		        if (typeof key === 'string') {
		            arr = key.split(delimiter);
		            for (i = 0; i < arr.length; i++) {
		                if (value && typeof value === 'object' && value.hasOwnProperty(arr[i])) {
		                    value = value[arr[i]];
		                } else {
		                    return;
		                }
		            }
		            return value;
		        }
			});
		};

		// allow the default delimiter to be overridden
		// you may want to do this if you actually use dots in your keys
		deepPluck.setDelimiter = function (delimiter) {
			defaultDelimiter = delimiter;
		};

		return deepPluck;
	}())
});