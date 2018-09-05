let request = require('request')

let data = {};
let aliases = {};

function format(x) {
    let out = x.split('&amp;').join('')
    out = out.split('nbsp;').join(' ')
    out = out.split('lt;').join('<')
    out = out.split('gt;').join('>')
    return out
}

request('https://en.wikipedia.org/wiki/Module:Convert/data', function(error, response) {
    let body = response.body.split('---------------------------------------------------------------------------')[2]
    body = body.split('\t').join('')
    body = body.split('&quot;').join('"')
    let units = body.split('\n    },\n')
    units.forEach(element => {
        let lines = element.split('\n')
        let initial = lines[0].split('"')[1]
        let values = {}
        lines.forEach(line => {
            if (line.includes('name1 ')) {
                values['name1'] = line.split('"')[1]
            } else if (line.includes('name1_us ')) {
                values['name1_us'] = line.split('"')[1]
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
        }
    })
    console.log(data)
})