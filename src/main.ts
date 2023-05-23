import * as DBBH from './DBBH';
import { PerspectiveCamera } from './3d/camera/Camera';
import { SphereGeometryInfo } from './third-party/sphereGeometryGenerator';

// const canvas = document.getElementById('gfx') as HTMLCanvasElement;
// canvas.width = canvas.height = 640;
// const renderer = new Renderer(canvas);
// renderer.start();

const { position, normal, uv, index } = SphereGeometryInfo(100);

const geometry = new DBBH.Geometry();
const material = new DBBH.Material();
const mesh0 = new DBBH.Mesh(geometry, material);
mesh0.setVertices('position', 3, 'f32', position);
mesh0.setVertices('normal', 3, 'f32', normal);
mesh0.setVertices('uv', 2, 'f32', uv);
mesh0.setIndex(index);

// mesh0.removeVertices('normal');
mesh0.position.set(0, 0, 0);

const geometry1 = new DBBH.Geometry();
const mesh1 = new DBBH.Mesh(geometry1, material);
mesh1.setVertices('position', 3, 'f32', position);
mesh1.setVertices('normal', 3, 'f32', normal);
mesh1.setVertices('uv', 2, 'f32', uv);
mesh1.setIndex(index);
console.log(position, mesh1)

// mesh1.removeVertices('normal');
mesh1.position.set(0, 0, 0);
// mesh1.scale.set(0.5, 0.5, 0.5);

const hall = new DBBH.Hall(true);

const camera = new PerspectiveCamera();
camera.position.set(0, 1000, 0);
camera.lookAt(0, 0, 0);
hall.setMainCamera(camera);
hall.add([mesh0, mesh1]);
const party = DBBH.Party.getInstance();
party.addHall(hall);
party.start();
