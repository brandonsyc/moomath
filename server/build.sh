#!/bin/bash

# Compile asteroidresponder
g++ -o ../programs/0006/server/astSearch ../programs/0006/server/asteroidresponder.cpp -O3 -std=c++11

# Convert nichodon.github.io links into moomath links (hopefully temporary)
python moomath_convert.py paginate.js frame.js sitemap.xml search.js other/0001/index.html programs/0001/index.html 404.html

# Convert 404.html
python trim404.py

# Restart Apache
apachectl restart
