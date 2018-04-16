(function() {
    var vf = new Vex.Flow.Factory({renderer: {elementId: 'a_major_scale_staff'}});
    var score = vf.EasyScore();
    var system = vf.System();

    function drawOutput(ctx, canvas) {
        TONES.updateAnalyzer();


        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var sliceWidth = canvas.width * 1.0 / TONES.bufferLength;
        var x = 0;

        ctx.beginPath();

        for (var i = 0; i < TONES.bufferLength; i++) {

            var v = TONES.dataArray[i] / 128.0;
            var y = v * canvas.height / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height/2);
        ctx.stroke();
    }

    var canvToDraw = null;
    var ctxToDraw = null;
    var shouldDraw = false;

    function repeatedlyDrawOut(ctx, canvas) {
        ctxToDraw = ctx;
        canvToDraw = canvas;

        shouldDraw = true;
        _drawOutF();
    }

    function _drawOutF() {
        if (shouldDraw) {
            drawOutput(ctxToDraw, canvToDraw);
            requestAnimationFrame(_drawOutF);
        }
    }

    function stopDraw() {
        shouldDraw = false;
    }

    aMajor = score.notes('A4/4, B4/4, C#5/4, D5/4, E5/4, F#5/4, G#5/4, A5/4');
    aMajorVoice = score.voice(aMajor, {time: "8/4"});
    aMajorStave = {
        voices: [
            aMajorVoice
        ]
    };

    system.addStave(aMajorStave).addClef('treble');

    vf.draw();

    var scale = [TONES.notes.A4,
        TONES.notes.B4,
        TONES.notes.Db5,
        TONES.notes.D5,
        TONES.notes.E5,
        TONES.notes.Gb5,
        TONES.notes.Ab5,
        TONES.notes.A5];

    var canvasAmajor = document.getElementById("waveform_a");
    canvasAmajorCtx = canvasAmajor.getContext('2d');

    window.addEventListener('resize', function() {
        canvasAmajor.width = Math.min(750, window.innerWidth);
    });

    function playAMajorScale() {
        repeatedlyDrawOut(canvasAmajorCtx, canvasAmajor);

        for (var i = 0; i < scale.length; i++) {
            TONES.playNote(scale[i], start = i / 2.0, end = i / 2.0 + 0.5);
            TONES.timeout(i / 2.0, TONES.setNoteColor(aMajor[i], "green"));
            TONES.timeout(i / 2.0 + 0.5, TONES.setNoteColor(aMajor[i], "black"));
        }

    }

    document.getElementById("a_major_scale_play").onclick = playAMajorScale;

})();