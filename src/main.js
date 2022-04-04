import './style.css';

import * as PIXI from 'pixi.js';

const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

// create a new Sprite from an image path
const bunny = PIXI.Sprite.from('bunny.png');

// center the sprite's anchor point
bunny.anchor.set(0.5);

// move the sprite to the center of the screen
bunny.x = Math.random() * app.screen.width;
bunny.y = Math.random() * app.screen.height;

app.stage.addChild(bunny);

// Listen for animate update
app.ticker.add((delta) => {
    // just for fun, let's rotate mr rabbit a little
    // delta is 1 if running at 100% performance
    // creates frame-independent transformation
    bunny.rotation += 0.1 * delta;
});

