/*jslint indent: 4, nomen: true, plusplus: true */
/*global _:true */

_.mixin({
	variance : function (obj, iterator, context) {
		'use strict';
		var result = 0, size = _.size(obj), mean;
		if (size === 0) {
			return 0;
		}
		// set mean
		mean = _.avg(obj, iterator, context);
		_.each(obj, function (value, index, list) {
			var computed = iterator ? iterator.call(context, value, index, list) : value,
				diff = computed - mean;
			result += diff * diff;
		});
		return result / size;
	}
});