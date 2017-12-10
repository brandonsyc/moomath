import sys,time
import os.path

p = open("needed.txt", "a")
p.write(sys.argv[1] + '\n')
p.close()

results = "searchResults.txt"

while not os.path.exists(results):
    time.sleep(0.01)

k = open(results, "r")
l = k.read().split("\n")
k.close()

for i in l:
    if i.startswith(sys.argv[1]):
        print i[len(sys.argv[1])+2:]
        break;
