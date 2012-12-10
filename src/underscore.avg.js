/*jslint indent: 4, nomen: true, plusplus: true */
/*global _:true */

_.mixin({
	avg : function (obj, iterator, context) {
		'use strict';
		var sum = _.sum(obj, iterator, context),
			size = _.size(obj);
		return size ? sum / size : 0;
	}
});