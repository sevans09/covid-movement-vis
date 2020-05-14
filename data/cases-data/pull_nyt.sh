#!/bin/bash
cd /Users/sejaldua/Desktop/Spring2020/COMP177/covid-movement-vis/data/cases-data
git pull
cd ../../../covid-19-data
git pull
cp us-counties.csv ../covid-movement-vis/data/cases-data/
cd ../covid-movement-vis/data/cases-data
python csv2json.py us-counties.csv old-us-counties-cases.json
python gen_cases_data.py
mv us-county-cases.json ../../
python gen_csv_data.py
cd ../../
echo "Tail: "
tail -c 56 us-county-cases.json
echo "\n"
now="$(date --date="-1 day" +'%m/%d')"
git add .
git commit -m "pull $now data"
git push origin master
