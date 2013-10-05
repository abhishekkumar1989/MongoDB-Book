import time
import thread
import pymongo
from pymongo import MongoClient
import traceback

class Mongo:
	test_db = None
	thread_count = 1

	def __init__(self):
		print 'Creating mongo object...'
		client = MongoClient('mongodb://localhost:27018/?connectTimeoutMS=2000&w=1&wtimeoutMS=1000&j=true')
		self.test_db = client.test

	def insert(self, thread_name):
		while True:
			try:
				start = round(time.time() * 1000)
				self.test_db['test2'].insert({'key1': thread_name, 'key2': thread_name})
				print 'Thread-' + thread_name + ' : ' + (str(round(time.time() * 1000) - start)) + ' ms'
			except Exception:
				print traceback.format_exc()

	def parallel_insert(self):
		try:
			for no in range(0, self.thread_count):
				thread.start_new_thread(self.insert, (str(no),))
		except Exception:
			print 'Error: creating thread'
			print traceback.format_exc()			

Mongo().parallel_insert()

while 1:
   pass
