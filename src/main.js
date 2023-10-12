import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import DebugUI from './engine/DebugUI/DebugUI';
import InputHandler from './engine/Input/InputHandler';

const scene = new THREE.Scene();

const frustumSize = 15;
const aspect = window.innerWidth / window.innerHeight;

const camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2,  frustumSize / 2, frustumSize / - 2, 0.1, 100 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const player = new THREE.Mesh(undefined, undefined);
const playerBirdContainer = new THREE.Mesh(undefined, undefined);
player.add(playerBirdContainer);

const loader = new GLTFLoader();

loader.load('/assets/models/low_poly_bird/scene.gltf', gltf => {
    const newScene = gltf.scene;
    newScene.scale.x = 7;
    newScene.scale.y = 7;
    newScene.scale.z = 7;
    playerBirdContainer.add(gltf.scene);
    playerBirdContainer.rotateY(90);
}, undefined, error => console.log(error));

scene.add(player);

// LIGHT
const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 10);
scene.add( light );

camera.position.z = 5;

let offset = 0;

// BACKGROUND
const textureMap = new THREE.TextureLoader().load('/assets/textures/forest5.png');
textureMap.colorSpace = THREE.SRGBColorSpace;
const planeMaterial = new THREE.SpriteMaterial({ map: textureMap });

const spriteHeight = frustumSize;
const spriteWidth = spriteHeight * 16/9;

const spriteCount = Math.ceil((frustumSize * aspect)/spriteWidth) + 4;

let sprites = [];
let lastSpritePosition = 0;

function initSprites() {
    for (let i = 0; i < spriteCount; i++) {
        const sprite = new THREE.Sprite(planeMaterial);
        sprite.scale.set(spriteWidth, frustumSize, 1);
        sprite.position.set((i * spriteWidth) - frustumSize, 0, -2);
        sprites.push(sprite);
        scene.add(sprite);
    }
    lastSpritePosition = sprites[sprites.length - 1].position.x;
}

function updateSprites() {
    const [firstSprite, ...otherSprites] = sprites;
    firstSprite.position.set(lastSpritePosition + spriteWidth, 0, -2);
    sprites = [...otherSprites, firstSprite];
    lastSpritePosition = firstSprite.position.x;
}

initSprites();

// player
const maxSpeed = 0.005;
const acceleration = 0.00002;
const deceleration = 0.00001;

const playerMoveSpeed = 0.005;

let previousTime = performance.now();

let currentAcceleration = 0;
let currentSpeed = 0;

// Apples
const appleMap = new THREE.TextureLoader().load('/assets/textures/apple.png');
appleMap.colorSpace = THREE.SRGBColorSpace;
const appleMaterial = new THREE.SpriteMaterial({ map: appleMap, transparent: true });

const appleDistance = 5;
const applesOnScreen = Math.ceil(frustumSize * aspect) / appleDistance + 200
let lastApplePosition = 5;
let apples = [];

DebugUI.addLabel("speed", "Vertical Speed");
DebugUI.addLabel("fps", "FPS Value");
DebugUI.addLabel("deltaTime", "Delta Time");

let lastPlayerDelta = 0;

function animate() {
	requestAnimationFrame( animate );

    const time = performance.now();
    const deltaTime = time - previousTime;

    if (deltaTime >= 1000/60) {
        if (currentAcceleration != 0) {
            speedUp(deltaTime);
        } else {
            speedDown(deltaTime);
        }


        DebugUI.updateValue("speed", currentSpeed);
        DebugUI.updateValue("fps", 1000/deltaTime);
        DebugUI.updateValue("deltaTime", deltaTime);

        player.translateY(currentSpeed * deltaTime);
        adjustRotation();
        movePlayer(deltaTime);
        cameraFollow();
        updateApples(time);

        const playerPositionMod = player.position.x % spriteWidth * 2;
        if (playerPositionMod < lastPlayerDelta) {
            console.log("UPDATING BACKGROUND: ", player.position.x);
            updateSprites();
        }
        renderer.render( scene, camera );
        
        lastPlayerDelta = playerPositionMod;
        previousTime = time;
    }
}
animate();

InputHandler.onKeyDown("w", () => currentAcceleration = acceleration);
InputHandler.onKeyDown("s", () => currentAcceleration = -acceleration);

InputHandler.onKeyUp("w", () => currentAcceleration = 0);
InputHandler.onKeyUp("s", () => currentAcceleration = 0);

// buttons
const moveUp = document.querySelector("#moveup-button");
const moveDown = document.querySelector("#movedown-button");

moveUp.addEventListener("touchstart", event => {
    currentAcceleration = acceleration;
})
moveUp.addEventListener("touchend", event => {
    currentAcceleration = 0;
})

moveDown.addEventListener("touchstart", event => {
    currentAcceleration = -acceleration;
})
moveDown.addEventListener("touchend", event => {
    currentAcceleration = 0;
})

function speedUp(deltaTime) {
    currentSpeed = currentAcceleration > 0 ? Math.min(maxSpeed, currentSpeed + currentAcceleration * deltaTime) : Math.max(-maxSpeed, currentSpeed + currentAcceleration * deltaTime);
}

function speedDown(deltaTime) {
    if (currentSpeed > 0) {
        currentSpeed = Math.max(0, currentSpeed - deceleration * deltaTime);
    } else {
        currentSpeed = Math.min(0, currentSpeed + deceleration * deltaTime);
    }
}

function adjustRotation() {
    playerBirdContainer.rotation.set(currentSpeed / maxSpeed * (30 * Math.PI/180), 90, 0);
}

function movePlayer(deltaTime) {
    player.translateX(playerMoveSpeed * deltaTime);
}

function cameraFollow() {
    camera.position.set(player.position.x, camera.position.y, camera.position.z);
}

function updateApples(time) {
    const newScale = 1.5 + Math.sin(time/300) / 4; 
    apples.forEach(apple => {
        apple.scale.set(newScale, newScale, newScale);
    })
}