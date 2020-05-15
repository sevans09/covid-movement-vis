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
now="$(date -j -v-1d +'%m/%d')"
git add data/cases-data/old-us-counties-cases.json data/cases-data/us-counties.csv donut/test.csv us-county-cases.json
git commit -m "pull $now data"
git push origin master
