#!/bin/bash

# Periodically polls the repository for changes
while :
do
  git fetch > build_log.txt 2>&1
  if [ -s build_log.txt ]
  then
     echo "Changes detected, pulling... (overwriting all local changes)"
     git fetch --all
     git reset --hard origin/master
     sh ./build.sh
     echo "Build complete."
  fi
  sleep 5
done
