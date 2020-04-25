import json
import pandas as pd 
import csv
from pandas.io.json import json_normalize
import numpy as np
import itertools
from operator import itemgetter
from collections import defaultdict


'''
desired format: 
cases_data = [{"dates": ["2020-01-21", "2020-01-22", ...], 
			  "county": "Snohomish", 
			  "state": "Washington", 
			  "fips": 53061, 
			  "cases": [1, 1, 2, 4, ...], 
			  "deaths": [0, 0, 0, 1]},{""},...,{}]

'''
def gen_data():

	with open("old-us-counties-cases.json", "r") as infile:
		data = json.load(infile)

	cases_data = []

	for county in data:
		if isinstance(county['fips'], str):
			if not county['fips'] == '':
				county['fips'] = int(county['fips'].strip())

	#group data by fips
	grouped = defaultdict(list)
	for county in data:
		grouped[county['fips']].append(county)

	#aggregate data into arrays by county
	for fips, data in grouped.items():
		cases_by_county = {}
		dates = []
		num_cases = []
		deaths = []
		cases_by_county['fips'] = fips

		for cases in data:
			dates.append(cases['date'])
			num_cases.append(cases['cases'])
			deaths.append(cases['deaths'])
			state = cases['state']
			county = cases['county']

		cases_by_county['state'] = state
		cases_by_county['county'] = county
		cases_by_county['dates'] = dates
		cases_by_county['cases'] = num_cases
		cases_by_county['deaths'] = deaths
		cases_by_county['total_cases'] = sum(num_cases)

		cases_data.append(cases_by_county)
	
	with open("us-county-cases.json", "w+") as outfile: 
		outfile.write("cases_data = ")
		json.dump(cases_data, outfile) 


gen_data()









