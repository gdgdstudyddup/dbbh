import * as THREE from '../thirdparty/three.module.js';

export function createSphere(radius, seg0, seg1, x = 0, y = 0, z = 0) {
    const geometry = new THREE.SphereBufferGeometry(radius, seg0, seg1);
    geometry.translate(x, y, z);
    return {
        pos: new Float32Array(geometry.attributes.position.array),
        index: new Uint32Array(geometry.index.array),
    };
}

export function createTorusKnot(radius, tube, segments = 50, x = 0, y = 0, z = 0) {
    /**
     * <li>radius - 圆环的半径，默认值为1。</li>
		<li>tube — 管道的半径，默认值为0.4。</li>
		<li>tubularSegments — 管道的分段数量，默认值为64。</li>
		<li>radialSegments — 横截面分段数量，默认值为8。</li>
		<li>p — 这个值决定了几何体将绕着其旋转对称轴旋转多少次，默认值是2。</li>
		<li>q — 这个值决定了几何体将绕着其内部圆环旋转多少次，默认值是3。</li>
     */
    const geometry = new THREE.TorusKnotBufferGeometry(radius, tube, segments);
    geometry.translate(x, y, z);
    return {
        pos: new Float32Array(geometry.clone().attributes.position.array),
        index: new Uint32Array(geometry.clone().index.array),
    };
}