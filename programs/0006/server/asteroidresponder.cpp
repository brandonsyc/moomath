//============================================================================
// Name        : asteroidresponder.cpp
// Author      : 
// Version     :
// Copyright   : Your copyright notice
// Description : Hello World in C++, Ansi-style
//============================================================================

#include <iostream>
#include <fstream>
#include <chrono>
#include <string>

using namespace std;
typedef std::chrono::high_resolution_clock Clock;

int main (int argc, char** argv) {
	cout.precision(7);

	streampos size;
	char * memblock;

	ifstream file ("astJ2000.bin", ios::in|ios::binary|ios::ate);
	if (file.is_open()) {
		size = file.tellg();
		memblock = new char[size];
		file.seekg(0, ios::beg);
		file.read(memblock, size);
		file.close();
	} else {
		cout << "Unable to open file";
	}

	int i = 0;
	int thisLength,queryPos,floatStart,charDiff;

	int charSize = (int)size;
	int querySize = (int)strlen(argv[1]);

	float output;

	int totalAsteroids = 0;
	int maxAsteroids = 50;

	if (argc > 2) {
		maxAsteroids = stoi(argv[2]);
	}

	auto t1 = Clock::now();
	while (i < charSize - 1) {
		thisLength = (int)memblock[i];
		queryPos = 0;

		for (int j = i + 1; j < i + thisLength + 1; j++) {
			if (memblock[j] == 32) continue;

			charDiff = argv[1][queryPos] - memblock[j];
			if (charDiff == 0 || charDiff == -32 || charDiff == 32) {
				queryPos += 1;
				if (queryPos == querySize) {
					for (int k = i + 1; k < i + thisLength + 1; k++) {
						cout << memblock[k];
					}
					cout << ',';

					floatStart = i + thisLength + 1;
					for (int p = 0; p < 7; p++) {
						*((unsigned char*)(&output)) = memblock[floatStart];
						*((unsigned char*)(&output) + 1) = memblock[floatStart+1];
						*((unsigned char*)(&output) + 2) = memblock[floatStart+2];
						*((unsigned char*)(&output) + 3) = memblock[floatStart+3];

						cout << output << (p == 6 ? ';' : ',');
						floatStart += 4;
					}

					totalAsteroids += 1;

					if (totalAsteroids == maxAsteroids) return 0;
					break;
				}
			} else {
				queryPos = 0;
			}
		}
		i += thisLength + 29;
	}

	auto t2 = Clock::now();
	/**std::cout << "\n$\nSearched through " <<
	              << std::chrono::duration_cast<std::chrono::nanoseconds>(t2 - t1).count()
	              << " nanoseconds" << std::endl;**/
}
