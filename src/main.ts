import * as DBBH from './DBBH';
import { PerspectiveCamera } from './3d/camera/Camera';
import { BoxGeometryInfo, SphereGeometryInfo, TorusKnotGeometryInfo } from './third-party/sphereGeometryGenerator';
import { Vector3 } from './math/Vector3';

// const canvas = document.getElementById('gfx') as HTMLCanvasElement;
// canvas.width = canvas.height = 640;
// const renderer = new Renderer(canvas);
// renderer.start();
const geometry = new DBBH.Geometry();
const material0 = new DBBH.Material();
material0.id = 50/1;
const mesh0 = new DBBH.Mesh(geometry, material0);

{
    const { position, normal, uv, index } = SphereGeometryInfo(200);


    mesh0.setVertices('position', 3, 'f32', position);
    mesh0.setVertices('normal', 3, 'f32', normal);
    mesh0.setVertices('uv', 2, 'f32', uv);
    mesh0.setIndex(index);
    mesh0.position.set(0, 0, 0);
}

const material1 = new DBBH.Material();
material1.id = 2/1;
const geometry1 = new DBBH.Geometry();
const mesh1 = new DBBH.Mesh(geometry1, material1);
{
    const { position, normal, uv, index } = TorusKnotGeometryInfo();
    mesh1.setVertices('position', 3, 'f32', position);
    mesh1.setVertices('normal', 3, 'f32', normal);
    mesh1.setVertices('uv', 2, 'f32', uv);
    mesh1.setIndex(index);
    // mesh1.removeVertices('normal');
    mesh1.position.set(-900, 0, 500);
    // mesh1.quaternion.setFromAxisAngle(new Vector3(0,0,1), -0.7);
}

const material2 = new DBBH.Material();
material2.id = 150/1;
const geometry2 = new DBBH.Geometry();
const mesh2 = new DBBH.Mesh(geometry2, material2);
{
    const { position, normal, uv, index } = BoxGeometryInfo(300, 300, 300);
    mesh2.setVertices('position', 3, 'f32', position);
    mesh2.setVertices('normal', 3, 'f32', normal);
    mesh2.setVertices('uv', 2, 'f32', uv);
    mesh2.setIndex(index);
    // mesh2.removeVertices('normal');
    mesh2.position.set(1000, 0, -500);
    mesh2.quaternion.setFromAxisAngle(new Vector3(0,0,1), 3.14);
}


const hall = new DBBH.Hall(true);

const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight);
camera.up.set(0, 0, 1);
camera.position.set(0, -888, 0);
camera.lookAt(0, 0, 0);
hall.setMainCamera(camera);
hall.add([mesh0, mesh2, mesh1]);
const party = DBBH.Party.getInstance();
party.addHall(hall);
party.start();
