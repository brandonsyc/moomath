from Tkinter import *
import tkFileDialog

big = [':par:', ':raw:', ':code:', ':table:']
btag = [['<p>', '\t', '</p>'], ['<script>', '\t', '</script>'],
        ['<div class="code">\n\t<code class="prettyprint">', '\t\t',
         '\t</code>\n</div>'],
        ['<div class="code">\n<table>', '\t<tr>', '</table>\n</div>']]

small = [':wid:', ':fig:']

tk = Tk()

f = tkFileDialog.askopenfilename()
print f

lines = []

mode = -1
name = ''
white = 0
no = []
yes = []

with open(f, 'r') as g:
    lines = g.readlines()

for i in range(len(lines)):
    if mode == -1 and lines[i].strip() == '' and lines[i - 1].strip() == '':
        no.append(i)
    elif lines[i].split(' ')[0] in small:
        if lines[i - 1].strip() != '':
            yes.append(i)
        thing = lines[i].split(' ')[0]
        if small.index(thing) == 0:
            name = lines[i].split(' ')[1].strip()
            lines[i] = ''
            no.append(i)
        else:
            lines[i] = '<div class="figure">\n\t<figure>\n\t\t<img src=' + \
                       lines[i].split('::')[1].strip() + '" alt="' + \
                       lines[i].split('::')[0].split(' ')[1] + \
                       '">\n\t\t<figcaption>' + \
                       lines[i].split('::')[0].split(' ')[1] + \
                       '</figcaption>\n\t</figure>\n</div>\n'       
    elif mode > -1:
        if lines[i].strip() == '':
            no.append(i)
        elif lines[i].strip() == '::':
            lines[i] = btag[mode][2] + '\n'
            mode = -1
        elif mode == 3:
            out = '\t<tr>\n'
            for e in lines[i].split('::'):
                out += '\t\t<td>' + e.strip() + '</td>\n'
            lines[i] = out + '\t</tr>\n'
        else:
            lines[i] = btag[mode][1] + lines[i]
    elif mode == -1 and lines[i].strip() in big:
        if lines[i - 1].strip() != '':
            yes.append(i)
        mode = big.index(lines[i].strip())
        if mode == 1 and name != '':
            lines[i] = '<script src="' + name + '">\n'
            name = ''
        else:
            lines[i] = btag[mode][0] + '\n'

no.reverse()
yes.reverse()

for thing in no:
    lines.pop(thing)
    for j in range(len(yes)):
        if yes[j] > thing:
            yes[j] -= 1
    
for thing in yes:
    lines.insert(thing, '\n')

for line in lines:
    print line[:-1]

mainloop()
