import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

loader.load('../src/assets/models/low_poly_bird/scene.gltf', gltf => {
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

// light.position.setY(20);

camera.position.z = 5;

let offset = 0;

// BACKGROUND
const textureMap = new THREE.TextureLoader().load('./src/assets/textures/forest2.png');
textureMap.colorSpace = THREE.SRGBColorSpace;
const planeMaterial = new THREE.SpriteMaterial({ map: textureMap });

const spriteHeight = frustumSize;
const spriteWidth = spriteHeight/2;

const spriteCount = Math.ceil((frustumSize * aspect)/spriteWidth) + 2;

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

// Enemies
const appleMap = new THREE.TextureLoader().load('./src/assets/textures/apple.png');
appleMap.colorSpace = THREE.SRGBColorSpace;
const appleMaterial = new THREE.SpriteMaterial({ map: appleMap, transparent: true });

const enemyDistance = 5;
const enemiesOnScreen = Math.ceil(frustumSize * aspect) / enemyDistance + 200
let lastEnemyPosition = 5;
let enemies = [];

for (let i = 0; i < enemiesOnScreen; i ++) {
    const apple = new THREE.Sprite(appleMaterial);
    apple.position.set(lastEnemyPosition + enemyDistance, frustumSize/2 - Math.random() * frustumSize, 0);
    scene.add(apple);

    lastEnemyPosition = apple.position.x;
}

// HTML items
const speedIndicator = document.querySelector("#speed-value");
const deltaTimeIndicator = document.querySelector("#deltatime-value");
const fpsIndicator = document.querySelector("#fps-value");

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

        speedIndicator.textContent = currentSpeed;
        deltaTimeIndicator.textContent = deltaTime;
        fpsIndicator.textContent = 1000/deltaTime;

        player.translateY(currentSpeed * deltaTime);
        adjustRotation();
        movePlayer(deltaTime);
        cameraFollow();

        const playerPositionMod = player.position.x % spriteWidth * 4;
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

document.addEventListener('keydown', event => {
    if (event.key === "w") {
        currentAcceleration = acceleration;
    }
    if (event.key === "s") {
        currentAcceleration = (acceleration * -1);
    }
})

document.addEventListener('keyup', event => {
    if (event.key === "w") {
        currentAcceleration = 0;
    }
    if (event.key === "s") {
        currentAcceleration = 0;
    }
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