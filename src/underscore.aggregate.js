/*jslint indent : 4, nomen : true, plusplus : true */
/*global _ : true, JSON : true */

_.mixin({
	aggregate : function (list, numericKey, keys) {
		'use strict';

		var i = 0,
			item = {},
			returnArray = [],
			dataOrder = [],
			data = {},
			AggregateError;

		// declare our AggregateError class
		AggregateError = function (msg) {
			this.name = 'AggregateError';
			this.message = msg || 'An error occurred while trying to perform aggregation';
		};
		AggregateError.prototype = new Error();
		AggregateError.prototype.constructor = AggregateError;

		// _.deepPluck is required
		if (!_ || !_.deepPluck) {
			throw new AggregateError("_.deepPluck is required for _.aggregate() to work.");
		}

		// JSON.stringify is required
		if (!JSON || !JSON.stringify) {
			throw new AggregateError("JSON.stringify() is required for _.aggregate() to work.");
		}

		// keys can be a single key (string), or an array of keys.
		// we always want to deal with arrays though
		if (typeof keys === 'string') {
			keys = [keys];
		}

		// make sure keys is an array
		if (!_.isArray(keys)) {
			keys = [];
		}

		_.each(list, function (obj) {
			// declare some variables
			var groupedValues = [], aggregationKey = '', numericValue;

			// get all our groupedValues
			for (i = 0; i < keys.length; i++) {
				groupedValues[i] = _.deepPluck([obj], keys[i])[0];
			}

			// create a key for our aggregations
			aggregationKey = JSON.stringify(groupedValues);

			// get our current numeric value
			numericValue = parseInt(_.deepPluck([obj], numericKey)[0], 10) || 0;

			if (data.hasOwnProperty(aggregationKey)) {
				// count
				data[aggregationKey].count = data[aggregationKey].count + 1;
				// sum
				data[aggregationKey].sum = data[aggregationKey].sum + numericValue;
				// max
				if (numericValue > data[aggregationKey].max) {
					data[aggregationKey].max = numericValue;
				}
				// min
				if (numericValue < data[aggregationKey].min) {
					data[aggregationKey].min = numericValue;
				}
				// avg is calculated when building our return array
			} else {
				dataOrder.push(aggregationKey);
				data[aggregationKey] = {
					count : 1,
					sum : numericValue,
					max : numericValue,
					min : numericValue,
					avg : numericValue,
					group : groupedValues
				};
			}

		});

		for (i = 0; i < dataOrder.length; i++) {
			item = data[dataOrder[i]];
			item.avg = item.sum / item.count;
			returnArray.push(item);
		}

		return returnArray;
	}
});