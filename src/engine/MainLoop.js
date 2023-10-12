import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

class MainLoop {
    scene;
    lastTime;
    
    constructor(scene) {
        this.scene = scene;
    }

    animate() {
        const time = performance.now();

        requestAnimationFrame(this.animate);
        this.scene.update(time - this.lastTime, time);

        this.lastTime = time;
    }

    start() {
        lastTime = performance.now();
        this.animate();
    }
}

export default MainLoop;