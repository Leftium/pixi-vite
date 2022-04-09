// Bootloads Pixi.js for Vite HMR development.
// You should not need to edit this file; you should edit main.js.

import './style.css';

import { produce } from "immer"

import * as PIXI from 'pixi.js';

import { pixiOptions, init} from './main.js';


// based on: https://github.com/pixijs/pixijs/wiki/v5-Custom-Application-GameLoop#custom-gameloop
// setup renderer and ticker
var renderer = new PIXI.Renderer(pixiOptions);
document.body.appendChild(renderer.view);
var stage = new PIXI.Container();

// We're not using the Pixi application plugin,
// but we provide interface expected for Pixi app:
var app = { renderer, stage };
app.screen = renderer.screen;


// These imported methods must be var (not const) for HMR:
const NULL_FUNCTION = function() {};
var update   = NULL_FUNCTION;
var getState = NULL_FUNCTION;
var setState = NULL_FUNCTION;
var svMeta = {};
import('./main.js').then(module => {
    ({ update, getState, setState, svMeta } = module);
});

// setup RAF
var oldTime = Date.now();

// Update() wrapped in Immer for immutable data
let immutableUpdate = produce((gsDraft, delta, deltaMS) => {
    update(gsDraft, delta, deltaMS);
})

requestAnimationFrame(animate);
function animate() {
    var newTime = Date.now();
    var deltaTime = newTime - oldTime;
    oldTime = newTime;
    if (deltaTime < 0) deltaTime = 0;
    if (deltaTime > 1000) deltaTime = 1000;
    var deltaFrame = deltaTime * 60 / 1000; //1.0 is for single frame

    const state = getState();
    if (state) {
        const nextState = immutableUpdate(state, deltaFrame, deltaTime);
        setState(nextState);
        console.log(filterScalarValues(nextState.sv));
    }

    renderer.render(stage);

    requestAnimationFrame(animate);
}

init(app);

function filterScalarValues(sv) {
    const filteredState = {};
    for (const key in sv) {
        if (svMeta[key]) {
            filteredState[key] = sv[key];
        }
    }
    return filteredState;
}

if (import.meta.hot) {
    import.meta.hot.accept('./main.js', (newMain) => {

        // Use old method to get state before updating methods.
        var state = getState();
        console.log(state?.sv);

        ({ update, setState, getState, svMeta } = newMain);
        newMain.setState(state);

    })
}
