/*jslint indent: 4, nomen: true, plusplus: true */
/*global _:true */

_.mixin({
	sum : function (obj, iterator, context) {
		'use strict';
		var result = 0;
		if (!iterator && _.isEmpty(obj)) {
			return 0;
		}
		_.each(obj, function (value, index, list) {
			var computed = iterator ? iterator.call(context, value, index, list) : value;
			result += computed;
		});
		return result;
	}
});