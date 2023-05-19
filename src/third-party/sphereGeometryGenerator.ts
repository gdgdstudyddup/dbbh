import * as THREE from 'three';

export function SphereGeometryInfo(radius = 1, widthSegments = 32, heightSegments = 16,) {
    const sphere = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const position = sphere.attributes.position.array;
    const normal = sphere.attributes.normal.array;
    const uv = sphere.attributes.uv.array;
    const index = sphere.index.array;
    for (let i = 0; i < position.length; i += 3) {
        let temp;
        temp = position[i + 1];
        position[i + 1] = position[i + 2];
        position[i + 2] = temp;


        temp = normal[i + 1];
        normal[i + 1] = normal[i + 2];
        normal[i + 2] = temp;

    }
    return {
        position,
        normal,
        uv,
        index
    }
}