#include <chrono>
#include <cstdio>
#include <fstream>
#include <iostream>
#include <string>
#include <sys/stat.h>
#include <thread>
#include <unistd.h>
#include <vector>

#define DEBUG false
typedef std::chrono::high_resolution_clock Clock;

inline bool exists(const std::string &name) {
  struct stat buffer;
  return (stat(name.c_str(), &buffer) == 0);
}

int main(int argc, char **argv) {
  std::streampos size;
  char *memblock;

  #if defined(WIN32) || defined(_WIN32) || defined(__WIN32) && !defined(__CYGWIN__)
  static const char slash = '\\';
  #else
  static const char slash = '/';
  #endif

  std::string file_path = __FILE__;
  std::string dir_path = /* __FILE__REPLACE__ */ file_path.substr(0, file_path.rfind(slash));

  std::ifstream file(dir_path + "astJ2000.bin",
                     std::ios::in | std::ios::binary | std::ios::ate);
  if (file.is_open()) {
    size = file.tellg();
    memblock = new char[size];
    file.seekg(0, std::ios::beg);
    file.read(memblock, size);
    file.close();
  } else {
    std::cout << "Unable to open file";
  }

  const std::string queryPath = dir_path + "needed.txt";
	const std::string outputPath = dir_path + "searchResults.txt";

  std::remove(queryPath.c_str());
  std::remove(outputPath.c_str());

  while (true) {
    if (exists(queryPath.c_str())) {
      std::ifstream searches;
      searches.open(queryPath);

      std::string line;
      std::vector<std::string> queries;
      while (std::getline(searches, line)) {
        queries.push_back(line);
      }

      if (queries.size() == 0) continue;

      searches.close();

      std::remove(queryPath.c_str());
			std::remove(outputPath.c_str());

      std::ofstream searchResults;
      searchResults.open(outputPath);
      searchResults.precision(7);

      for (std::string query : queries) {
        searchResults << query << ": ";

        int totalAsteroids = 0;
        int maxAsteroids = 50;

        int i = 0;
        int thisLength, queryPos, floatStart, charDiff;

        int charSize = (int)size;
        int querySize = (int)query.length();

        float output;

        auto t1 = Clock::now();

        while (i < charSize - 1) {
          thisLength = (int)memblock[i];
          queryPos = 0;

          for (int j = i + 1; j < i + thisLength + 1; j++) {
            if (memblock[j] == 32)
              continue;

            charDiff = query[queryPos] - memblock[j];
            if (charDiff == 0 || charDiff == -32 || charDiff == 32) {
              queryPos += 1;
              if (queryPos == querySize) {
                for (int k = i + 1; k < i + thisLength + 1; k++) {
                  searchResults << memblock[k];
                }
                searchResults << ',';

                floatStart = i + thisLength + 1;
                for (int p = 0; p < 7; p++) {
                  *((unsigned char *)(&output)) = memblock[floatStart];
                  *((unsigned char *)(&output) + 1) = memblock[floatStart + 1];
                  *((unsigned char *)(&output) + 2) = memblock[floatStart + 2];
                  *((unsigned char *)(&output) + 3) = memblock[floatStart + 3];

                  searchResults << output << (p == 6 ? ';' : ',');
                  floatStart += 4;
                }

                totalAsteroids += 1;

                if (totalAsteroids == maxAsteroids) break;
              }
            } else {
              queryPos = 0;
            }
          }
          i += thisLength + 29;
        }

        auto t2 = Clock::now();
        if (DEBUG)
          std::cout << "\nSearched through "
                    << std::chrono::duration_cast<std::chrono::nanoseconds>(t2 -
                                                                            t1)
                           .count()
                    << " nanoseconds" << std::endl;
        searchResults << "\n";
      }

      searchResults.close();
    }
    std::this_thread::sleep_for(std::chrono::milliseconds(45));
  }
}
