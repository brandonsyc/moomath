let loaded = 0;
let grass, planks, system, viewer;

GL.loadImage("../media/grass.png").then(data => grass = data);
GL.loadImage("../media/planks1.png").then(data => planks = data);

setTimeout(function() {
    system = new GL.TileSystem(100, 100);

    for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 100; j++) {
            system.addBackgroundTile(new GL.Tile((Math.random() < 0.5 ? grass : planks), i, j));
        }
    }

    viewer = new GL.TileSystemViewer(system);

    function drawLoop() {
        let xd = -+left+ +right;
        let yd = -+up+ +down;

        viewer.x += xd / 5;
        viewer.y += yd / 5;

        GL.clearCanvas();
        viewer.draw();
        requestAnimationFrame(drawLoop);
    }

    drawLoop();
}, 1000);

let left = right = up = down = false;

function updateArrows(press, evt) {
    switch (evt.key) {
        case "ArrowLeft":
            left = press;
            break;
        case "ArrowRight":
            right = press;
            break;
        case "ArrowUp":
            up = press;
            break;
        case "ArrowDown":
            down = press;
    }
}

document.addEventListener("keydown", evt => updateArrows(true, evt));

document.addEventListener("keyup", evt => updateArrows(false, evt));