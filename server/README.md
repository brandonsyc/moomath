# Server Files

If something needs to be compiled on the server, place it in build.sh. The git repository is checked every 5 seconds by the server computer, and if any changes are detected, all changes are downloaded, then build.sh is run. Note that build.sh is run with 

If you'd like to see the last time the website was updated (*not* the last time it was polled), go to [server/build.html](moomath.com/server/build.html), which contains the timestamp of the last time build.sh was run.

# Hardware Information

| Property | Value |
| --- | --- | --- |
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

Yes, I'm aware this isn't the best computer out there (quite an understatement), but it does the job *fine*.

# Installed Tools

* Clang (gcc, g++)
* Make
* CMake
* git (obviously)
* Python
* Node.js
* Ruby

Please request me (Timothy) if you need another tool or more information on specifics / how to use these tools through bash.
