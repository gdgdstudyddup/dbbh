import Renderer from './renderer';
import * as DBBH from './DBBH';

// const canvas = document.getElementById('gfx') as HTMLCanvasElement;
// canvas.width = canvas.height = 640;
// const renderer = new Renderer(canvas);
// renderer.start();
const party = DBBH.Party.getInstance();
party.start();
