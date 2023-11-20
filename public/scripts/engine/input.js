import {vec3} from "../third-party/gl-matrix/index.js";

let MOVEMENT_SPEED = 5;
let ROTATION_SPEED = 0.4;

/**
 * Класс для обработки нажатий клавиш и мыши.
 */
export class Input {
    constructor() {
        this.binds = {};
        this.actions = {}
        this.mousePressed = false;
        this.mousePositionDelta = [0, 0];
        this.previousMousePosition = null;
        this.mousePositionUpdated = false;
    }

    /**
     * Инициализирует действия и слущателей событий.
     */
    initialize() {
        this.binds[87] = "forward";
        this.binds[65] = "left";
        this.binds[83] = "backward";
        this.binds[68] = "right";
        this.binds[69] = "up";
        this.binds[81] = "down";
        this.actions["forward"] = false;
        this.actions["left"] = false;
        this.actions["backward"] = false;
        this.actions["right"] = false;
        this.actions["up"] = false;
        this.actions["down"] = false;

        document.body.addEventListener("keyup", (event) => {this.onKeyUp(event);});
        document.body.addEventListener("keydown", (event) => {this.onKeyDown(event);});

        let canvas = $("#canvas");
        canvas.bind("mouseup", (event) => {this.onMouseUp(event);});
        canvas.bind("mousedown", (event) => {this.onMouseDown(event);});
        canvas.bind("mousemove", (event) => {this.onMouseMove(event);});
    }

    /**
     * Вызывается на нажатие клавиши клавиатуры.
     */
    onKeyUp(event) {
        let action = this.binds[event.keyCode];
        if (action) {
            this.actions[action] = false;
        }
    }

    /**
     * Вызывается на отпускание клавиши клавиатуры.
     */
    onKeyDown(event) {
        let action = this.binds[event.keyCode];
        if (action) {
            this.actions[action] = true;
        }
    }

    /**
     * Вызывается на нажатие клавиши мыши.
     */
    onMouseUp(_) {
        this.mousePressed = false;
    }

    /**
     * Вызывается на отпускание клавиши мыши.
     */
    onMouseDown(_) {
        this.mousePressed = true;
    }

    /**
     * Вызывается на перемещение курсора мыши.
     */
    onMouseMove(event) {
        let x = event.offsetX;
        let y = event.offsetY;

        if (this.previousMousePosition === null) {
            this.previousMousePosition = [x, y];
        }

        this.mousePositionDelta = [x - this.previousMousePosition[0], y - this.previousMousePosition[1]];
        this.previousMousePosition = [x, y];
        this.mousePositionUpdated = true;
    }

    /**
     * Обрабатывает текущее состояние клавиатуры и мыши, и исходя из него меняет параметры объектов.
     */
    processInput(camera, deltaSeconds) {
        let movementDelta = MOVEMENT_SPEED * deltaSeconds;
        let rotationDelta = ROTATION_SPEED * deltaSeconds;

        let deltaP = vec3.create();
        let forward = camera.getForwardVector();
        let up =  camera.getUpVector();
        let right =  camera.getRightVector();

        if(this.actions["forward"]) {
            vec3.add(deltaP, deltaP, vec3.scale(vec3.create(), forward, movementDelta));
        }
        if(this.actions["backward"]) {
            vec3.add(deltaP, deltaP, vec3.scale(vec3.create(), vec3.negate(vec3.create(), forward), movementDelta));
        }
        if(this.actions["right"]) {
            vec3.add(deltaP, deltaP, vec3.scale(vec3.create(), right, movementDelta));
        }
        if(this.actions["left"]) {
            vec3.add(deltaP, deltaP, vec3.scale(vec3.create(), vec3.negate(vec3.create(), right), movementDelta));
        }
        if(this.actions["up"]) {
            vec3.add(deltaP, deltaP, vec3.scale(vec3.create(), up, movementDelta));
        }
        if(this.actions["down"]) {
            vec3.add(deltaP, deltaP, vec3.scale(vec3.create(), vec3.negate(vec3.create(), up), movementDelta));
        }

        camera.position = vec3.add(vec3.create(), camera.position, deltaP);

        let deltaR = vec3.create();
        if(this.mousePressed && this.mousePositionUpdated)
        {
            deltaR[1] = -this.mousePositionDelta[0] * rotationDelta;
            deltaR[2] = -this.mousePositionDelta[1] * rotationDelta;
        }
        this.mousePositionUpdated = false;

        camera.rotation = vec3.add(vec3.create(), camera.rotation, deltaR);
    }
}
