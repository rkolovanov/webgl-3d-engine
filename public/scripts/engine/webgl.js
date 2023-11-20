import VERTEX_SHADER_SOURCE from "./shaders/vertex_shaders.js";
import FRAGMENT_SHADER_SOURCE from "./shaders/fragment_shaders.js";
import {PointLight} from "./objects.js";
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
 * Устанавливает цвет очистки окна рендеринга.
 * @param {Color} color
 */
export function setClearColor(color) {
    GL.clearColor(color.r, color.g, color.b, color.a);
}

/**
 * Выполняет рендеринг сцены на окно рендеринга.
 * @param {SceneObject[]} sceneObjects
 * @param {Camera} camera
 * @param {PointLight} pointLight
 * @param {DirectionalLight} directionalLight
 * @param {{}} renderParameters
 */
export function renderScene(sceneObjects, camera, pointLight, directionalLight, renderParameters) {
    GL.clear(GL.COLOR_BUFFER_BIT);
    GL.clear(GL.DEPTH_BUFFER_BIT);

    let cameraPositionUniform = GL.getUniformLocation(PROGRAM, "u_cameraPosition");
    GL.uniform3f(cameraPositionUniform, camera.position[0], camera.position[1], camera.position[2]);

    let lightsUniform = GL.getUniformLocation(PROGRAM, "u_lights[0].diffuse");
    GL.uniform3f(lightsUniform, pointLight.diffuse.r, pointLight.diffuse.g, pointLight.diffuse.b);
    lightsUniform = GL.getUniformLocation(PROGRAM, "u_lights[0].ambient");
    GL.uniform3f(lightsUniform, pointLight.ambient.r, pointLight.ambient.g, pointLight.ambient.b);
    lightsUniform = GL.getUniformLocation(PROGRAM, "u_lights[0].specular");
    GL.uniform3f(lightsUniform, pointLight.specular.r, pointLight.specular.g, pointLight.specular.b);
    lightsUniform = GL.getUniformLocation(PROGRAM, "u_lights[0].position");
    GL.uniform4f(lightsUniform, pointLight.position[0], pointLight.position[1], pointLight.position[2], 1);

    lightsUniform = GL.getUniformLocation(PROGRAM, "u_lights[1].diffuse");
    GL.uniform3f(lightsUniform, directionalLight.diffuse.r, directionalLight.diffuse.g, directionalLight.diffuse.b);
    lightsUniform = GL.getUniformLocation(PROGRAM, "u_lights[1].ambient");
    GL.uniform3f(lightsUniform, directionalLight.ambient.r, directionalLight.ambient.g, directionalLight.ambient.b);
    lightsUniform = GL.getUniformLocation(PROGRAM, "u_lights[1].specular");
    GL.uniform3f(lightsUniform, directionalLight.specular.r, directionalLight.specular.g, directionalLight.specular.b);
    lightsUniform = GL.getUniformLocation(PROGRAM, "u_lights[1].position");
    GL.uniform4f(lightsUniform, directionalLight.position[0], directionalLight.position[1], directionalLight.position[2], 0);

    let viewMatrixUniform = GL.getUniformLocation(PROGRAM, "u_vMatrix");
    let vMatrix = camera.getViewMatrix();
    GL.uniformMatrix4fv(viewMatrixUniform, false, vMatrix);
    GL.enableVertexAttribArray(viewMatrixUniform);

    let projectionMatrixUniform = GL.getUniformLocation(PROGRAM, "u_pMatrix");
    let pMatrix = camera.getProjectionMatrix();
    GL.uniformMatrix4fv(projectionMatrixUniform, false, pMatrix);
    GL.enableVertexAttribArray(projectionMatrixUniform);

    let lightingUniform = GL.getUniformLocation(PROGRAM, "u_lighting");
    let vertexPositionAttribute = GL.getAttribLocation(PROGRAM, "a_vertexPosition");
    let vertexNormalAttribute = GL.getAttribLocation(PROGRAM, "a_vertexNormal");
    let vertexColorUniform = GL.getUniformLocation(PROGRAM, "u_vertexColor");
    let modelMatrixUniform = GL.getUniformLocation(PROGRAM, "u_mMatrix");
    let normalMatrixUniform = GL.getUniformLocation(PROGRAM, "u_nMatrix");

    sceneObjects.forEach((object) => {
        if(!object.visible) {
            return;
        }

        let mMatrix = object.getTransformMatrix();
        GL.uniformMatrix4fv(modelMatrixUniform, false, mMatrix);
        GL.enableVertexAttribArray(modelMatrixUniform);

        let nMatrix = object.getNormalMatrix();
        GL.uniformMatrix4fv(normalMatrixUniform, false, nMatrix);
        GL.enableVertexAttribArray(normalMatrixUniform);

        let materialUniform = GL.getUniformLocation(PROGRAM, "u_material.diffuse");
        GL.uniform3f(materialUniform, object.color.r, object.color.g, object.color.b);
        materialUniform = GL.getUniformLocation(PROGRAM, "u_material.ambient");
        GL.uniform3f(materialUniform, 1, 1, 1);
        materialUniform = GL.getUniformLocation(PROGRAM, "u_material.specular");
        GL.uniform3f(materialUniform, object.color.r, object.color.g, object.color.b);
        materialUniform = GL.getUniformLocation(PROGRAM, "u_material.shininess");
        GL.uniform1f(materialUniform, renderParameters["materialShininess"]);

        let vertices = object.getVertices();
        let verticesCount = vertices.length / 3;
        let verticesBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, verticesBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, vertices, GL.STATIC_DRAW);
        GL.vertexAttribPointer(vertexPositionAttribute, 3, GL.FLOAT, false, 0, 0);
        GL.enableVertexAttribArray(vertexPositionAttribute);

        let normals = object.getNormals();
        let normalsBuffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, normalsBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, normals, GL.STATIC_DRAW);
        GL.vertexAttribPointer(vertexNormalAttribute, 3, GL.FLOAT, false, 0, 0);
        GL.enableVertexAttribArray(vertexNormalAttribute);

        if(renderParameters["drawPolygons"]) {
            let objectColor = object.color.asVector();
            GL.uniform1i(lightingUniform, renderParameters["drawLight"] && !(object instanceof PointLight));
            GL.uniform4fv(vertexColorUniform, objectColor);
            GL.polygonOffset(0, 0);
            GL.drawArrays(GL.TRIANGLES, 0, verticesCount);
        }

        if(renderParameters["drawEdges"]) {
            let edgeColor = hexToColor(renderParameters["edgeColor"]).asVector();
            GL.uniform1i(lightingUniform, 0);
            GL.uniform4fv(vertexColorUniform, edgeColor);
            GL.polygonOffset(1, 1);
            GL.drawArrays(GL.LINE_LOOP, 0, verticesCount);
        }

        GL.deleteBuffer(verticesBuffer);
    });
}
