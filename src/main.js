// Live reload ports of Pixi.js examples based on:
// https://pixijs.io/examples/#/sprite/basic.js
// https://pixijs.io/examples/#/demos-advanced/star-warp.js

import * as PIXI from 'pixi.js';

export const pixiOptions = {
//    backgroundColor: 0x1099bb
}

let app;

let bunny;

// Get the texture for rope.
let starTexture = PIXI.Texture.from('assets/star.png');

// Wrap primitive values in object to persist across hot reloads:
let v = {
    cameraZ:   0,
    speed:     0,
    warpSpeed: 0,
    elapsed:   0
}

let starAmount   = 1000;
let fov          = 20;
let baseSpeed    = 0.025;
let starStretch  = 5;
let starBaseSize = 0.05;

let stars;

// Ensure all variables are registered here for HMR:
export function setState(data) {({
    app,
    bunny,
    v,
    stars
} = data)}

export function getState() { return {
    app,
    bunny,
    v,
    stars
}}

export function init(_app) {
    app = _app;

    let starContainer = new PIXI.Container();
    app.stage.addChild(starContainer);

    // create a new Sprite from an image path
    bunny = PIXI.Sprite.from('assets/bunny.png');

    // center the sprite's anchor point
    bunny.anchor.set(0.5);

    // move the sprite to random position
    bunny.x = Math.random() * app.screen.width;
    bunny.y = Math.random() * app.screen.height;

    app.stage.addChild(bunny);

    // Create the stars
    stars = [];
    for (let i = 0; i < starAmount; i++) {
        const star = {
            sprite: new PIXI.Sprite(starTexture),
            z: 0,
            x: 0,
            y: 0,
        };
        star.sprite.anchor.x = 0.5;
        star.sprite.anchor.y = 0.7;
        randomizeStar(star, true);
        starContainer.addChild(star.sprite);
        stars.push(star);
    }

}

function randomizeStar(star, initial) {
    star.z = initial ? Math.random() * 2000 : v.cameraZ + Math.random() * 1000 + 2000;

    // Calculate star positions with radial random coordinate so no star hits the camera.
    const deg = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 1;
    star.x = Math.cos(deg) * distance;
    star.y = Math.sin(deg) * distance;
}


export function update(delta) {
    bunny.rotation += 0.1 * delta;




    v.elapsed += app.ticker.deltaMS;

    // Change flight speed every 5 seconds
    v.warpSpeed = Math.floor(v.elapsed/5000) % 2;

    // Simple easing. This should be changed to proper easing function when used for real.
    v.speed += (v.warpSpeed - v.speed) / 20;
    v.cameraZ += delta * 10 * (v.speed + baseSpeed);
    for (let i = 0; i < starAmount; i++) {
        const star = stars[i];
        if (star.z < v.cameraZ) randomizeStar(star);

        // Map star 3d position to 2d with really simple projection
        const z = star.z - v.cameraZ;
        star.sprite.x = star.x * (fov / z) * app.renderer.screen.width + app.renderer.screen.width / 2;
        star.sprite.y = star.y * (fov / z) * app.renderer.screen.width + app.renderer.screen.height / 2;

        // Calculate star scale & rotation.
        const dxCenter = star.sprite.x - app.renderer.screen.width / 2;
        const dyCenter = star.sprite.y - app.renderer.screen.height / 2;
        const distanceCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
        const distanceScale = Math.max(0, (2000 - z) / 2000);
        star.sprite.scale.x = distanceScale * starBaseSize;
        // Star is looking towards center so that y axis is towards center.
        // Scale the star depending on how fast we are moving, what the stretchfactor is and depending on how far away it is from the center.
        star.sprite.scale.y = distanceScale * starBaseSize + distanceScale * v.speed * starStretch * distanceCenter / app.renderer.screen.width;
        star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
    }
}

