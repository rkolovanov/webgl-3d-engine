import {vec3} from "./third-party/gl-matrix/index.js";
import {toRadian, toDegree} from "./third-party/gl-matrix/common.js";
import {SceneObject, Camera, PointLight, DirectionalLight, Light} from "./engine/objects.js";
import {initializeWebGl, setClearColor, renderScene} from "./engine/webgl.js";
import {Input} from "./engine/input.js";
import {hexToColor, colorToHex} from "./engine/color-utils.js"

let FPS = 60;
let USER_INPUT = new Input();
let CAMERA_OBJECT = new Camera(vec3.fromValues(-10, 0, 0));
let POINT_LIGHT = new PointLight(vec3.fromValues(-5, 5, 5));
let DIRECTIONAL_LIGHT = new DirectionalLight(vec3.fromValues(5, 5, 5));
let SCENE_OBJECTS = [POINT_LIGHT, DIRECTIONAL_LIGHT];
let RENDER_PARAMETERS = {"backgroundColor": "#000000"};

/**
 * Подготавливает приложение к работе. Выполняется в момент полной заггрузки страницы.
 */
export function onPageLoad() {
    initializeWebGl();
    USER_INPUT.initialize();
    setInterval(exec, 1000 / FPS);
}

/**
 * Главный цикл обработки. Обрабатывает события с клавиатуры и мыши, получает значения из input-ов, после чего рендерит сцену.
 */
function exec() {
    USER_INPUT.processInput(CAMERA_OBJECT, 1 / FPS);
    onParametersChanged();
    renderScene(SCENE_OBJECTS, CAMERA_OBJECT, POINT_LIGHT, DIRECTIONAL_LIGHT, RENDER_PARAMETERS);
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
        case "sdr": typeName = "Поздравление"; break;
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

    let object = new SceneObject();
    object.loadFromObjFile(type, () => {
        SCENE_OBJECTS.push(object);
    });
}

/**
 * Удаляет все объекты со сцены.
 */
export function clearSceneObjects() {
    SCENE_OBJECTS = [POINT_LIGHT, DIRECTIONAL_LIGHT];
    $("#objects").html("");
}

/**
 * Обрабатывает изменения в input-элементах от пользователя и применяет изменения к сцене.
 */
export function onParametersChanged() {
    // Параметры рендеринга
    RENDER_PARAMETERS["drawLight"] = document.getElementById(`draw-light`).checked;
    RENDER_PARAMETERS["drawEdges"] = document.getElementById(`draw-edges`).checked;
    RENDER_PARAMETERS["drawPolygons"] = document.getElementById(`draw-polygons`).checked;
    RENDER_PARAMETERS["backgroundColor"] = document.getElementById(`input-background-color`).value;
    RENDER_PARAMETERS["edgeColor"] = document.getElementById(`input-edge-color`).value;

    // Координаты камеры
    $(`#output-x-camera`).text(CAMERA_OBJECT.position[0].toFixed(3));
    $(`#output-y-camera`).text(CAMERA_OBJECT.position[1].toFixed(3));
    $(`#output-z-camera`).text(CAMERA_OBJECT.position[2].toFixed(3));

    // Вращение камеры
    $(`#output-x-rotation-camera`).text(toDegree(CAMERA_OBJECT.rotation[0]).toFixed(3));
    $(`#output-y-rotation-camera`).text(toDegree(CAMERA_OBJECT.rotation[1]).toFixed(3));
    $(`#output-z-rotation-camera`).text(toDegree(CAMERA_OBJECT.rotation[2]).toFixed(3));

    // Вертикальный FOV
    let fov = document.getElementById(`input-fov-camera`);
    CAMERA_OBJECT.view_vfov = toRadian(Number(fov.value));
    $(`#output-fov-camera`).text(fov.value);

    // Тип проекции
    let projection = document.getElementById(`pers-projection`);
    CAMERA_OBJECT.view_projection = (projection.checked) ? "perspective" : "orthogonal";

    // Материал
    let e_m_s = document.getElementById(`input-shininess`);
    RENDER_PARAMETERS["materialShininess"] = Number(e_m_s.value);
    $(`#output-shininess`).text(e_m_s.value);

    // Позиция точечного света
    let e_pl_x = document.getElementById(`input-x-point-light`);
    let e_pl_y = document.getElementById(`input-y-point-light`);
    let e_pl_z = document.getElementById(`input-z-point-light`);
    POINT_LIGHT.position[0] = Number(e_pl_x.value);
    POINT_LIGHT.position[1] = Number(e_pl_y.value);
    POINT_LIGHT.position[2] = Number(e_pl_z.value);
    $(`#output-x-point-light`).text(e_pl_x.value);
    $(`#output-y-point-light`).text(e_pl_y.value);
    $(`#output-z-point-light`).text(e_pl_z.value);

    // Цвет точечного света
    let e_pl_d = document.getElementById(`input-diffuse-point-light`);
    let c = hexToColor(e_pl_d.value);
    POINT_LIGHT.setColor(c);
    POINT_LIGHT.color = c;
    $(`#output-diffuse-point-light`).text(e_pl_d.value);

    // Фоновый цвет точечного света
    let e_pl_a = document.getElementById(`input-ambient-point-light`);
    POINT_LIGHT.setAmbientColor(hexToColor(e_pl_a.value));
    $(`#output-ambient-point-light`).text(e_pl_a.value);

    // Поворот направленного света
    let e_dl_x = document.getElementById(`input-x-directional-light`);
    let e_dl_y = document.getElementById(`input-y-directional-light`);
    let e_dl_z = document.getElementById(`input-z-directional-light`);
    DIRECTIONAL_LIGHT.position[0] = Number(e_dl_x.value);
    DIRECTIONAL_LIGHT.position[1] = Number(e_dl_y.value);
    DIRECTIONAL_LIGHT.position[2] = Number(e_dl_z.value);
    $(`#output-x-directional-light`).text(e_dl_x.value);
    $(`#output-y-directional-light`).text(e_dl_y.value);
    $(`#output-z-directional-light`).text(e_dl_z.value);

    // Цвет направленного света
    let e_dl_d = document.getElementById(`input-diffuse-directional-light`);
    c = hexToColor(e_dl_d.value);
    DIRECTIONAL_LIGHT.setColor(c);
    DIRECTIONAL_LIGHT.color = c;
    $(`#output-diffuse-directional-light`).text(e_dl_d.value);

    // Фоновый цвет направленного света
    let e_dl_a = document.getElementById(`input-ambient-directional-light`);
    DIRECTIONAL_LIGHT.setAmbientColor(hexToColor(e_dl_a.value));
    $(`#output-ambient-directional-light`).text(e_dl_a.value);

    // Объекты
    for (let i = 0; i < SCENE_OBJECTS.length; ++i) {
        if(SCENE_OBJECTS[i] instanceof Camera || SCENE_OBJECTS[i] instanceof Light)
        {
            continue;
        }

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

    // Цвет заднего фона
    let backgroundColor = hexToColor(RENDER_PARAMETERS["backgroundColor"]);
    setClearColor(backgroundColor);
}
