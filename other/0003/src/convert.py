polys = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []}

cube_count = 0

with open('output.txt') as f:
    while True:
        c = f.read(1)
        if not c: # End of file
            break
        if (c == 'C'): # Start of new poly set
            cube_count += 1
        if (c == 'P'): # Start of new polyomino
            h = []
            for i in xrange(cube_count):
                g = [0,0,0]

                f.read(1)
                g[0] = int(f.read(1))
                f.read(1)
                g[1] = int(f.read(1))
                f.read(1)
                g[2] = int(f.read(1))

                h.append(g)
            polys[cube_count].append(h)

with open('c.js', 'a') as f:
    f.write("var CUBES={")
    for key in polys.keys():
        f.write('%s:' % key)
        f.write('new Uint8Array([%s]),\n' % str(polys[key]).replace(' ','').replace('[','').replace(']',''))
    f.write("10:null};")
