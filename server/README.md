# Server Files

If something needs to be compiled on the server, place it in build.sh. The git repository is checked every 5 seconds by the server computer, and if any changes are detected, all changes are downloaded, then build.sh is run. Note that build.sh is run with root privileges; be careful!

If you'd like to see the last time the website was updated (*not* the last time it was polled), go to [server/build.html](https://moomath.com/server/build.html), which contains the timestamp of the last time build.sh was run.

Do not run this file if you are contributing to the repository or really, ever unless you really know exactly what is going on with the server! It will mess things up.

## Hardware Information

| Property | Value |
| --- | --- |
| Device Type | Mac mini (Late 2014) |
| Processor | 2.6 GHz Intel Core i5 |
| Memory | 8 GB 1600 MHz DDR3 |
| Graphics Card | Intel Iris 1536 MB |
| Storage | 1 TB Apple HDD |
| Processors | 1 |
| Cores | 2 (dual-core) |
| Average Ping | 44 ms |
| Average Download | 240 Mbps |
| Average Upload | 12 Mbps |

Not the best computer of course but fine for our purposes.

## Installed Tools

* git (duh)
* Clang (gcc, g++)
* Make
* CMake
* Python
* Node.js
* Ruby

Contact us if you need another tool or more information on specifics / how to use these tools through bash.
