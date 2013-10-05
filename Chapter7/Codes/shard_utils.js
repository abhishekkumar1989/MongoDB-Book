/*
	Get the chunk information
		1) get_chunk_info()
			ns: the namespace of the collection
			shardKey: shardKey used for that collection
		e.g. : generate_load('test.test', {key1: 1})
			Chunk: test.test-key1_753247.0 with  objects [ 20375 ] has size [ 1141000 ] took [ 6 ms ]
			Chunk: test.test-key1_773622.0 with  objects [ 20376 ] has size [ 1141056 ] took [ 6 ms ]
			Chunk: test.test-key1_793998.0 with  objects [ 22770 ] has size [ 1275120 ] took [ 7 ms ]

*/

function get_chunk_info(ns, shardKey) {
        db.getSiblingDB("config").chunks.find({ ns : ns }).forEach( function(chunk) {
                var info = db.getSiblingDB(ns.split(".")[0]).runCommand({
                        datasize:  chunk.ns,
                        keyPattern: shardKey,
                        min: chunk.min,
                        max: chunk.max
                });
                print("Chunk: " + chunk._id + " with  objects [ "+ info.numObjects + " ] has size [ " + Math.round(info.size/1000) + " KB ] took [ " + info.millis + " ms ]");
        })
}
