#demographic data
#metrics:
#		population
#		wealth index
#		trump-vote

import requests
import json
import pandas as pd 
import csv
from pandas.io.json import json_normalize
import numpy as np

def read_move_data():
	move_data  = pd.DataFrame()
	ds = pd.read_json("move.json")
	ds.columns = ['county', 'move_index', 'state', 
				  'sab', 'fips']
	move_data  = move_data.append(ds)
	return move_data

def read_vote_data():
	votes      = pd.DataFrame()
	ds         = pd.read_csv("trump-vote.csv", header = 0)
	ds.columns = ["index", "votes_dem",	"votes_gop", "total_votes",	
				  "per_dem", "per_gop",	"diff",	"per_point_diff",
				  "state_abbr",	"county_name", "fips"]
	votes       = votes.append(ds)
	return votes

def read_income_data():
	wealth     = pd.DataFrame()
	ds 		   = pd.read_csv("income.csv")
	ds.columns = ['fips', 'median_income']
	wealth	   = wealth.append(ds)
	wealth['fips'] = wealth['fips'].astype(float)
	return wealth

def add_zeros(county_code):
	if len(county_code) == 1:
		return "00" + county_code 
	elif len(county_code) == 2:
		return "0"  + county_code
	return county_code

def read_pop_data():
	pop_data = pd.DataFrame()
	ds       = pd.read_csv("popdata.csv")
	ds.columns = ['state', 'county', 'state_name', 'county_name', 'pop_2019']
	pop_data = pop_data.append(ds)
	pop_data['state_name'] = pop_data[['state', 'county']].apply(lambda x: str(x.state) + add_zeros(str(x.county)), axis = 1) 
	pop_data = pop_data.rename(columns={'state_name': 'fips'})
	pop_data = pop_data.drop(columns = ['county', 'state', 'county_name'])	
	pop_data['fips'] = pop_data['fips'].astype(float)
	return pop_data

def gen_data():

	move_data = read_move_data()
	votes     = read_vote_data()
	pop_data  = read_pop_data()
	wealth    = read_income_data()

	move_data = pd.merge_ordered(left=move_data, right=votes, on="fips", how="inner")
	move_data.drop_duplicates(subset ="fips", keep = "first", inplace = True) 
	move_data = move_data.drop(columns = ["index", "move_index", "votes_dem", "votes_gop", 
										  "total_votes", "diff", "per_point_diff", 
										  "state_abbr", "county_name"])	

	move_data = pd.merge_ordered(left=move_data, right=pop_data, on="fips", how="inner")
	move_data.drop_duplicates(subset ="fips", keep = "first", inplace = True)


	move_data = pd.merge_ordered(left=move_data, right=wealth, on="fips", how="inner")
	move_data.drop_duplicates(subset ="fips", keep = "first", inplace = True)

	#in order to test output with a csv: 
	move_data.to_csv('demographic-data.csv', index = False)

	# do this when ready to create the entire dataset
	move_data = json.loads(move_data.to_json(orient='records'))
	
	with open("demographic-data.json", "w") as outfile: 
		   json.dump(move_data, outfile) 


gen_data()









