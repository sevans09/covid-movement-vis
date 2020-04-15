'''
Data Format

Data = dict
{ Week date: 
		{ county : index }
}

Need an average dataset!!

Example:
{ "03-02":
		{ county1 : index1
		  county2 : index2
		  ....
		}
  "03-09": ...
  "03-16": ...
  "03-23": ...
  "03-30": ...
}
'''

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

def read_avg_move():
	avg_index = pd.DataFrame()
	ds = pd.read_csv("raw-move-data/avg.csv", header = 0)
	ds.columns = ['county', 'avg_index']
	avg_index = avg_index.append(ds)
	return avg_index

def calculate_delta(move_data, avg_index):
	print(move_data.shape)
	move_data = pd.merge_ordered(left=move_data, right=avg_index, on="county", how="left")
	print(move_data.shape)
	#move_data.drop_duplicates(subset ="county", keep = "first", inplace = True) 

	for index, row in move_data.iterrows():
		avg  = row['avg_index']
		move = row['move_index']
		move_data.at[index, 'avg_index'] = round(100 * ((move - avg) / avg), 2)
	return move_data

def get_index_delta(week, replace_counties):
	move_data = read_move_data(week)
	avg_index = read_avg_move()

	avg_index = clean_data(avg_index, replace_counties, 'avg_index')
	move_data = clean_data(move_data, replace_counties, 'move_index')

	avg_index['avg_index'] = avg_index['avg_index'].astype(float)
	move_data['move_index'] = move_data['move_index'].astype(float)

	move_data = calculate_delta(move_data, avg_index)
	move_data.rename(columns={'avg_index':'delta'}, inplace=True)
	return move_data


def gen_data():
	start = "march-02"
	move_dates       = ["march-09","march-16",
						"march-23","march-30"]
	fips             = read_fips_data()
	replace_counties = read_replace_data()
	data     = dict()
	move_by_week  = []
	delta_by_week = []

	move_data = get_index_delta(start, replace_counties)

	#add fips data with a join
	move_data = pd.merge_ordered(left=move_data, right=fips, on="county", how="inner")
	move_data.drop_duplicates(subset ="fips", keep = "first", inplace = True) 
	move_data = move_data.drop(columns = ["sid", "sfips", "saint", "cfips"])
	move_data = json.loads(move_data.to_json(orient='records'))

	#now we have the master json for the first week, add move index and delta 

	for week in move_dates:
		next_week = get_index_delta(week, replace_counties)
		next_week = json.loads(next_week.to_json(orient='records'))

		for county in move_data:

			if not isinstance(county['move_index'], list):
				county['move_index'] = [county['move_index']]
				county['delta']      = [county['delta']]

			for new_county in next_week:
				if county['county'] == new_county['county']:
					indeces = county['move_index']
					deltas       = county['delta']
					new_move_index = new_county['move_index']
					new_delta	   = new_county['delta']
					indeces.append(new_move_index)
					deltas.append(new_delta)
					county['move_index'] = indeces	
					county['delta'] = deltas

	print(move_data)




	
	#in order to test output with a csv: 
	#move_data.to_csv('test.csv', index = False)

		# do this when ready to create the entire dataset
		#move_data = move_data.to_json(orient='records')
		#data_by_week[week] = json.loads(move_data)
	
	#with open("move.json", "w") as outfile: 
	   # json.dump(data_by_week, outfile) 

#what are the other metrics we want to add?
#ideas:
#		population
#		wealth index
#		trump-vote

gen_data()









