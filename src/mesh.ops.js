/*jslint nomen: true */
/*global mesh */

// http://docs.mongodb.org/manual/reference/operator/
mesh.ops = {};

mesh.ops._query = {
	"addToSet" : "$addToSet",
	"all" : "$all",
	"and" : "$and",
	"bit" : "$bit",
	"box" : "$box",
	"center" : "$center",
	"centerSphere" : "$centerSphere",
	"comment" : "$comment",
	"each" : "$each",
	"elemMatch" : "$elemMatch",
	"exists" : "$exists",
	"explain" : "$explain",
	"gt" : "$gt",
	"gte" : "$gte",
	"hint" : "$hint",
	"in" : "$in",
	"inc" : "$inc",
	"isolated" : "$isolated",
	"lt" : "$lt",
	"lte" : "$lte",
	"max" : "$max",
	"maxDistance" : "$maxDistance",
	"maxScan" : "$maxScan",
	"min" : "$min",
	"mod" : "$mod",
	"natural" : "$natural",
	"ne" : "$ne",
	"near" : "$near",
	"nearSphere" : "$nearSphere",
	"nin" : "$nin",
	"nor" : "$nor",
	"not" : "$not",
	"or" : "$or",
	"orderby" : "$orderby",
	"polygon" : "$polygon",
	"pop" : "$pop",
	"$" : "$",
	"pull" : "$pull",
	"pullAll" : "$pullAll",
	"push" : "$push",
	"pushAll" : "$pushAll",
	"query" : "$query",
	"regex" : "$regex",
	"rename" : "$rename",
	"returnKey" : "$returnKey",
	"set" : "$set",
	"setOnInsert" : "$setOnInsert",
	"showDiskLoc" : "$showDiskLoc",
	"size" : "$size",
	"snapshot" : "$snapshot",
	"type" : "$type",
	"uniqueDocs" : "$uniqueDocs",
	"unset" : "$unset",
	"where" : "$where",
	"within" : "$within"
};

mesh.ops._projection = {
	"elemMatch" : "$elemMatch",
	"$" : "$",
	"slice" : "$slice"
};

mesh.ops._aggregation = {
	"add" : "$add",
	"addToSet" : "$addToSet",
	"and" : "$and",
	"avg" : "$avg",
	"cmp" : "$cmp",
	"cond" : "$cond",
	"dayOfMonth" : "$dayOfMonth",
	"dayOfWeek" : "$dayOfWeek",
	"dayOfYear" : "$dayOfYear",
	"divide" : "$divide",
	"eq" : "$eq",
	"first" : "$first",
	"group" : "$group",
	"gt" : "$gt",
	"gte" : "$gte",
	"hour" : "$hour",
	"ifNull" : "$ifNull",
	"last" : "$last",
	"limit" : "$limit",
	"lt" : "$lt",
	"lte" : "$lte",
	"match" : "$match",
	"max" : "$max",
	"min" : "$min",
	"minute" : "$minute",
	"mod" : "$mod",
	"month" : "$month",
	"multiply" : "$multiply",
	"ne" : "$ne",
	"not" : "$not",
	"or" : "$or",
	"project" : "$project",
	"push" : "$push",
	"second" : "$second",
	"skip" : "$skip",
	"sort" : "$sort",
	"strcasecmp" : "$strcasecmp",
	"substr" : "$substr",
	"subtract" : "$subtract",
	"sum" : "$sum",
	"toLower" : "$toLower",
	"toUpper" : "$toUpper",
	"unwind" : "$unwind",
	"week" : "$week",
	"year" : "$year"
};

// build out ops
["_query", "_projection", "_aggregation"].forEach(function (section) {
	'use strict';
	var key;
	for (key in mesh.ops[section]) {
		if (mesh.ops[section].hasOwnProperty(key)) {
			mesh.ops[key] = mesh.ops[section][key];
		}
	}
});
