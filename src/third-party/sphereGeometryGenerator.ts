import * as THREE from 'three';
import { Vector3 } from '../math/Vector3';

export function SphereGeometryInfo(radius = 1, widthSegments = 32, heightSegments = 16,) {
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    return generateInfo(geometry);
}

export function BoxGeometryInfo(width = 100, height = 100, depth = 100) {
    const geometry = new THREE.BoxGeometry(width, height, depth, 10, 10, 10);
    return generateInfo(geometry);
}

export function TorusKnotGeometryInfo(radius = 200, tube = 50, tubularSegments = 64, radialSegments = 8, p = 2, q = 3) {
    const geometry = new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q);
    return generateInfo(geometry);
}

function generateInfo(geometry) {
    const position = geometry.attributes.position.array;
    const normal = geometry.attributes.normal.array;
    const uv = geometry.attributes.uv.array;
    const index = geometry.index.array;
    for (let i = 0; i < position.length; i += 3) {
        let temp;
        temp = position[i + 1];
        position[i + 1] = position[i + 2];
        position[i + 2] = temp;


        temp = normal[i + 1];
        normal[i + 1] = normal[i + 2];
        normal[i + 2] = temp;

        normal[i] *= 1;

    }
    for (let i = 0; i < index.length; i += 3) {
        let temp = index[i + 2];
        index[i + 2] = index[i];
        index[i] = temp;
    }
    return {
        position,
        normal,
        uv,
        index
    }
}
