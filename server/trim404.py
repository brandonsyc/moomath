# trim 404 page permalink for GitHub pages for server

path = "../404.html"
trimoff = 3

f = open(path, 'r')
g = '\n'.join(f.split('\n')[trimoff:])
f.close()

f = open(path, 'w')
f.write(g)
f.close()

print "Trimmed " + str(trimoff) + " lines off of top of 404.html"
