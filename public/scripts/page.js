import {toRadian} from "./third-party/gl-matrix/common.js";
import {initializeWebGl, renderScene} from "./engine/webgl.js";
import {SceneObject, Camera} from "./engine/objects.js";
import {hexToColor, colorToHex} from "./engine/color-utils.js"

let CAMERA_OBJECT = new Camera();
let SCENE_OBJECTS = [];
let RENDER_PARAMETERS = {"backgroundColor": "#000000"};

/**
 * Подготавливает приложение к работе. Выполняется в момент полной заггрузки страницы.
 */
export function onPageLoad() {
    initializeWebGl();
    onParametersChanged();
}

/**
 * Меняет видимость контейнера с настройками параметров объекта.
 * @param {string} id
 */
export function changeAccordionVisibility(id) {
    let e = document.getElementById(id);
    if (e.className.indexOf("w3-show") === -1) {
        e.className += " w3-show";
    } else {
        e.className = e.className.replace(" w3-show", "");
    }
}

/**
 * Добавляет новый объект на сцену.
 * @param {string} type
 */
export function createSceneObject(type) {
    let id = SCENE_OBJECTS.length + 1;
    let typeName = null;

    switch (type) {
        case "cube": typeName = "Куб"; break;
        case "sphere": typeName = "Сфера"; break;
    }

    if (typeName === null) {
        return;
    }

    let objectHtml = `
    <div id="object-${id}" class="w3-padding w3-margin-bottom w3-border w3-border-white">
        <div class="w3-large" onclick='changeAccordionVisibility("accordion-${id}")'>Объект №${id} - ${typeName}</div>
        <div id="accordion-${id}" class="w3-margin-top w3-hide w3-show">
            <div>
                <label for="input-x-${id}" class="w3-left">Положение (X=<span id="output-x-${id}"></span>)</label>
                <input id="input-x-${id}" class="w3-right" type="range" min="-20" max="20" step="0.05" value="0" style="width: 200px;" oninput="onParametersChanged()"/>
            </div>
            <br/>
            <div>
                <label for="input-y-${id}" class="w3-left">Положение (Y=<span id="output-y-${id}"></span>)</label>
                <input id="input-y-${id}" class="w3-right" type="range" min="-20" max="20" step="0.05" value="0" style="width: 200px;" oninput="onParametersChanged()"/>
            </div>
            <br/>
            <div>
                <label for="input-z-${id}" class="w3-left">Положение (Z=<span id="output-z-${id}"></span>)</label>
                <input id="input-z-${id}" class="w3-right" type="range" min="-20" max="20" step="0.01" value="0" style="width: 200px;" oninput="onParametersChanged()"/>
            </div>
            <br/>
            <div>
                <label for="input-rotation-x-${id}" class="w3-left">Поворот (RX=<span id="output-rotation-x-${id}"></span>)</label>
                <input id="input-rotation-x-${id}" class="w3-right" type="range" min="0" max="360" step="1" value="0" style="width: 200px;" oninput="onParametersChanged()"/>
            </div>
            <br/>
            <div>
                <label for="input-rotation-y-${id}" class="w3-left">Поворот (RY=<span id="output-rotation-y-${id}"></span>)</label>
                <input id="input-rotation-y-${id}" class="w3-right" type="range" min="0" max="360" step="1" value="0" style="width: 200px;" oninput="onParametersChanged()"/>
            </div>
            <br/>
            <div>
                <label for="input-rotation-z-${id}" class="w3-left">Поворот (RZ=<span id="output-rotation-z-${id}"></span>)</label>
                <input id="input-rotation-z-${id}" class="w3-right" type="range" min="0" max="360" step="1" value="0" style="width: 200px;" oninput="onParametersChanged()"/>
            </div>
            <br/>
            <div>
                <label for="input-scale-x-${id}" class="w3-left">Масштаб (SX=<span id="output-scale-x-${id}"></span>)</label>
                <input id="input-scale-x-${id}" class="w3-right" type="range" min="0" max="10" step="0.05" value="1" style="width: 200px;" oninput="onParametersChanged()"/>
            </div>
            <br/>
            <div>
                <label for="input-scale-y-${id}" class="w3-left">Масштаб (SY=<span id="output-scale-y-${id}"></span>)</label>
                <input id="input-scale-y-${id}" class="w3-right" type="range" min="0" max="10" step="0.05" value="1" style="width: 200px;" oninput="onParametersChanged()"/>
            </div>
            <br/>
            <div>
                <label for="input-scale-z-${id}" class="w3-left">Масштаб (SZ=<span id="output-scale-z-${id}"></span>)</label>
                <input id="input-scale-z-${id}" class="w3-right" type="range" min="0" max="10" step="0.05" value="1" style="width: 200px;" oninput="onParametersChanged()"/>
            </div>
            <br/>
            <div>
                <label for="input-alpha-${id}" class="w3-left">Прозрачность (A=<span id="output-alpha-${id}"></span>)</label>
                <input id="input-alpha-${id}" class="w3-right" type="range" min="0" max="1" step="0.01" value="1" style="width: 200px;" oninput="onParametersChanged()"/>
            </div>
            <br/>
            <div class="w3-margin-bottom">
                <label for="input-color-${id}" class="w3-left">Цвет</label>
                <input id="input-color-${id}" class="w3-right" type="color" value="${colorToHex(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255))}" style="width: 200px;" oninput="onParametersChanged()"/>
            </div>
            <br/>
        </div>
    </div>
    `;

    let objectsDiv = $("#objects");
    objectsDiv.append(objectHtml);

    let object = null;
    switch (type) {
        case "cube": object = new SceneObject(); break;
        case "sphere": object = new SceneObject(); break;
    }

    if (object !== null) {
        object.loadFromObjFile(type, () => {
            SCENE_OBJECTS.push(object);
            onParametersChanged();
        });
    }
}

