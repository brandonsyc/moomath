import sys,time
import os

p = None

try:
    p = int(os.system("""if pgrep -x \"astSearch-qi4PFgOgvR\" > /dev/null
then
    echo "0"
else
    echo "1"
fi"""))
    if not p:
        os.system("sh setupSearch.sh")
        time.sleep(0.2)
except:
    print "Error in os.system call"
    sys.exit()


if len(sys.argv) < 1:
    sys.exit()

p = open("needed.txt", "a")
p.write(sys.argv[1] + '\n')
p.close()

results = "searchResults.txt"

time.sleep(0.1)

k = open(results, "r")
l = k.read().split("\n")
k.close()

for i in l:
    if i.startswith(sys.argv[1]):
        print i[len(sys.argv[1])+2:]
        sys.exit()
