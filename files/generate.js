const atoms = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og'];
const gaps = [Array.from(new Array(17), (x,i) => i + 1),
              Array.from(new Array(11), (x,i) => i + 2),
              Array.from(new Array(11), (x,i) => i + 2),
              [3], [3], [3], [3],
              Array.from(new Array(19), (x,i) => i),
              [0, 1, 2, 3, 18], [0, 1, 2, 3, 18]];

console.log(gaps);

const svgns = "http://www.w3.org/2000/svg";
let n = 0;
for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 19; j++) {
        if (gaps[i].indexOf(j) < 0) {
            let rect = document.createElementNS(svgns, 'rect');
            rect.setAttributeNS(null, 'x', j * 100);
            rect.setAttributeNS(null, 'y', i * 100);
            rect.setAttributeNS(null, 'height', 100);
            rect.setAttributeNS(null, 'width', 100);
            let color = 0x000000;
            if (i === 6 && j > 8 && j !== 12) {
                color = 0x607d8b;
            } else if (j === 0 && i > 0) {
                color = 0xf44336;
            } else if (j === 1) {
                color = 0xff9800;
            } else if (i === 8 || (j === 2 && i === 5)) {
                color = 0xffeb3b;
            } else if (i === 9 || (j === 2 && i === 6)) {
                color = 0xcddc39;
            } else if (j < 12 && j > 1) {
                color = 0x4caf50;
            } else if (j === 18) {
                color = 0x9c27b0;
            } else if (j - i > 12 || (j === 0 && i === 0)) {
                color = 0x3f51b5;
            } else if (j - i > 11 || (j === 14 && i === 3) || (j === 15 && i === 4)) {
                color = 0x2196f3;
            } else {
                color = 0x00bcd4;
            }
            rect.setAttributeNS(null, 'fill', '#' + color.toString(16).padStart(6, '0'));
            document.getElementById('table').appendChild(rect);
            
            let text = document.createElementNS(svgns, 'text');
            text.setAttributeNS(null, 'x', j * 100 + 50);
            text.setAttributeNS(null, 'y', i * 100 + 50);
            text.setAttributeNS(null, 'alignment-baseline', 'middle');
            text.setAttributeNS(null, 'text-anchor', 'middle');
            text.textContent = atoms[n];
            document.getElementById('table').appendChild(text);
            
            if (j === 2 && (i === 5 || i === 6)) {
                n += 15;
            } else if (j === 17 && i === 8) {
                n = 89;
            } else if (n === 117) {
                n = 57;
            } else {
                n++;
            }
        }
    }
}