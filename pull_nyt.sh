#!/bin/bash
cd ../covid-19-data
git pull
cp us-counties.csv ../covid-movement-vis/data/cases-data/
cd ../covid-movement-vis/data/cases-data
python csv2json/csv2json.py us-counties.csv old-us-counties-cases.json
python gen_cases_data.py
mv us-county-cases.json ../../
head -c 50 us-county-cases.json
