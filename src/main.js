import * as PIXI from 'pixi.js';

export const pixiOptions = {
    backgroundColor: 0x1099bb
}

let bunny;

// Ensure all variables are registered here for HMR:
export function setState(data) {({
    bunny
} = data)}

export function getState() { return {
    bunny
}}

export function init(app) {
    // create a new Sprite from an image path
    bunny = PIXI.Sprite.from('assets/bunny.png');

    // center the sprite's anchor point
    bunny.anchor.set(0.5);

    // move the sprite to random position
    bunny.x = Math.random() * app.screen.width;
    bunny.y = Math.random() * app.screen.height;

    app.stage.addChild(bunny);
}

export function update(delta) {
    bunny.rotation += 0.1 * delta;
}

