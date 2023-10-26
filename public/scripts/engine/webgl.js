import VERTEX_SHADER_SOURCE from "./shaders/vertex_shaders.js";
import FRAGMENT_SHADER_SOURCE from "./shaders/fragment_shaders.js";
import {hexToColor} from "./color-utils.js";

let GL = null;
let PROGRAM = null;

/**
 * Возвращает найденный на странице элемент canvas.
 * @return {HTMLCanvasElement}
 */
export function getCanvas() {
    let canvas = document.getElementById("canvas");
    if (!canvas) {
        console.error("Не найден HTML-элемент canvas.");
        return null;
    }
    return canvas;
}

/**
 * Возвращает найденный на странице контекст WebGL.
 * @return {WebGLRenderingContext}
 */
function getWebGlContext() {
    let canvas = getCanvas();
    if (!canvas) {
        return null;
    }

    let context = canvas.getContext("webgl");
    if (!context) {
        console.error("Не удалось получить контекст WebGL.");
        return null;
    }
    return context;
}

/**
 * Создает и компилирует шейдер WebGL.
 * @param {WebGLRenderingContext} gl
 * @param {int} type
 * @param {string} source
 * @return {WebGLShader}
 */
function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    if (!shader) {
        console.error("Не удалось создать шейдер с типом '" + type + "'");
        return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        let error = gl.getShaderInfoLog(shader);
        console.error("Ошибка компиляции шейдера: " + error);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/**
 * Создает, компилирует и линкует шейдерную программу WebGL.
 * @param {WebGLRenderingContext} gl
 * @param {WebGLShader[]} shaders
 * @return {WebGLProgram}
 */
function createProgram(gl, shaders) {
    let program = gl.createProgram();
    if (!program) {
        console.error("Не удалось создать шейдерную программу");
        return null;
    }

    shaders.forEach((shader) => {
        gl.attachShader(program, shader);
    });

    gl.linkProgram(program);

    let linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        let error = gl.getProgramInfoLog(program);
        console.error("Ошибка линковки программы: " + error);
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

/**
 * Создает и настраивает для работы шейдерную программу WebGL.
 * @param {WebGLRenderingContext} gl
 */
function initializeShaderProgram(gl) {
    let vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

    if (PROGRAM !== null) {
        gl.deleteProgram(PROGRAM);
    }
    PROGRAM = createProgram(gl, [vertexShader, fragmentShader]);

    gl.useProgram(PROGRAM);
}

/**
 * Инициализирует окно рендеринга WebGL.
 * @param {WebGLRenderingContext} gl
 */
function initializeViewport(gl) {
    let canvas = getCanvas();
    if (canvas === null) {
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
}

/**
 * Инициализирует WebGL.
 */
export function initializeWebGl() {
    GL = getWebGlContext();

    initializeShaderProgram(GL);
    initializeViewport(GL);

    // Дополнительные функции
    GL.enable(GL.DEPTH_TEST);
    GL.enable(GL.POLYGON_OFFSET_FILL);
    GL.enable(GL.SAMPLE_ALPHA_TO_COVERAGE);
}


/**
 * Выполняет рендеринг сцены на окно рендеринга.
 * @param {SceneObject[]} sceneObjects
 * @param {Camera} camera
 * @param {{}} renderParameters
 */
export function renderScene(sceneObjects, camera, renderParameters) {
    let backgroundColor = hexToColor(renderParameters["backgroundColor"]);
    GL.clearColor(backgroundColor.r, backgroundColor.g, backgroundColor.b, backgroundColor.a);
    GL.clear(GL.COLOR_BUFFER_BIT);
    GL.clear(GL.DEPTH_BUFFER_BIT);

    let vertexPositionAttribute = GL.getAttribLocation(PROGRAM, "a_vertexPosition");
    let vertexColorUniform = GL.getUniformLocation(PROGRAM, "u_vertexColor");
    let modelMatrixUniform = GL.getUniformLocation(PROGRAM, "u_mMatrix");
    let viewMatrixUniform = GL.getUniformLocation(PROGRAM, "u_vMatrix");
    let projectionMatrixUniform = GL.getUniformLocation(PROGRAM, "u_pMatrix");

    let vMatrix = camera.getViewMatrix();
    GL.uniformMatrix4fv(viewMatrixUniform, false, vMatrix);
    GL.enableVertexAttribArray(viewMatrixUniform);

    let pMatrix = camera.getProjectionMatrix();
    GL.uniformMatrix4fv(projectionMatrixUniform, false, pMatrix);
    GL.enableVertexAttribArray(projectionMatrixUniform);

    sceneObjects.forEach((object) => {
        let mMatrix = object.getTransformMatrix();
        GL.uniformMatrix4fv(modelMatrixUniform, false, mMatrix);
        GL.enableVertexAttribArray(modelMatrixUniform);

        let vertices = object.getVertices();
        let verticesCount = vertices.length / 3;
        let vertexBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, vertexBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, vertices, GL.STATIC_DRAW);
        GL.vertexAttribPointer(vertexPositionAttribute, 3, GL.FLOAT, false, 0, 0);
        GL.enableVertexAttribArray(vertexPositionAttribute);

        if(renderParameters["drawPolygons"]) {
            let objectColor = object.color.asVector();
            GL.uniform4fv(vertexColorUniform, objectColor);
            GL.polygonOffset(0, 0);
            GL.drawArrays(GL.TRIANGLES, 0, verticesCount);
        }

        if(renderParameters["drawEdges"]) {
            let edgeColor = hexToColor(renderParameters["edgeColor"]);
            GL.uniform4fv(vertexColorUniform, edgeColor.asVector());
            GL.polygonOffset(1, 1);
            GL.drawArrays(GL.LINE_LOOP, 0, verticesCount);
        }

        GL.deleteBuffer(vertexBuffer);
    });
}
