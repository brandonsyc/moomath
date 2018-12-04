class Wall {
    constructor(x1, y1, x2, y2, c) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.c = c;
    }
    
    draw() {
        ctx.fillStyle = this.c;
        ctx.fillRect(pos.x - this.x1, pos.y - this.y1, this.x2 - this.x1, this.y2 - this.y1);
    }
}

let pos = {x: 0, y: 0};
let vel = {x: 0, y: 0};

let canvas = document.createElement('canvas');
document.body.appendChild(canvas);

canvas.width = document.body.clientWidth * 2;
canvas.height = document.body.clientHeight * 2;

let ctx = canvas.getContext('2d');

let pressed = {};

let test = new Wall(0, 0, 100, 100, '#111');

function move() {
    if (pressed.w) {
        vel.y += 1;
    } 
    if (pressed.a) {
        vel.x += 1;
    } 
    if (pressed.s) {
        vel.y -= 1;
    } 
    if (pressed.d) {
        vel.x -= 1;
    }
    
    vel.x *= 0.9;
    vel.y *= 0.9;
    
    pos.x += vel.x;
    pos.y += vel.y;
}

function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    ctx.fillStyle = "#321";
    ctx.arc(canvas.width / 2 - 25, canvas.height / 2 - 25, 50, 0, 2 * Math.PI);
    ctx.fill();
    
    
    move();
    
    test.draw();
    
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);


document.addEventListener('keydown', (event) => {
    pressed[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    pressed[event.key] = false;
});