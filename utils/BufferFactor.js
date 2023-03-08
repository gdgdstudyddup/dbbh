import * as THREE from '../thirdparty/three.module.js';

export function createSphere(radius, seg0, seg1, x = 0, y = 0, z = 0) {
    const geometry = new THREE.SphereBufferGeometry(radius, seg0, seg1);
    geometry.translate(x, y, z);
    return {
        pos: new Float32Array(geometry.attributes.position.array),
        index: new Uint32Array(geometry.index.array),
    };
}

export function createTorusKnot(radius, tube, x = 0, y = 0, z = 0) {
    const geometry = new THREE.TorusKnotBufferGeometry(radius, tube);
    geometry.translate(x, y, z);
    return {
        pos: new Float32Array(geometry.attributes.position.array),
        index: new Uint32Array(geometry.index.array),
    };
}