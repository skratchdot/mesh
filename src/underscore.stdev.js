/*jslint indent: 4, nomen: true, plusplus: true */
/*global _:true */

_.mixin({
	stdev : function (obj, iterator, context) {
		'use strict';
	    return Math.sqrt(_.variance(obj, iterator, context));
	}
});