#!/bin/bash

# Kill any old asteroidresponder instances
pkill -f astSearch-qi4PFgOgvR

# Compile asteroidresponder
g++ -o ../programs/0006/server/astSearch-qi4PFgOgvR ../programs/0006/server/asteroidresponder.cpp -Ofast -march=native -std=c++11

# Run asteroidresponder
../programs/0006/server/astSearch-qi4PFgOgvR &

# Convert nichodon.github.io links into moomath links (hopefully temporary)
python moomath_convert.py paginate.js frame.js sitemap.xml search.js other/0001/index.html programs/0001/index.html 404.html images/moo.js

# Restart Apache
apachectl restart
