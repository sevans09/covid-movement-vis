import csv
import json

with open("../../us-county-cases.json", "r") as infile:
    xstr = infile.read()[13:]
    x = json.loads(xstr)

f = csv.writer(open("../../donut/test.csv", "w+"))

# Write CSV Header, If you dont need that, remove this line
f.writerow(["County", "State", "Cases", "Percentage"])

cases = []
state_dict = {}
for col in x:
    cases.append(col["cases"][len(col["cases"])-1])
    try:
        state_dict[col["state"]].append(col["cases"][len(col["cases"])-1])
    except:
        state_dict[col["state"]]= []
        state_dict[col["state"]].append(col["cases"][len(col["cases"])-1])


j = 0
for col in x:
    f.writerow([
        col["county"],
        col["state"],
        cases[j],
        str(cases[j]/sum(state_dict[col["state"]]))])
    j += 1