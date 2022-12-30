// Live reload ports of Pixi.js examples based on:
// https://pixijs.io/examples/#/sprite/basic.js
// https://pixijs.io/examples/#/demos-advanced/star-warp.js

import * as PIXI from 'pixi.js';

export const pixiOptions = {
//    backgroundColor: 0x1099bb
}

let app, bunny, stars;

export function init(_app, setup) {
    app = _app;

    app.stage.addChild(starContainer);

    // create a new Sprite from an image path
    bunny = PIXI.Sprite.from('examples/assets/bunny.png');

    // center the sprite's anchor point
    bunny.anchor.set(0.5);

    // move the sprite to random position
    bunny.x = Math.random() * app.screen.width;
    bunny.y = Math.random() * app.screen.height;

    app.stage.addChild(bunny);

}

// Ensure all variables are registered here for HMR:
export function setState(data) {({
    app, bunny, sv, stars
} = data)}

export function getState() { return {
    app, bunny, sv, stars
}}

export const svMeta = {
    cameraZ:   true,
    speed:     true,
    warpSpeed: true,
    elapsed:   true,
}

// Get the texture for rope.
const starTexture = PIXI.Texture.from('examples/assets/star.png');

// Scalar Values
// Wrap scalar values in object to persist across hot reloads:
let sv = {
    starAmount:   1000,
    cameraZ:      0,
    fov:          20,
    baseSpeed:    0.025,
    speed:        0,
    warpSpeed:    0,
    starStretch:  5,
    starBaseSize: 0.05,
    elapsed:      0,
}


// Create the stars
const starContainer = new PIXI.Container();
const starAmount = sv.starAmount;
app = { stage: starContainer }  // Temporarily mock app.stage while adding stars.
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
    app.stage.addChild(star.sprite);
    stars.push(star);
}

function randomizeStar(star, initial) {
    const cameraZ = sv.cameraZ;
    star.z = initial ? Math.random() * 2000 : cameraZ + Math.random() * 1000 + 2000;

    // Calculate star positions with radial random coordinate so no star hits the camera.
    const deg = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 1;
    star.x = Math.cos(deg) * distance;
    star.y = Math.sin(deg) * distance;
}

// WARNING: `state` is an Immer draft object!
// NEVER assign directly to state like: `state = someObject`
export function update(state, delta, deltaMS, keyboardEvents) {
    // Not required; just keeps code similar to original Pixi example code.

    let { stars } = state;
    let { cameraZ, speed, warpSpeed, elapsed, starAmount, fov, baseSpeed, starStretch, starBaseSize } = state.sv;

    bunny.rotation += 0.1 * delta;
    if (keyboardEvents.pressed_ArrowLeft)  { bunny.x -= 30; }
    if (keyboardEvents.pressed_ArrowRight) { bunny.x += 30; }

    if (keyboardEvents.down_ArrowUp)  { bunny.y -= 4; }
    if (keyboardEvents.down_ArrowDown) { bunny.y += 4; }

    elapsed += deltaMS;

    // Change flight speed every 5 seconds
    warpSpeed = Math.floor(elapsed/5000) % 2;

    // Simple easing. This should be changed to proper easing function when used for real.
    speed += (warpSpeed - speed) / 20;
    cameraZ += delta * 10 * (speed + baseSpeed);
    for (let i = 0; i < starAmount; i++) {
        const star = stars[i];
        if (star.z < cameraZ) randomizeStar(star);

        // Map star 3d position to 2d with really simple projection
        const z = star.z - cameraZ;
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
        star.sprite.scale.y = distanceScale * starBaseSize + distanceScale * speed * starStretch * distanceCenter / app.renderer.screen.width;
        star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
    }

    // Not required; just keeps code similar to original Pixi example code.
    state.stars = stars;
    state.sv = { cameraZ, speed, warpSpeed, elapsed, starAmount, fov, baseSpeed, starStretch, starBaseSize };
}
