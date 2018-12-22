var atoms = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og'];
//im such a huge hypocrite.

class Isotope {
    constructor(a, z) {
        this.az = [a, z];
    }
    
    //alpha
    a(n) { return add(-4, -2, n); }
    
    //proton emmision
    p(n) { return add(-1, -1, n); }
    
    //neutron emmision
    n(n) { return add(-1, 0, n); }
    
    //electron capture
    //beta+
    //positron emmision
    e(n) { return add(0, -1, n); }
    
    //beta-
    b(n) { return add(0, 1, n); }
    
    //cluster decay
    add(a, z, n) {
        return [this.az[0] + a * n, this.az[1] + z * n];
    }
}

/*let svg = document.createElement('svg');
document.body.appendChild(svg);*/

let base = new Isotope(1, 1);

function echange(x) {
    let index = atoms.indexOf(x.value);
    let zment = x.parentElement.children[0].children[1];
    if (index === -1) {
        x.style.color = x.value === '' ? '#fff' : "#ccc";
        zment.value = '';
        x.parentElement.children[0].children[0].style.color = "#fff";
        return;
    }
    x.style.color = "#fff";
    console.log(atoms.indexOf(x.value));
    zment.value = atoms.indexOf(x.value) + 1;
    zment.style.color = "#fff";
    
    update(-1, index, x.parentElement);
}

function zchange(x) {
    let ement = x.parentElement.parentElement.children[1];
    if (x.value > 118 || x.value < 1 || isNaN(x.value)) {
        x.style.color = x.value === '' ? '#fff' : "#ccc";
        ement.value = '';
        x.parentElement.children[0].style.color = "#fff";
        return;
    }
    x.style.color = "#fff";
    let atom = atoms[parseInt(x.value) - 1];
    ement.value = atom;
    ement.style.color = "#fff";
    
    update(-1, parseInt(x.value), x.parentElement.parentElement);
}

function acheck(x) {
    console.log(x.children[1].value);
    if (parseInt(base.az[0]) < parseInt(base.az[1]) || isNaN(base.az[0])) {
        x.children[0].children[0].style.color = "#ccc";
        return;
    }
    x.children[0].children[0].style.color = "#fff";
}

function achange(x) {
    let zment = x.parentElement.children[1];
    if (parseInt(x.value) < parseInt(zment.value) || isNaN(x.value)) {
        x.style.color = x.value === '' ? '#fff' : "#ccc";
        return;
    }
    x.style.color = "#fff";
    
    update(parseInt(x.value), -1, x.parentElement.parentElement);
}

function update(x, y, p) {
    base = new Isotope(x === -1 ? base.az[0] : x, y === -1 ? base.az[1] : y);
    console.log(base);
    acheck(p);
}