/**
 * Удаляет все объекты со сцены.
 */
export function clearSceneObjects() {
    SCENE_OBJECTS = [];
    $("#objects").html("");
    renderScene(SCENE_OBJECTS, CAMERA_OBJECT);
}

/**
 * Обрабатывает изменения в input-элементах от пользователя и применяет изменения к сцене.
 */
export function onParametersChanged() {
    // Координаты камеры
    let e_x = document.getElementById(`input-x-camera`);
    let e_y = document.getElementById(`input-y-camera`);
    let e_z = document.getElementById(`input-z-camera`);
    CAMERA_OBJECT.position[0] = Number(e_x.value);
    CAMERA_OBJECT.position[1] = Number(e_y.value);
    CAMERA_OBJECT.position[2] = Number(e_z.value);
    $(`#output-x-camera`).text(e_x.value);
    $(`#output-y-camera`).text(e_y.value);
    $(`#output-z-camera`).text(e_z.value);

    // Вращение камеры
    let e_r_x = document.getElementById(`input-x-rotation-camera`);
    let e_r_y = document.getElementById(`input-y-rotation-camera`);
    let e_r_z = document.getElementById(`input-z-rotation-camera`);
    CAMERA_OBJECT.rotation[0] = toRadian(Number(e_r_x.value));
    CAMERA_OBJECT.rotation[1] = toRadian(Number(e_r_y.value));
    CAMERA_OBJECT.rotation[2] = toRadian(Number(e_r_z.value));
    $(`#output-x-rotation-camera`).text(e_r_x.value);
    $(`#output-y-rotation-camera`).text(e_r_y.value);
    $(`#output-z-rotation-camera`).text(e_r_z.value);

    // Вертикальный FOV
    let fov = document.getElementById(`input-fov-camera`);
    CAMERA_OBJECT.view_vfov = toRadian(Number(fov.value));
    $(`#output-fov-camera`).text(fov.value);

    // Тип проекции
    let projection = document.getElementById(`pers-projection`);
    CAMERA_OBJECT.view_projection = (projection.checked) ? "perspective" : "orthogonal";

    // Объекты
    for (let i = 0; i < SCENE_OBJECTS.length; ++i) {
        // Позиция
        let e_x = document.getElementById(`input-x-${i+1}`);
        let e_y = document.getElementById(`input-y-${i+1}`);
        let e_z = document.getElementById(`input-z-${i+1}`);
        SCENE_OBJECTS[i].position[0] = Number(e_x.value);
        SCENE_OBJECTS[i].position[1] = Number(e_y.value);
        SCENE_OBJECTS[i].position[2] = Number(e_z.value);
        $(`#output-x-${i+1}`).text(e_x.value);
        $(`#output-y-${i+1}`).text(e_y.value);
        $(`#output-z-${i+1}`).text(e_z.value);

        // Вращение
        let e_r_x = document.getElementById(`input-rotation-x-${i+1}`);
        let e_r_y = document.getElementById(`input-rotation-y-${i+1}`);
        let e_r_z = document.getElementById(`input-rotation-z-${i+1}`);
        SCENE_OBJECTS[i].rotation[0] = toRadian(Number(e_r_x.value));
        SCENE_OBJECTS[i].rotation[1] = toRadian(Number(e_r_y.value));
        SCENE_OBJECTS[i].rotation[2] = toRadian(Number(e_r_z.value));
        $(`#output-rotation-x-${i+1}`).text(e_r_x.value);
        $(`#output-rotation-y-${i+1}`).text(e_r_y.value);
        $(`#output-rotation-z-${i+1}`).text(e_r_z.value);

        // Масштаб
        let e_s_x = document.getElementById(`input-scale-x-${i+1}`);
        let e_s_y = document.getElementById(`input-scale-y-${i+1}`);
        let e_s_z = document.getElementById(`input-scale-z-${i+1}`);
        SCENE_OBJECTS[i].scale[0] = Number(e_s_x.value);
        SCENE_OBJECTS[i].scale[1] = Number(e_s_y.value);
        SCENE_OBJECTS[i].scale[2] = Number(e_s_z.value);
        $(`#output-scale-x-${i+1}`).text(e_s_x.value);
        $(`#output-scale-y-${i+1}`).text(e_s_y.value);
        $(`#output-scale-z-${i+1}`).text(e_s_z.value);

        // Цвет
        let e_c = document.getElementById(`input-color-${i+1}`);
        let e_a = document.getElementById(`input-alpha-${i+1}`);
        SCENE_OBJECTS[i].color = hexToColor(e_c.value);
        SCENE_OBJECTS[i].color.a = Number(e_a.value);
        $(`#output-alpha-${i+1}`).text(e_a.value);
    }

    RENDER_PARAMETERS["drawEdges"] = document.getElementById(`draw-edges`).checked;
    RENDER_PARAMETERS["drawPolygons"] = document.getElementById(`draw-polygons`).checked;
    RENDER_PARAMETERS["backgroundColor"] = document.getElementById(`input-background-color`).value;
    RENDER_PARAMETERS["edgeColor"] = document.getElementById(`input-edge-color`).value;

    renderScene(SCENE_OBJECTS, CAMERA_OBJECT, RENDER_PARAMETERS);
}
