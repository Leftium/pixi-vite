// Bootloads Pixi.js for Vite HMR development.
// You should not need to edit this file; you should edit main.js.

import './style.css';

import * as PIXI from 'pixi.js';

import { pixiOptions, init, update, getState, setState } from './main.js';

const app = new PIXI.Application(pixiOptions);
document.body.appendChild(app.view);

init(app);

app.ticker.add(update);
let tickerToRemove = update;

if (import.meta.hot) {
    import.meta.hot.accept('./main.js', (newUpdate) => {
        app.ticker.remove(tickerToRemove);

        newUpdate.setState(getState());

        app.ticker.add(newUpdate.update);
        tickerToRemove = newUpdate.update;
    })
}

