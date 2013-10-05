/*
	Generates load in any collection
		1) generate_load()
			count : no of documents to be inserted
			collection_name : name of the collection
			array_keys : What are the keys you want to have in your document
		e.g. : generate_load(100, 'test', ['a', '_id'])
			{ "_id" : 0, "a" : 0 }
			{ "_id" : 1, "a" : 1 }

		2) generate_random_load()
			key_value_size : length of key's value
		e.g. : generate_random_load(5, 'test', ['a'], 5)
			{ "_id" : ObjectId("51a0a997099b3346085171a9"), "a" : "FME3c" }
			{ "_id" : ObjectId("51a0a997099b3346085171aa"), "a" : "78vXW" }
		3) update_keys()
			count : no of documents to update
			keys_to_update : list of keys to update
			new_key_size : the new size of the value of the key, the new value is random string
			update_by_id : is the update happens using _id field, otherwise will happen with the new_key_size[0] key
*/


function generate_load(count, collection_name, array_keys) {
        for(var i=0; i< count;i++) {
                var document = {};
                for(var j in array_keys) {
                        document[array_keys[j]] = i;
                }
                getDB('test').getCollection(collection_name).insert(document);
        }
}

function generate_random_load(count, collection_name, array_keys, key_value_size) {
    for (var i = 0; i < count; i++) {
        var document = {};
        for (var j in array_keys) {
            document[array_keys[j]] = random_string(key_value_size);
        }
        getDB("test").getCollection(collection_name).insert(document);
    }
}

function getDB(db_name) {
	// add auth, if your db is running in auth mode or login to mongo shell using admin privilege
        return db.getMongo().getDB(db_name);
}

function random_string(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

function update_keys(count, collection_name, keys_to_update, new_key_size, update_by_id) {
	var start_time = new Date().getTime();
	var collection = getDB('test').getCollection(collection_name);	
	collection.find().limit(count).forEach(function(obj) {
		var find_query = {};
		update_by_id ? find_query['_id'] = obj['_id'] :	find_query[keys_to_update[0]] = obj[keys_to_update[0]];
		var update_query = {};
		for(var i in keys_to_update ) {
			update_query[keys_to_update[i]] = random_string(new_key_size);
		}
		collection.update(find_query, { $set : update_query });	
	});
	print("Total time : " + ((new Date().getTime() - start_time)/1000) + " sec");
}
