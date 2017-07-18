import telnetlib,sys,time,datetime

import os
os.system('cls' if os.name == 'nt' else 'clear')

print("Logging into horizons.jpl.nasa.gov:6775...")
try:
    horizons = telnetlib.Telnet("horizons.jpl.nasa.gov",6775)
except:
    print("An unknown error occurred while connecting.")
    sys.exit(-1)
    
def write(text):
    horizons.write(bytes(text, encoding="ascii"))

def read_until(text):
    return horizons.read_until(bytes(text,encoding="ascii"))

print("Provide updates? (Y if yes, N if no)")
updates = input("> ")

updates = (updates.upper() == "Y")

read_until('Horizons> ')

objs = ["Mercury","Venus","Earth","Moon","Mars","Jupiter", "Saturn", "Uranus", "Neptune", "Ganymede",
        "Callisto","Io","Europa","Pluto","Titan","Titania","Ceres","Triton","Iapetus","Tethys","Dione"]
objids = [199, 299, 399, 301, 499, 599, 699, 799, 899, 503,
          504, 501, 502, 999, 606, 703, 2000001, 801, 608, 603, 604]

isfirstrun = True

currenttime = time.strftime("%Y-%B-%d %H:%M")
if updates:
    print("\nCurrent Ephemeris Time: " + currenttime + ".\n")

command = "var bodyPositions = {\n"

for i,obj in enumerate(objs):
    if updates:
        print("Collecting data for " + obj + "...")
    
    write(str(objids[i])+'\n')
    
    read_until('<cr>: ')
    write('E\n')
    
    read_until(' : ')
    write('v\n')
    
    read_until(' : ')
    write('@sun\n' if isfirstrun else 'y\n')
    
    read_until(' : ')
    write('eclip\n')
    
    read_until(' : ')
    write(currenttime + '\n')
    
    read_until(' : ')
    write('\n')
    
    read_until(' : ')
    write('14d\n')
    
    read_until(' : ')
    write('y\n')
    
    read_until('$$SOE')
    contents = read_until('$$EOE')
    
    read_until('[R]edisplay, ? : ')
    write('N\n')
    read_until('Horizons> ')
    
    coords = [(k+" " if k != '' else '') for k in (contents.split('\n')[2]
                                                           .replace('Y',"")
                                                           .replace('X',"")
                                                           .replace('Z',"")
                                                           .replace('=',""))
                      .split(' ')]
    newcoords = []
    
    for coord in coords:
        if (coord != ''):
            newcoords.append(str(float(coord.replace(' ','').replace('\r','')) * 100 * 1.496e9))

    newcoords[1],newcoords[2] = newcoords[2],newcoords[1]

    if updates:
        print("Collected data for " + obj + ". (%s%% done)\n" \
              % (round(100 * i/float(len(objs)),3)))

    command = '\t' + command + obj + ":[" + ','.join(newcoords) + '],\n'
    
    isfirstrun = False

horizons.close()

command = 'v' + command[:-2] + "};"

print("Completed query of " + str(len(objs)) + " bodies! Paste the following into the JS:\n\n")

print(command)

print("\n")
sys.exit(0)
