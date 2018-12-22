var GL = {};
var DEBUG = true;

function select(arg1, ...args) {
    if (arg1 !== undefined)
        return arg1;
    return select(...args);
}

try {
    (function() {
        const GAME_CANVAS = document.getElementById("game-canvas");
        const CANVAS_CONTEXT = GAME_CANVAS.getContext('2d');

        GL.GAME_CANVAS = GAME_CANVAS;
        GL.CANVAS_CONTEXT = CANVAS_CONTEXT;

        function onResize() {
            if (DEBUG)
                console.log("resize");
            if (GAME_CANVAS.width !== window.innerWidth ||
                GAME_CANVAS.height !== window.innerHeight) { // so that it doesn't change the width and height unnecessarily, which is slow
                GAME_CANVAS.width = window.innerWidth;
                GAME_CANVAS.height = window.innerHeight;
            }
        }

        onResize();
        document.addEventListener("resize", onResize);

        var imageConverterConvas = document.createElement('canvas');
        var imageConverterContext = imageConverterConvas.getContext('2d');

        function loadImage(url) {
            // Returns a promise containing the image data

            return new Promise((resolve, reject) => {
                let image = new Image();
                image.setAttribute("crossOrigin", "anonymous");

                image.onload = () => resolve(image);

                image.onerror = reject;
                image.src = url;
            });
        }

        GL.loadImage = loadImage;

        function drawImage(image, opts = {}) {
            let ctx = CANVAS_CONTEXT;

            let [offset_x, offset_y] = [select(opts.x, 0), select(opts.y, 0)];
            let [scale_x, scale_y] = [select(opts.scale_x, 1), select(opts.scale_y, 1)];
            let opacity = select(opts.opacity, 1);

            if (opacity !== 1) {
                ctx.save(); // save state before
                ctx.globalAlpha = opacity;
            }

            /*ctx.drawImage(image,
                0, 0,
                image.width, image.height,
                offset_x, offset_y,
                scale_x * image.width, scale_y * image.height);*/

            if (opacity !== 1) {
                ctx.restore(); // restore previous state, now that image is drawn
            }
        }

        GL.drawImage = drawImage;

        function clearCanvas() {
            CANVAS_CONTEXT.clearRect(0, 0, GAME_CANVAS.width, GAME_CANVAS.height);
        }

        GL.clearCanvas = clearCanvas;

        let Tiles = {};
        GL.Tiles = Tiles;

        function loadTile(img, name) {
            return new Promise((resolve, reject) => {

            })
        }
        GL.loadTile = loadTile;

        class Tile {
            constructor(image, x=0, y=0, z=0, opts = {}) {
                this.image = image;
                this.x = x;
                this.y = y;
                this.z = z;

                this.width = select(opts.width, 1);
                this.height = select(opts.height, 1);
            }

            get x1() {
                return this.x;
            }

            get x2() {
                return this.x + this.width;
            }

            get y1() {
                return this.y;
            }

            get y2() {
                return this.y + this.height;
            }
        }

        Array.prototype.removeIf = function(callback) {
            var i = this.length;
            while (i--) {
                if (callback(this[i], i)) {
                    this.splice(i, 1);
                }
            }
        };

        class TileSystem {
            constructor(width = 20, height = 20) {
                this.background = [...Array(width * height).keys()].map(() => []);
                this.specials = [];

                this._width = width;
                this._height = height;
            }

            get width() {
                return this._width;
            }

            get height() {
                return this._height;
            }

            getBackgroundTiles(x, y) {
                if (x % 1 !== 0 || y % 1 !== 0 || x < 0 || y < 0 || x >= this.width || y >= this.height)
                    throw new Error("Out of bounds.");
                return this.background[this.width * y + x];
            }

            addBackgroundTile(tile, id="") {
                let x = tile.x;
                let y = tile.y;
                tile.id = id;

                this.getBackgroundTiles(x, y).push(tile);
            }

            removeBackgroundTile(id) {
                for (let x = 0; x < this.width; x++) {
                    for (let y = 0; y < this.height; y++) {
                        this.getBackgroundTiles(x, y).removeIf(tile => tile.id === id);
                    }
                }
            }

            addSpecial(tile, id) {
                this.removeSpecial(id);

                tile.id = id;
                this.specials.push(tile);
            }

            removeSpecial(id) {
                this.specials.removeIf(tile => tile.id === id);
            }
        }

        function intersectRect(a1, b1, a2, b2, x1, y1, x2, y2) {
            return !(x1 > a2 || x2 < a1 || y1 > b2 || y2 < b1);
        }

        class TileSystemViewer {
            constructor(tile_system) {
                this.system = tile_system;

                this.x = 0;
                this.y = 0;
                this.width = 20;
            }

            draw() {
                let a1 = this.x;
                let b1 = this.y;
                let a2 = this.x + this.width;
                let b2 = this.y + this.width * GAME_CANVAS.height / GAME_CANVAS.width;

                let system = this.system;
                let specials = system.specials;

                let scale_c = GAME_CANVAS.width / this.width;
                let tiles_to_draw = [];

                for (let i = 0; i < system.specials.length; i++) {
                    let t = system.specials[i];
                    let x1 = t.x1, x2 = t.x2, y1 = t.y1, y2 = t.y2;

                    if (intersectRect(a1, b1, a2, b2, x1, y1, x2, y2)) {
                        tiles_to_draw.push([t.image, {x: (x1 - a1) * scale_c, y: (y1 - b1) * scale_c,
                            scale_x: scale_c / 16, scale_y: scale_c / 16}, t.z]);
                    }
                }

                for (let x = Math.max(0, Math.floor(a1)); x < Math.min(Math.ceil(a2), system.width); x++) {
                    for (let y = Math.max(0, Math.floor(b1)); y < Math.min(Math.ceil(b2), system.height); y++) {
                        let background_tiles = system.getBackgroundTiles(x, y);
                        if (background_tiles.length > 0) {
                            background_tiles.forEach(t => tiles_to_draw.push([t.image, {x: (t.x1 - a1) * scale_c, y: (t.y1 - b1) * scale_c,
                                scale_x: scale_c / 16, scale_y: scale_c / 16}, t.z]));
                        }
                    }
                }

                tiles_to_draw.sort((a, b) => (b[2] - a[2])); // sort by z values
                tiles_to_draw.forEach(args => drawImage(...args));
            }
        }

        GL.Tile = Tile;
        GL.TileSystem = TileSystem;
        GL.TileSystemViewer = TileSystemViewer;
    })();
} catch (error) {
    // Browser too old or other error in IIFE
    document.body.innerHTML = "<p>Your browser is too old or an unknown error occurred.</p>\n" + "Trace: " + error.toString();
}

