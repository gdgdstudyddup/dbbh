import { Matrix4 } from "./Matrix4";
import { Vector3 } from "./Vector3";
export class Box3 {
    isBox3 = true;
    min: Vector3;
    max: Vector3;
    constructor(min = new Vector3(+ Infinity, + Infinity, + Infinity), max = new Vector3(- Infinity, - Infinity, - Infinity)) {

        this.isBox3 = true;

        this.min = min;
        this.max = max;

    }

    set(min, max) {

        this.min.copy(min);
        this.max.copy(max);

        return this;

    }
    intersect(box) {

        this.min.max(box.min);
        this.max.min(box.max);

        // ensure that if there is no overlap, the result is fully empty, not slightly empty with non-inf/+inf values that will cause subsequence intersects to erroneously return valid values.
        if (this.isEmpty()) this.makeEmpty();

        return this;

    }

    union(box: Box3) {

        this.min.min(box.min);
        this.max.max(box.max);

        return this;

    }

    applyMatrix4(matrix: Matrix4) {

        // transform of empty box is an empty box.
        if (this.isEmpty()) return this;

        // NOTE: I am using a binary pattern to specify all 2^3 combinations below
        _points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(matrix); // 000
        _points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(matrix); // 001
        _points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(matrix); // 010
        _points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(matrix); // 011
        _points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(matrix); // 100
        _points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(matrix); // 101
        _points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(matrix); // 110
        _points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(matrix); // 111

        this.setFromPoints(_points);

        return this;

    }
    clone() {

        return new Box3().copy(this);

    }

    copy(box: Box3) {

        this.min.copy(box.min);
        this.max.copy(box.max);

        return this;

    }

    setFromArray(array: number[]) {

        let minX = + Infinity;
        let minY = + Infinity;
        let minZ = + Infinity;

        let maxX = - Infinity;
        let maxY = - Infinity;
        let maxZ = - Infinity;

        for (let i = 0, l = array.length; i < l; i += 3) {

            const x = array[i];
            const y = array[i + 1];
            const z = array[i + 2];

            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (z < minZ) minZ = z;

            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            if (z > maxZ) maxZ = z;

        }

        this.min.set(minX, minY, minZ);
        this.max.set(maxX, maxY, maxZ);

        return this;

    }

    setFromPoints(points: Vector3[]) {

        this.makeEmpty();

        for (let i = 0, il = points.length; i < il; i++) {

            this.expandByPoint(points[i]);

        }

        return this;

    }

    setFromCenterAndSize(center, size) {

        const halfSize = _vector.copy(size).multiplyScalar(0.5);

        this.min.copy(center).sub(halfSize);
        this.max.copy(center).add(halfSize);

        return this;

    }
    makeEmpty() {

        this.min.x = this.min.y = this.min.z = + Infinity;
        this.max.x = this.max.y = this.max.z = - Infinity;

        return this;

    }

    isEmpty() {

        // this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

        return (this.max.x < this.min.x) || (this.max.y < this.min.y) || (this.max.z < this.min.z);

    }

    getCenter(target) {

        return this.isEmpty() ? target.set(0, 0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);

    }

    getSize(target) {

        return this.isEmpty() ? target.set(0, 0, 0) : target.subVectors(this.max, this.min);

    }

    expandByPoint(point: Vector3) {

        this.min.min(point);
        this.max.max(point);

        return this;

    }

    expandByVector(vector) {

        this.min.sub(vector);
        this.max.add(vector);

        return this;

    }

    expandByScalar(scalar) {

        this.min.addScalar(- scalar);
        this.max.addScalar(scalar);

        return this;

    }

    containsPoint(point) {

        return point.x < this.min.x || point.x > this.max.x ||
            point.y < this.min.y || point.y > this.max.y ||
            point.z < this.min.z || point.z > this.max.z ? false : true;

    }

    containsBox(box) {

        return this.min.x <= box.min.x && box.max.x <= this.max.x &&
            this.min.y <= box.min.y && box.max.y <= this.max.y &&
            this.min.z <= box.min.z && box.max.z <= this.max.z;

    }

    getParameter(point, target) {

        // This can potentially have a divide by zero if the box
        // has a size dimension of 0.

        return target.set(
            (point.x - this.min.x) / (this.max.x - this.min.x),
            (point.y - this.min.y) / (this.max.y - this.min.y),
            (point.z - this.min.z) / (this.max.z - this.min.z)
        );

    }

    getCorners() {
        const center = this.max.clone().add(this.min).multiplyScalar(0.5);
        const xyz = this.max.clone().sub(center);
        const x = xyz.x;
        const y = xyz.y;
        const z = xyz.z;
        const cx = center.x;
        const cy = center.y;
        const cz = center.z;
        const corners = [
            new Vector3(cx + x, cy + y, cz + z),
            new Vector3(cx + x, cy + y, cz - z),
            new Vector3(cx + x, cy - y, cz + z),
            new Vector3(cx + x, cy - y, cz - z),
            new Vector3(cx - x, cy + y, cz + z),
            new Vector3(cx - x, cy + y, cz - z),
            new Vector3(cx - x, cy - y, cz + z),
            new Vector3(cx - x, cy - y, cz - z),
        ];
        return corners;
    }

    intersectsBox(box) {

        // using 6 splitting planes to rule out intersections.
        return box.max.x < this.min.x || box.min.x > this.max.x ||
            box.max.y < this.min.y || box.min.y > this.max.y ||
            box.max.z < this.min.z || box.min.z > this.max.z ? false : true;

    }
}
const _points = [
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3()
];
const _vector = /*@__PURE__*/ new Vector3();