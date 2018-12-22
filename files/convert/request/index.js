const request = require('request')
const fs = require('fs')

let data = {};
let aliases = {};
let duplicates = {};

function format(x) {
    let out = x
    out = out.split("''").join('')
    out = out.split('&amp;nbsp;').join('\u00A0')
    out = out.split('&amp;thinsp;').join('\u2009')
    out = out.split('&amp;#8209;').join('\u2011')
    out = out.split('&lt;').join('<')
    out = out.split('&gt;').join('>')
    return out
}

request('https://en.wikipedia.org/wiki/Module:Convert/data', function(error, response) {
    console.log('Got response.')
    let body = response.body.split('---------------------------------------------------------------------------')[2]
    body = body.split('\t').join('')
    body = body.split('&quot;').join('"')
    let units = body.split('\n    },\n')
    units.forEach(element => {
        let lines = element.split('\n')
        let initial = lines[0].split('"')[1]
        if (!initial) {
            return
        }
        let values = {}
        lines.forEach(line => {
            if (line.includes('name1 ')) {
                values['name1'] = line.split('"')[1]
            } else if (line.includes('name1_us ')) {
                values['name1_us'] = line.split('"')[1]
            }  else if (line.includes('name2 ')) {
                values['name2'] = line.split('"')[1]
            }  else if (line.includes('name2_us ')) {
                values['name2_us'] = line.split('"')[1]
            } else if (line.includes('scale ')) {
                values['scale'] = line.split('= ')[1].split(',')[0]
            } else if (line.includes('target ')) {
                values['target'] = line.split('"')[1]
            } else if (line.includes('utype ')) {
                values['utype'] = line.split('"')[1]
            } else if (line.includes('symbol')) {
                values['symbol'] = line.split('"')[1]
            }
        })
        let name = values['name1'] || values['name1_us'] || initial
        if (values['utype']) {
            if (!duplicates[values['utype']]) {
                duplicates[values['utype']] = {
                    (String)(values['scale']): format(name)
                }
            } else if (duplicates[values['scale']]) {

            }
        }
        if (!values['scale']) {
            if (values['target']) {
                aliases[format(name)] = values['target']
            }
        } else {
            if (!data[values['utype']]) {
                data[values['utype']] = {}
            }
            data[values['utype']][format(name)] = {
                'scale': values['scale'],
                'symbol': format(values['symbol'] || initial)
            }
            if (initial !== name) {
                aliases[initial] = format(name)
            }
            if (values['name1_us'] && values['name1_us'] !== name) {
                aliases[format(values['name1_us'])] = format(name)
            }
            if (values['name2']) {
                aliases[format(values['name2'])] = format(name)
            }
            if (values['name2_us']) {
                aliases[format(values['name2_us'])] = format(name)
            }
        }
    })
    //console.log(data)
    fs.writeFile('data.json', JSON.stringify({
        'units': data,
        'aliases': aliases
    }, null, '\t'), function(err) {})
    console.log('Saved data.')
})