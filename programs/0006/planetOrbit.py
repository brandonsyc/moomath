import time,math

a0 = 1.00000261
adot = 0.00000562
e0 = 0.01671123
edot = -0.00004392
I0 = -0.00001531
Idot = -0.00001531
L0 = 100.46457166
Ldot = 35999.37244981
little0 = 102.93768193
littledot = 0.32327364
big0 = 0
bigdot = 0

T_eph = time.time()

tSecsFromJ2000 = T_eph - 2451545
tCenturiesFromJ2000 = tSecsFromJ2000 / (60*60*24*365.25*100);

print tCenturiesFromJ2000

a = a0 + adot * tCenturiesFromJ2000
e = e0 + edot * tCenturiesFromJ2000
I = I0 + Idot * tCenturiesFromJ2000
L = (L0 + Ldot * tCenturiesFromJ2000 + 180) % 360 - 180
little = little0 + littledot * tCenturiesFromJ2000
big = big0 + bigdot * tCenturiesFromJ2000

print (a,e,I,L,little,big)

M = L - little
w = little - big

E = M

while True:
    dE = (E - e * math.sin(math.radians(E)) - M) / (1 - e * math.cos(math.radians(E)));
    E -= dE
    if (abs(dE) < 0.000001):
        break

P = a * (math.cos(math.radians(E)) - e)
Q = a * math.sin(math.radians(E)) * math.sqrt(1-e*e)

x = math.cos(math.radians(w)) * P - math.sin(math.radians(w)) * Q
y = math.sin(math.radians(w)) * P + math.cos(math.radians(w)) * Q

z = math.sin(math.radians(I)) * x

xT = math.cos(math.radians(I * x))
x = math.cos(math.radians(w)) * xT - math.sin(math.radians(w)) * y
y = math.sin(math.radians(w)) * xT + math.cos(math.radians(w)) * y

print (x,z,y)


    
