#demographic data

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

def read_vote_data():
	votes      = pd.DataFrame()
	ds         = pd.read_csv("trump-vote.csv", header = 0)
	ds.columns = ["index", "votes_dem",	"votes_gop", "total_votes",	
				  "per_dem", "per_gop",	"diff",	"per_point_diff",
				  "state_abbr",	"county_name", "fips"]
	votes       = votes.append(ds)
	return votes

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


def gen_data():
	move_date      = "march-02"
	fips             = read_fips_data()
	replace_counties = read_replace_data()

	move_data = read_move_data(move_date)
	move_data = clean_data(move_data, replace_counties, 'move_index')
	move_data['move_index'] = move_data['move_index'].astype(float)

	#add fips data with a join
	move_data = pd.merge_ordered(left=move_data, right=fips, on="county", how="inner")
	move_data.drop_duplicates(subset ="fips", keep = "first", inplace = True) 
	move_data = move_data.drop(columns = ["sid", "sfips", "saint", "cfips"])

	votes = read_vote_data()

	move_data = pd.merge_ordered(left=move_data, right=votes, on="fips", how="inner")
	move_data.drop_duplicates(subset ="fips", keep = "first", inplace = True) 
	move_data = move_data.drop(columns = ["index", "move_index", "votes_dem", "votes_gop", 
										  "total_votes", "diff", "per_point_diff", 
										  "state_abbr", "county_name"])	
	#in order to test output with a csv: 
	move_data.to_csv('demographic-data.csv', index = False)

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









