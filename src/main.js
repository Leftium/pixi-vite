import './style.css';

import * as PIXI from 'pixi.js';

import { update } from './update.js';

const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

// create a new Sprite from an image path
const bunny = PIXI.Sprite.from('bunny.png');

// center the sprite's anchor point
bunny.anchor.set(0.5);

// move the sprite to random position
bunny.x = Math.random() * app.screen.width;
bunny.y = Math.random() * app.screen.height;

app.stage.addChild(bunny);


let tickerFunction = (delta) => {
    update(delta, {bunny});
}
app.ticker.add(tickerFunction)

if (import.meta.hot) {
    import.meta.hot.accept('./update.js', (newUpdate) => {
        app.ticker.remove(tickerFunction)
        tickerFunction = (delta) => {
            newUpdate.update(delta, {bunny});
        }
        app.ticker.add(tickerFunction)
    })
}

