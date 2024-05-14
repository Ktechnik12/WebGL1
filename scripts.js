let currentColor = [1.0, 0.0, 0.0, 1.0]; // Initial color: Red
let currentShape = 'square'; // Default shape

function main() {
    const canvas = document.getElementById('glcanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser may not support it.');
        return;
    }

    const vsSource = `
        attribute vec4 aVertexPosition;
        void main(void) {
            gl_Position = aVertexPosition;
        }
    `;

    const fsSource = `
        precision mediump float;
        uniform vec4 uColor;
        void main(void) {
            gl_FragColor = uColor;
        }
    `;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
            uColor: gl.getUniformLocation(shaderProgram, 'uColor'),
        },
    };

    const buffersSquare = initSquareBuffers(gl);
    const buffersHexagon = initHexagonBuffers(gl);

    document.getElementById('colorButton').addEventListener('click', () => {
        currentColor = [Math.random(), Math.random(), Math.random(), 1.0];
        drawScene(gl, programInfo, currentShape === 'square' ? buffersSquare : buffersHexagon);
    });

    document.getElementById('drawSquareButton').addEventListener('click', () => {
        currentShape = 'square';
        drawScene(gl, programInfo, buffersSquare);
    });

    document.getElementById('drawHexagonButton').addEventListener('click', () => {
        currentShape = 'hexagon';
        drawScene(gl, programInfo, buffersHexagon);
    });

    drawScene(gl, programInfo, buffersSquare); // Initial draw
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initSquareBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
        // First triangle
        -0.5, -0.5,
         0.5, -0.5,
        -0.5,  0.5,
        // Second triangle
         0.5, -0.5,
         0.5,  0.5,
        -0.5,  0.5,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
    };
}

function initHexagonBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
         0.0,  0.0,
         0.5,  0.0,
         0.25,  0.433,
        -0.25,  0.433,
        -0.5,  0.0,
        -0.25, -0.433,
         0.25, -0.433,
         0.5,  0.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
    };
}

function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.useProgram(programInfo.program);
    gl.uniform4fv(programInfo.uniformLocations.uColor, currentColor);

    if (currentShape === 'square') {
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    } else if (currentShape === 'hexagon') {
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 8);
    }
}

window.onload = main;
