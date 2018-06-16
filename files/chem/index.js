let props = {
    'P816': 'Daughter',
    'P1086': 'Protons',
    'P1122': 'Spin',
    'P1123': 'Parity',
    'P1148': 'Neutrons',
    'P2067': 'Mass',
    'P2114': 'Half-Life',
    'P2374': 'Abundance'
}

let all = ['P1086', 'P1148', 'P2067']
let query = 'Q556'
let data = {}

const request = require('request')
const fs = require('fs')

request('https://query.wikidata.org/sparql?query=SELECT%20%3Fa%20WHERE%20%7B%20%3Fa%20wdt%3AP279%20wd%3A' + query + '.%20%7D&format=json', function(error, response) {
    let json = JSON.parse(response.body)
    for (let i = 0; i < json['results']['bindings'].length; i++) {
        
        let url = json['results']['bindings'][i]['a']['value']
        request(url, function(error, response) {
            let nested = JSON.parse(response.body)
            let wiki = nested['entities'][url.split('/')[4]]['claims']
            let keys = Object.keys(props)
            let inside = {}
            let valid = true
            for (let j = 0; j < keys.length; j++) {
                if (wiki[keys[j]] === undefined) {
                    if (all.indexOf(keys[j]) >= 0) {
                        valid = false
                        break
                    }
                } else {
                    if (wiki[keys[j]][0]['mainsnak']['datavalue'] === undefined) {
                        inside[props[keys[j]]] = ''
                    } else {
                        let value = wiki[keys[j]][0]['mainsnak']['datavalue']['value']
                        inside[props[keys[j]]] = value['id'] || value['amount']
                        if (keys[j] == 'P2114') {
                            inside['HLU'] = value['unit']
                            let u2 = value['unit']
                            request(u2, function(e2, r2) {
                                let n2 = JSON.parse(r2.body)
                            })
                        }
                    }
                }
            }
            if (valid) {
                edit(nested['entities'][url.split('/')[4]]['labels']['en']['value'], inside)
            }
        })
    }
})

function edit(k, v) {
    data[k] = v

    let jjjj = JSON.parse(JSON.stringify(data))
    fs.writeFile("test.json", JSON.stringify(jjjj, null, '\t'), function(err) {})
}