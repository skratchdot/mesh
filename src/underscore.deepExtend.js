/*jslint indent: 4, nomen: true, plusplus: true */
/*global _:true */

_.mixin({
	deepExtend : function (obj) {
		'use strict';
		_.each(Array.prototype.slice.call(arguments, 1), function (source) {
			var key;
			if (_.isObject(obj) && _.isObject(source) && !_.isArray(obj) && !_.isArray(source)) {
				for (key in source) {
					if (source.hasOwnProperty(key)) {
						if (obj.hasOwnProperty(key)) {
							obj[key] = _.deepExtend(obj[key], source[key]);
						} else {
							obj[key] = source[key];
						}
					}
				}
			} else {
				obj = source;
			}
		});
		return obj;
	}
});
