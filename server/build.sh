#!/bin/bash

# Compile asteroidresponder
g++ -o ../programs/0006/server/astSearch ../programs/0006/server/asteroidresponder.cpp -O3 -std=c++11

$formatted_time date

echo "<html><body style='white-space: pre-wrap'>Build completed at " + $formatted_time + ".</body></html>" > build.html

# Restart Apache
apachectl restart
