/**
	--------------------------------------------------------------------------
	(1) Find all the missed chunks because of chunk move followed by shard failure
	-------------------------------------------------------------------------- 
	find_missed_chunks()
		ts_backup: time of backup
		failed_shard: failed shard name
	e.g. find_missed_chunks(ISODate("2013-07-20T17:47:27.860Z"), "abhiReplSet")
		[
			{
				"_id" : "bdvlpabhishekk-2013-07-20T17:47:27-51eacd2f0c5c5c12e0e45229",
				"server" : "bdvlpabhishekk",
				"clientAddr" : "127.0.0.1:48127",
				"time" : ISODate("2013-07-20T17:47:27.861Z"),
				"what" : "moveChunk.commit",
				"ns" : "test.test",
				"details" : {
					"min" : {
						"key1" : 307428
					},
					"max" : {
						"key1" : 326578
					},
					"from" : "abhiReplSet2",
					"to" : "abhiReplSet"
				}
			}
		]
	-------------------------------------------------------------------------
	(2) Find the oplog length, which means for how many days of oplog it can hold
	-------------------------------------------------------------------------
	get_oplog_length()

	e.g. get_oplog_length()
		Oplog length [ 32.56100694444444 days ]
	
*/

function get_oplog_length() {
        return "Oplog length [ " + (getDB('local').oplog.rs.find().sort({$natural: -1}).limit(1).next().ts.getTime() - getDB('local').oplog.rs.find().sort({$natural: 1}).limit(1).next().ts.getTime())/(60*60*24) + " days ]";
}

function getDB(db_name) {
	rs.slaveOk();
	return db.getMongo().getDB(db_name);
}

function find_missed_chunks(ts_backup, failed_shard) {
	return getDB("config").changelog.find({time : {$gte : ts_backup}, what : "moveChunk.commit", 'details.to' : failed_shard}).toArray();
}
