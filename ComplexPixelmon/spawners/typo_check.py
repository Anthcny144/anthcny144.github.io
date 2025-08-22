import requests

# get Pokemon names
url = "https://gist.githubusercontent.com/killshot13/5b45c0089c3b1a19028bec38aad8fa46/raw/10d30ab4a74ac7e083a3cc6135c605379ddee952/pokemon.txt"
content = requests.get(url).text
mons_raw = content.split("\n")[:-1]

# some fixes in the raw list
mons_raw[28] = "nidoranfemale"
mons_raw[31] = "nidoranmale"
mons_raw[82] = "farfetchd"
mons_raw[121] = "mrmime"
mons_raw[438] = "mimejr"
mons_raw[668] = "flabebe"
mons_raw[864] = "sirfetchd"
mons_raw[865] = "mrrime"
mons_raw[987] = "slither wing"
mons_raw[994] = "iron thorns"

# get Data.ts
with open("Sources/Data.ts") as file:
    data = file.read()

found = False
pos_global = 0
while True:
    pos_global = data.find("new Spawner(", pos_global)
    if pos_global == -1:
        break

    array_start = data.find("), [\"", pos_global)
    if array_start == -1:
        break
    array_start += 3

    array_end = data.find("\"]", array_start) + 2
    pos_global = array_end

    mons_array: list[str] = eval(data[array_start : array_end])

    for mon in mons_array:
        mon = mon.lower().replace("'", "")

        pos = mon.find(" (")
        if pos != -1:
            mon = mon[0 : pos]

        if not mon in mons_raw:
            found = True
            print(f"'{mon}'")

if not found:
    print("All OK")