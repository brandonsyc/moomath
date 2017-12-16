#!/bin/sh

# Setup asteroidresponder stuffs
python ../programs/0006/server/setup.py

# Convert nichodon.github.io links into moomath links (hopefully temporary)
python moomath_convert.py paginate.js frame.js sitemap.xml search.js other/0001/index.html programs/0001/index.html 404.html images/moo.js

# Restart Apache
apachectl restart
