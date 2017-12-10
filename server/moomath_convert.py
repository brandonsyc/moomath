# Rather naive replacement tool so that moomath.com links go to moomath rather than nichodon.github.io

import sys
# Note that files are given as paths from top level directory in cmd line args

for w in xrange(1, len(sys.argv)):
    path = '../' + sys.argv[w]
    p = open(path, 'r')

    k = p.read()

    print "Replaced " + str(k.count('https://nichodon.github.io') + k.count('http://nichodon.github.io')) + " instances of nichodon.github.io in " + sys.argv[w] + ".\n"
    k = k.replace('https://nichodon.github.io', 'https://www.moomath.com').replace('http://nichodon.github.io', 'https://www.moomath.com') # Update if moomath becomes HTTPS

    p.close()
    p = open(path, 'w')

    p.write(k)
    p.close()
