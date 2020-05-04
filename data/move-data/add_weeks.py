#add_weeks.py

import requests
import json
import pandas as pd 
import csv
from pandas.io.json import json_normalize
import numpy as np

def read_move_data(week):
	move_data  = pd.DataFrame()
	file_name  = "raw-move-data/" + week + ".csv"
	ds         = pd.read_csv(file_name, header = 0)
	ds.columns = ['county', 'move_index']
	move_data  = move_data.append(ds)
	return move_data

def read_fips_data():
	fips       = pd.DataFrame()
	ds         = pd.read_csv("fips.csv", header = 0)
	ds.columns = ["state", "sab", "sid", "sfips", "county", 
				  "saint", "cfips", "fips"]
	fips       = fips.append(ds)
	return fips

def read_replace_data():
	replace_counties = pd.DataFrame()
	ds               = pd.read_csv("replace-long-counties.csv", header=0)
	ds.columns       = ["curr_name", "new_name"]
	replace_counties = replace_counties.append(ds)
	replace_counties = pd.Series(replace_counties.new_name.values,
								 index=replace_counties.curr_name).to_dict()
	return replace_counties

def clean_data(move_data, replace_counties, index_col):
		move_data[index_col] = move_data[index_col].replace(r'^\s*$',np.nan,regex=True)
		move_data[index_col] = move_data[index_col].replace("Index",np.nan,regex=True)
		move_data = move_data.dropna(axis=0, subset=[index_col])
		move_data = move_data.sort_values(by="county", inplace=False)
		move_data['county'] = move_data['county'].replace(replace_counties)
		return move_data


def get_move_index(week, replace_counties):
	move_data = read_move_data(week)
	move_data = clean_data(move_data, replace_counties, 'move_index')
	move_data['move_index'] = move_data['move_index'].astype(float)
	move_data.round({'move_index': 2})
	return move_data

def gen_data():
	with open("move.json", "r") as infile:
		move_data = json.load(infile)

	print(move_data)

	print("gen data start")
	move_dates       = ['april-6', 'april-13', 'april-20', 'april-27']
	fips             = read_fips_data()
	replace_counties = read_replace_data()
	data     = dict()
	move_by_week  = []

	for week in move_dates:
		print("combining move index for week", week)
		next_week = get_move_index(week, replace_counties)
		next_week['county'] = next_week['county'].str.lower()
		next_week['county'] = next_week['county'].replace("'", '')
		next_week['county'] = next_week['county'].replace('.', '')
		next_week = json.loads(next_week.to_json(orient='records'))

		for county in move_data:
			for new_county in next_week:
				if county['county'] == new_county['county']:
					indeces = county['move_index']
					new_move_index = new_county['move_index']
					indeces.append(new_move_index)
					county['move_index'] = indeces

	df = pd.DataFrame()
	df = pd.read_json(json.dumps(move_data))

	#in order to test output with a csv: 
	df.to_csv('test-new-move.csv', index = False)
	
	with open("test-add-move.json", "w") as outfile: 
	   	json.dump(move_data, outfile) 



gen_data()