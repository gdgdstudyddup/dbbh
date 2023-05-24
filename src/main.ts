import * as DBBH from './DBBH';
import { PerspectiveCamera } from './3d/camera/Camera';
import { BoxGeometryInfo, SphereGeometryInfo } from './third-party/sphereGeometryGenerator';
import { Vector3 } from './math/Vector3';

// const canvas = document.getElementById('gfx') as HTMLCanvasElement;
// canvas.width = canvas.height = 640;
// const renderer = new Renderer(canvas);
// renderer.start();
const geometry = new DBBH.Geometry();
const material = new DBBH.Material();
const mesh0 = new DBBH.Mesh(geometry, material);

{
    const { position, normal, uv, index } = SphereGeometryInfo(100);


    mesh0.setVertices('position', 3, 'f32', position);
    mesh0.setVertices('normal', 3, 'f32', normal);
    mesh0.setVertices('uv', 2, 'f32', uv);
    mesh0.setIndex(index);
    mesh0.position.set(300, 0, 0);
}
// mesh0.removeVertices('normal');

const geometry1 = new DBBH.Geometry();
const mesh1 = new DBBH.Mesh(geometry1, material);
{
    const { position, normal, uv, index } = BoxGeometryInfo(100, 100, 300);
    mesh1.setVertices('position', 3, 'f32', position);
    mesh1.setVertices('normal', 3, 'f32', normal);
    mesh1.setVertices('uv', 2, 'f32', uv);
    mesh1.setIndex(index);
    // mesh1.removeVertices('normal');
    mesh1.position.set(-300, 0, 0);
}


const hall = new DBBH.Hall(true);

const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight);
camera.up = new Vector3(0, 0, 1);
camera.position.set(100, 150, 1000);
camera.lookAt(0, 0, 0);
hall.setMainCamera(camera);
hall.add([mesh0, mesh1]);
const party = DBBH.Party.getInstance();
party.addHall(hall);
party.start();
