import sys,time
import os.path

if len(sys.argv) < 1:
    sys.exit()

p = open("needed.txt", "a")
p.write(sys.argv[1] + '\n')
p.close()

print sys.argv[1]

results = "searchResults.txt"

time.sleep(0.07)

k = open(results, "r")
l = k.read().split("\n")
k.close()

for i in l:
    if i.startswith(sys.argv[1]):
        print i[len(sys.argv[1])+2:]
        sys.exit()
