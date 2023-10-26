import {vec3, mat4, quat} from "../third-party/gl-matrix/index.js";
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

            for(let i = 0; i < result.i_verts.length; ++i)
            {
                this.vertices[3 * i] = result.c_verts[3 * result.i_verts[i]];
                this.vertices[3 * i + 1] = result.c_verts[3 * result.i_verts[i] + 1];
                this.vertices[3 * i + 2] = result.c_verts[3 * result.i_verts[i] + 2];
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
     * Возвращает вершины 3D-модели в локальной системе координат объекта
     * @return {Float32Array}
     */
    getVertices() {
        return new Float32Array(this.vertices);
    }
}

/**
 * Объект камеры на сцене
 */
export class Camera extends SceneObject
{
    constructor(position = vec3.create(), rotation = vec3.create(), scale = vec3.fromValues(1, 1, 1), color = new Color(1, 1, 1, 1)) {
        super(position, rotation, scale, color);
        this.view_projection = "perspective"
        this.view_vfov = 90;
        this.view_distance = 1000;
    }

    /**
     * Возвращает точку в мировой СК, на которую направлена камера
     * @return {vec3}
     */
    getForwardViewTarget() {
        let target = vec3.copy(vec3.create(), [1, 0, 0]);
        vec3.rotateX(target, target, [0, 0, 0], this.rotation[0]);
        vec3.rotateY(target, target, [0, 0, 0], this.rotation[1]);
        vec3.rotateZ(target, target, [0, 0, 0], this.rotation[2]);
        vec3.normalize(target, target);
        vec3.scale(target, target, this.view_distance);
        return vec3.add(vec3.create(), this.position, target);
    }

    /**
     * Возвращает направление в мировой СК, куда смотрит верх камеры
     * @return {vec3}
     */
    getUpVector() {
        let upVector = vec3.copy(vec3.create(), [0, 1, 0]);
        vec3.rotateX(upVector, upVector, [0, 0, 0], this.rotation[0])
        vec3.rotateY(upVector, upVector, [0, 0, 0], this.rotation[1])
        vec3.rotateZ(upVector, upVector, [0, 0, 0], this.rotation[2])
        vec3.normalize(upVector, upVector);
        return upVector;
    }

    /**
     * Возвразщает матрицу просмотра 4x4 (ViewMatrix)
     * @return {mat4}
     */
    getViewMatrix() {
        return mat4.lookAt(mat4.create(), this.position, this.getForwardViewTarget(), this.getUpVector());
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
