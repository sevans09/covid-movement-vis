import csv
import json

with open("../../us-county-cases.json", "r") as infile:
    xstr = infile.read()[13:]
    x = json.loads(xstr)

f = csv.writer(open("../../donut/test.csv", "wb+"))

# Write CSV Header, If you dont need that, remove this line
f.writerow(["County", "Cases", "Relative Percentage"])

cases = []
i = 0
for x in x:
    cases[i] = x["cases"][-1]
    i += 1

j = 0
for x in x:
    f.writerow([x["county"],
                x["cases"],
                str(cases[j]/sum(cases))])
    j += 1

f.close()