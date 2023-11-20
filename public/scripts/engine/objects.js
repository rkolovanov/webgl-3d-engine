import {vec3, vec4, mat4, quat} from "../third-party/gl-matrix/index.js";
import {K3D} from "../third-party/K3D.js";
import {Color} from "./color-utils.js"
import {getCanvas} from "./webgl.js"

/**
 * 3D-объект сцены
 */
export class SceneObject {
    /**
     * @param {vec3} position
     * @param {vec3} rotation
     * @param {vec3} scale
     * @param {Color} color
     */
    constructor(position = vec3.create(), rotation = vec3.create(), scale = vec3.fromValues(1, 1, 1), color = new Color(1, 1, 1, 1)) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.color = color;
        this.vertices = new Float32Array(0);
        this.normals = new Float32Array(0);
        this.visible = true;
    }

    /**
     * Загружает 3D-модель из файла формата .OBJ
     * @param {string} name
     * @param {function} callback
     */
    loadFromObjFile(name, callback) {
        K3D.load(`/public/models/${name}.obj`, (rawdata) => {
            let result = K3D.parse.fromOBJ(rawdata);
            this.vertices = new Float32Array(3 * result.i_verts.length);
            this.normals = new Float32Array(3 * result.i_norms.length);

            for(let i = 0; i < result.i_verts.length; ++i) {
                this.vertices[3 * i] = result.c_verts[3 * result.i_verts[i]];
                this.vertices[3 * i + 1] = result.c_verts[3 * result.i_verts[i] + 1];
                this.vertices[3 * i + 2] = result.c_verts[3 * result.i_verts[i] + 2];
            }

            for(let i = 0; i < result.i_norms.length; ++i) {
                this.normals[3 * i] = result.c_norms[3 * result.i_norms[i]];
                this.normals[3 * i + 1] = result.c_norms[3 * result.i_norms[i] + 1];
                this.normals[3 * i + 2] = result.c_norms[3 * result.i_norms[i] + 2];
            }

            callback();
        });
    }

    /**
     * Возвразщает матрицу модели 4x4 (ModelMatrix)
     * @return {mat4}
     */
    getTransformMatrix() {
        let rotationQuad = quat.create();
        quat.rotateX(rotationQuad, rotationQuad, this.rotation[0]);
        quat.rotateY(rotationQuad, rotationQuad, this.rotation[1]);
        quat.rotateZ(rotationQuad, rotationQuad, this.rotation[2]);
        return mat4.fromRotationTranslationScale(mat4.create(), rotationQuad, this.position, this.scale);
    }

    /**
     * Возвразщает матрицу преобразования нормалей 4x4 (NormalMatrix)
     * @return {mat4}
     */
    getNormalMatrix() {
        let matrix = this.getTransformMatrix();
        mat4.invert(matrix, matrix);
        mat4.transpose(matrix, matrix);
        return matrix;
    }

    /**
     * Возвращает вершины 3D-модели в локальной системе координат объекта
     * @return {Float32Array}
     */
    getVertices() {
        return new Float32Array(this.vertices);
    }

    /**
     * Возвращает вершины 3D-модели в локальной системе координат объекта
     * @return {Float32Array}
     */
    getNormals() {
        return new Float32Array(this.normals);
    }

    /**
     * Возвращает направление в мировой СК, куда смотрит камера
     * @return {vec3}
     */
    getForwardVector() {
        let forwardVector = vec4.copy(vec4.create(), [1, 0, 0, 0]);
        vec4.transformMat4(forwardVector, forwardVector, this.getTransformMatrix());
        vec4.normalize(forwardVector, forwardVector);
        return vec3.copy(vec3.create(), forwardVector);
    }

    /**
     * Возвращает направление в мировой СК, куда смотрит верх камеры
     * @return {vec3}
     */
    getUpVector() {
        let upVector = vec4.copy(vec4.create(), [0, 1, 0, 0]);
        vec4.transformMat4(upVector, upVector, this.getTransformMatrix());
        vec4.normalize(upVector, upVector);
        return vec3.copy(vec3.create(), upVector);
    }

    /**
     * Возвращает направление в мировой СК, куда смотрит правая сторона камеры
     * @return {vec3}
     */
    getRightVector() {
        let rightVector = vec4.copy(vec4.create(), [0, 0, 1, 0]);
        vec4.transformMat4(rightVector, rightVector, this.getTransformMatrix());
        vec4.normalize(rightVector, rightVector);
        return vec3.copy(vec3.create(), rightVector);
    }
}

/**
 * Объект камеры на сцене
 */
export class Camera extends SceneObject {
    constructor(position = vec3.create(), rotation = vec3.create(), scale = vec3.fromValues(1, 1, 1), color = new Color(1, 1, 1, 1)) {
        super(position, rotation, scale, color);
        this.view_projection = "perspective"
        this.view_vfov = 90;
        this.view_distance = 1000;
    }

    /**
     * Возвразщает матрицу просмотра 4x4 (ViewMatrix)
     * @return {mat4}
     */
    getViewMatrix() {
        let target = this.getForwardVector();
        vec3.scale(target, target, this.view_distance);
        vec3.add(target, target, this.position);
        return mat4.lookAt(mat4.create(), this.position, target, this.getUpVector());
    }

    /**
     * Возвразщает матрицу проекции 4x4 (ProjectionMatrix)
     * @return {mat4}
     */
    getProjectionMatrix() {
        if(this.view_projection === "perspective") {
            let aspectRatio = getCanvas().width / getCanvas().height;
            return mat4.perspective(mat4.create(), this.view_vfov, aspectRatio, 0.1, this.view_distance);
        } else if(this.view_projection === "orthogonal") {
            let boxSize = 5;
            return mat4.ortho(mat4.create(), -boxSize, boxSize, -boxSize, boxSize, 0.1, this.view_distance);
        } else {
            return mat4.create();
        }
    }
}

/**
 * Объект света на сцене
 */
export class Light extends SceneObject {
    constructor(position = vec3.create()) {
        super(position, vec3.fromValues(0, 0, 0), vec3.fromValues(1, 1, 1), new Color());
        this.ambient = new Color(0, 0, 0, 1);
        this.diffuse = new Color(0, 0, 0, 1);
        this.specular = new Color(0, 0, 0, 1);
    }

    /**
     * Устанавливает цвет света (диффузный и зеркальный)
     * @param {Color} color
     */
    setColor(color) {
        this.diffuse = color;
        this.specular = color;
    }

    /**
     * Устанавливает цвет фонового света
     * @param {Color} color
     */
    setAmbientColor(color) {
        this.ambient = color;
    }
}

/**
 * Объект точечного света на сцене
 */
export class PointLight extends Light {
    constructor(position = vec3.create()) {
        super(position);
        this.scale = vec3.fromValues(0.1, 0.1, 0.1);
        this.loadFromObjFile("sphere", () => {});
    }
}

/**
 * Объект направленного света на сцене
 */
export class DirectionalLight extends Light {
    constructor(rotation = vec3.create()) {
        super(rotation);
        this.visible = false;
        this.scale = vec3.fromValues(0.1, 0.1, 0.1);
        this.loadFromObjFile("sphere", () => {});
    }
}
