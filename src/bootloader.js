import './style.css';

import * as PIXI from 'pixi.js';

import { init, update, getState, setState } from './update.js';

const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

init(app);

app.ticker.add(update)
let tickerToRemove = update;

if (import.meta.hot) {
    import.meta.hot.accept('./update.js', (newUpdate) => {
        app.ticker.remove(tickerToRemove)

        newUpdate.setState(getState())

        app.ticker.add(newUpdate.update)
        tickerToRemove = newUpdate.update
    })
}

