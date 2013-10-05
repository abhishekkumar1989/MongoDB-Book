import time
import pymongo
from pymongo import MongoClient
import random
import string

class Mongo:
	test_db = None
	insert_per_batch = 100
	thread_count = 1

	def __init__(self):
		print 'Creating mongo object...'
		client = MongoClient('mongodb://localhost:27016/?connectTimeoutMS=2000')
		self.test_db = client.test

	def insert(self, size):
		batch = []
		for i in range(0,insert_per_batch):
			value = self.random_alphanumeric(size)
			batch.append({'key1': value, 'key2': value})
		start = round(time.time() * 1000)
		self.test_db['test'].insert(batch)
		print 'Inserted in : ' + (str(round(time.time() * 1000) - start)) + ' ms'

	def random_alphanumeric(self, limit):
		char_set = string.ascii_uppercase + string.digits
		return ''.join(random.sample(char_set*6,limit))

Mongo().insert(200)
