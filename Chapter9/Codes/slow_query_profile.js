
/** 

Author: Abhishek Kumar
Chapter 9 (Monitoring and Troubleshooting)

Purpose:
* This scripts reports all the slow queries that got logged into the profiler. 
* It helps us to understand any spikes in slow queries count.
* Get total moved documents counts

Configurable params
	profile_frequency: How frequently we want the profile to report the metrics
	percentile_values: All the percentile values needed for all such query completion time
*/

var profile_frequency = 1;				// per hour
var percentile_values = [0.50, 0.90, 0.95, 0.99];

var start_min_ago = profile_frequency * 60;

var query_type_mapping = {
	"all" : "All slow queries",
	"moved" : "Update resulting document move"
};

var query_mapping = {};

var find_query = {};
find_query.ts = { "$gt" : new Date(new Date().getTime() - (start_min_ago * 60 * 1000))};

rs.slaveOk();
db.system.profile.find(find_query, {'query.query':1, millis:1}).sort({millis:1}).forEach(function (obj) {
	var query_uri="all";	
	if(query_mapping[query_uri]) {
		var query_details = query_mapping[query_uri];
		query_details.count++;
		query_details.millis.push(obj.millis);
	} else {
		var query_details = {};
		query_details.count = 1;
		query_details.millis = [obj.millis];
		query_mapping[query_uri] = query_details;
	}
});

find_query['moved'] = true;
db.system.profile.find(find_query, {millis:1}).sort({millis:1}).forEach(function (obj) {
        var query_uri="moved";
        if(query_mapping[query_uri]) {
                var query_details = query_mapping[query_uri];
                query_details.count++;
                query_details.millis.push(obj.millis);
        } else {
                var query_details = {};
                query_details.count = 1;
                query_details.millis = [obj.millis];
                query_mapping[query_uri] = query_details;
        }
});

function print_percentile_values(millis_list, total_count) {
	for(var i in percentile_values)
		print((percentile_values[i] * 100) + "th percentile [ " + (millis_list[Math.floor(total_count * percentile_values[i])]) + " ms ]");
}

function get_avg(millis_list, total_count) {
	var total_millis = 0;
	for(var i in millis_list)
		total_millis = total_millis + millis_list[i];
	return total_millis/total_count;
}

function getCountExceedingLimit(millis_list,limitInMillis) {
        var count = 0;
        for(var i in millis_list)
                if(millis_list[i] > limitInMillis)
                        count++;
        return count;
}

function perform_processing() {
	for(var key in query_mapping) {
		print("---------------------------------");
		var query_name = key;
		if(query_type_mapping[key])
			query_name = query_type_mapping[key];

		print("Query-Type [ " + query_name + " ]");
		print("------");

		print("Count : [ " + query_mapping[key].count + " ]");	
		print("Avg : [ " + get_avg(query_mapping[key].millis, query_mapping[key].count) + " ms ]");
		print_percentile_values(query_mapping[key].millis, query_mapping[key].count);
		print("[ > 5 sec ] : [ " + getCountExceedingLimit(query_mapping[key].millis, 5000) + " ms ]");
		print("Max : [ " + query_mapping[key].millis[query_mapping[key].millis.length - 1] + " ms ]");

		print("---------------------------------");
	}
}

perform_processing();
