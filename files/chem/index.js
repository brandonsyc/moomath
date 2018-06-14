let query = 'Q556'

const fs = require('fs')

let thing

fs.readFile("props.json", function(e, data) {
  thing = JSON.parse(data)
})

const request = require('request')

request('https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + query + '&format=json', function(e, response) {
  let json = JSON.parse(response.body)
  let keys = Object.keys(thing)
  for (let i = 0; i < keys.length; i++) {
    let prop = json['entities'][query]['claims'][keys[i]]
    if (prop === undefined) {
      console.log('undef')
    } else {
      console.log(json['entities'][query]['claims'][keys[i]][0]['mainsnak']['datavalue']['value']['amount'])
    }
  }
})


request('https://query.wikidata.org/sparql?query=SELECT%20%3Fsub%20WHERE%20%7B%0A%20%20%3Fsub%20wdt%3AP279%20wd%3A' + query + '.%0A%7D&format=json', function(e, response) {
  let json = JSON.parse(response.body)
  console.log(json['results']['bindings'][0]['sub']['value'])
})