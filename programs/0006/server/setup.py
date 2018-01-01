import os
dir_path = os.path.dirname(os.path.realpath(__file__)) + os.sep

asteroid_responder = dir_path + "asteroidresponder.cpp"
f = open(asteroid_responder, "r")
g = f.read().replace("/* __FILE__REPLACE__ */", '"%s"; //' % dir_path)

print "Replaced __FILE__REPLACE__ with " + dir_path + " in asteroidresponder.cpp."
f.close()

f = open(asteroid_responder, "w")
f.write(g)
f.close()

os.system("pkill -f astSearch-qi4PFgOgvR")
os.system("g++ -o %sastSearch-qi4PFgOgvR %sasteroidresponder.cpp -O3 -march=native -std=c++11" % (dir_path, dir_path))

try:
    p = int(os.popen("""if pgrep -x \"astSearch-qi4PFgOgvR\" > /dev/null
then
    echo "0"
else
    echo "1"
fi""").read())
    if p:
        os.system("sh %ssetupSearch.sh" % dir_path)
except OSError:
    print "Error in os.system call"
    sys.exit()
