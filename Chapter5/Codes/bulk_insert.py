import time
import thread
import pymongo
from pymongo import MongoClient

class Mongo:
	test_db = None
	insert_per_batch = 100
	thread_count = 1

	def __init__(self):
		print 'Creating mongo object...'
		client = MongoClient('mongodb://localhost:27016/?connectTimeoutMS=2000')
		self.test_db = client.test

	def insert(self, thread_name):
		while True:
			batch = []
			for i in range(0,99):
				batch.append({'key1': thread_name, 'key2': thread_name})
			start = round(time.time() * 1000)
			self.test_db['test'].insert(batch)
			print 'Thread-' + thread_name + ' : ' + (str(round(time.time() * 1000) - start)) + ' ms'

	def parallel_insert(self):
		try:
			for no in range(0, self.thread_count):
				thread.start_new_thread(self.insert, (str(no),))
		except:
			print "Error: creating thread"

Mongo().parallel_insert()

while 1:
   pass
