/**
	There are 6 types of operation in the profiler: query, update, remove, insert, command, getmore
	The following scripts tell details about the some of the profiler parameter for each of the query. Note all the params are the average value
	@@Params
		profile_last_no_of_hours: Total no of past hours for which we want the profiling

	@@Output
		"query" : {
			"key1" : {			// query based on criteria .find({ key1 : <value> })
				"millis" : 0,		// avg-ms per operation
				"numYield" : 0,		// avg-numYields per operation
				"count" : 10,
				"nscanned" : 16.1,
				"keyUpdates" : 0,
				"nupdated" : 0
			},
			"expireAfterSeconds" : {	// query based on criteria .find({ expireAfterSeconds : <value> })
				"millis" : 0,
				"numYield" : 0,
				"count" : 507,
				"nscanned" : 2.3333333333333335,
				"keyUpdates" : 0,
				"nupdated" : 0
			},

*/

var profile_last_no_of_hours = 100;		// change this value according to the requirement

function get_map() {
	var params = {
		millis : 0,
		numYield : 0,
		count : 0,
		nscanned : 0,
		keyUpdates : 0,
		nupdated : 0
	}
	return params;
}
query_map = {};

db.system.profile.find({ts : {$gte : new Date(new Date().getTime() - profile_last_no_of_hours*60*60*1000)}}).forEach(function(obj) {
	var op = obj.op;
	if(!query_map[op])
		query_map[op] = {};
	if(op == "query" || op == "update" || op == "remove") {
		if(Object.keySet(obj.query).length > 0) {
			var query_params = Object.keySet(obj.query).join('-');
			if(!query_map[op][query_params]) {
				query_map[op][query_params] = get_map();
			}
			query_map[op][query_params].millis+=obj.millis;
			query_map[op][query_params].numYield+=obj.numYield;
			query_map[op][query_params].count+=1;
			if(op == "query" || op == "update") {
				query_map[op][query_params]['nscanned']+=obj.nscanned;
				query_map[op][query_params]['keyUpdates']+=obj.keyUpdates;
			}
			if(op == "update") {
				query_map[op][query_params]['nupdated']+=obj.nupdated;
			}
		}
	}
	if(op == "insert" || op == "command" || op == "getmore") {
		if(Object.keySet(query_map[op]).length == 0) {
			query_map[op] = get_map();
		}
		query_map[op].millis+=obj.millis;
		query_map[op].count+=1;
	}

});
process();
function process() {
	for(var op in query_map) {
		if(op == "query" || op == "update" || op == "remove") {
			for(var query_uri in query_map[op]) {
				var count = query_map[op][query_uri]['count'];
				for(var param in query_map[op][query_uri]) {
					if(param != 'count') {
						query_map[op][query_uri][param] = query_map[op][query_uri][param]/count;
					}
				}
			}
		} else {
			var count = query_map[op]['count'];
			for(var param in query_map[op]) {
				if(param != 'count') {
					query_map[op][param] = query_map[op][param]/count;
				}
			}
		}
	}
}
printjson(query_map);
