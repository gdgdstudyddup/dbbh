import { EPSILON } from './MathUtils';
import { Vector3 } from './Vector3';

class Matrix4 {

    isMatrix4 = true;
    elements: number[];
    constructor() {


        this.elements = [

            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1

        ];

    }

    set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {

        const te = this.elements;

        te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
        te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
        te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
        te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;

        return this;

    }

    identity() {

        this.set(

            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1

        );

        return this;

    }

    clone() {

        return new Matrix4().fromArray(this.elements);

    }

    copy(m) {

        const te = this.elements;
        const me = m.elements;

        te[0] = me[0]; te[1] = me[1]; te[2] = me[2]; te[3] = me[3];
        te[4] = me[4]; te[5] = me[5]; te[6] = me[6]; te[7] = me[7];
        te[8] = me[8]; te[9] = me[9]; te[10] = me[10]; te[11] = me[11];
        te[12] = me[12]; te[13] = me[13]; te[14] = me[14]; te[15] = me[15];

        return this;

    }

    copyPosition(m) {

        const te = this.elements, me = m.elements;

        te[12] = me[12];
        te[13] = me[13];
        te[14] = me[14];

        return this;

    }

    setFromMatrix3(m): Matrix4 {

        const me = m.elements;

        this.set(

            me[0], me[3], me[6], 0,
            me[1], me[4], me[7], 0,
            me[2], me[5], me[8], 0,
            0, 0, 0, 1

        );

        return this;

    }

    extractBasis(xAxis, yAxis, zAxis): Matrix4 {

        xAxis.setFromMatrixColumn(this, 0);
        yAxis.setFromMatrixColumn(this, 1);
        zAxis.setFromMatrixColumn(this, 2);

        return this;

    }

    makeBasis(xAxis, yAxis, zAxis): Matrix4 {

        this.set(
            xAxis.x, yAxis.x, zAxis.x, 0,
            xAxis.y, yAxis.y, zAxis.y, 0,
            xAxis.z, yAxis.z, zAxis.z, 0,
            0, 0, 0, 1
        );

        return this;

    }
    makeRotationFromQuaternion(q) {

        return this.compose(_zero, q, _one);

    }
    multiply(m): Matrix4 {

        return this.multiplyMatrices(this, m);

    }

    premultiply(m): Matrix4 {

        return this.multiplyMatrices(m, this);

    }

    multiplyMatrices(a, b): Matrix4 {

        const ae = a.elements;
        const be = b.elements;
        const te = this.elements;

        const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
        const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
        const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
        const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

        const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
        const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
        const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
        const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        return this;

    }

    multiplyScalar(s): Matrix4 {

        const te = this.elements;

        te[0] *= s; te[4] *= s; te[8] *= s; te[12] *= s;
        te[1] *= s; te[5] *= s; te[9] *= s; te[13] *= s;
        te[2] *= s; te[6] *= s; te[10] *= s; te[14] *= s;
        te[3] *= s; te[7] *= s; te[11] *= s; te[15] *= s;

        return this;

    }

    determinant(): number {

        const te = this.elements;

        const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
        const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
        const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
        const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];

        //TODO: make this more efficient
        //( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

        return (
            n41 * (
                + n14 * n23 * n32
                - n13 * n24 * n32
                - n14 * n22 * n33
                + n12 * n24 * n33
                + n13 * n22 * n34
                - n12 * n23 * n34
            ) +
            n42 * (
                + n11 * n23 * n34
                - n11 * n24 * n33
                + n14 * n21 * n33
                - n13 * n21 * n34
                + n13 * n24 * n31
                - n14 * n23 * n31
            ) +
            n43 * (
                + n11 * n24 * n32
                - n11 * n22 * n34
                - n14 * n21 * n32
                + n12 * n21 * n34
                + n14 * n22 * n31
                - n12 * n24 * n31
            ) +
            n44 * (
                - n13 * n22 * n31
                - n11 * n23 * n32
                + n11 * n22 * n33
                + n13 * n21 * n32
                - n12 * n21 * n33
                + n12 * n23 * n31
            )

        );

    }

    transpose(): Matrix4 {

        const te = this.elements;
        let tmp;

        tmp = te[1]; te[1] = te[4]; te[4] = tmp;
        tmp = te[2]; te[2] = te[8]; te[8] = tmp;
        tmp = te[6]; te[6] = te[9]; te[9] = tmp;

        tmp = te[3]; te[3] = te[12]; te[12] = tmp;
        tmp = te[7]; te[7] = te[13]; te[13] = tmp;
        tmp = te[11]; te[11] = te[14]; te[14] = tmp;

        return this;

    }

    setPosition(position: Vector3): Matrix4 {

        const te = this.elements;

        te[12] = position.x;
        te[13] = position.y;
        te[14] = position.z;

        return this;

    }



    scale(v: Vector3): Matrix4 {

        const te = this.elements;
        const x = v.x, y = v.y, z = v.z;

        te[0] *= x; te[4] *= y; te[8] *= z;
        te[1] *= x; te[5] *= y; te[9] *= z;
        te[2] *= x; te[6] *= y; te[10] *= z;
        te[3] *= x; te[7] *= y; te[11] *= z;

        return this;

    }
    invert(): Matrix4 {

        // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
        const te = this.elements,

            n11 = te[0], n21 = te[1], n31 = te[2], n41 = te[3],
            n12 = te[4], n22 = te[5], n32 = te[6], n42 = te[7],
            n13 = te[8], n23 = te[9], n33 = te[10], n43 = te[11],
            n14 = te[12], n24 = te[13], n34 = te[14], n44 = te[15],

            t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
            t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
            t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
            t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

        const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

        if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

        const detInv = 1 / det;

        te[0] = t11 * detInv;
        te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
        te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
        te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

        te[4] = t12 * detInv;
        te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
        te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
        te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

        te[8] = t13 * detInv;
        te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
        te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
        te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

        te[12] = t14 * detInv;
        te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
        te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
        te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

        return this;

    }

    extractRotation(m) {

        // this method does not support reflection matrices

        const te = this.elements;
        const me = m.elements;

        const scaleX = 1 / _v1.setFromMatrixColumn(m, 0).length();
        const scaleY = 1 / _v1.setFromMatrixColumn(m, 1).length();
        const scaleZ = 1 / _v1.setFromMatrixColumn(m, 2).length();

        te[0] = me[0] * scaleX;
        te[1] = me[1] * scaleX;
        te[2] = me[2] * scaleX;
        te[3] = 0;

        te[4] = me[4] * scaleY;
        te[5] = me[5] * scaleY;
        te[6] = me[6] * scaleY;
        te[7] = 0;

        te[8] = me[8] * scaleZ;
        te[9] = me[9] * scaleZ;
        te[10] = me[10] * scaleZ;
        te[11] = 0;

        te[12] = 0;
        te[13] = 0;
        te[14] = 0;
        te[15] = 1;

        return this;

    }

    getMaxScaleOnAxis() {

        const te = this.elements;

        const scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
        const scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
        const scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];

        return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));

    }

    makeTranslation(x, y, z) {

        this.set(

            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1

        );

        return this;

    }

    makeRotationX(theta) {

        const c = Math.cos(theta), s = Math.sin(theta);

        this.set(

            1, 0, 0, 0,
            0, c, - s, 0,
            0, s, c, 0,
            0, 0, 0, 1

        );

        return this;

    }

    makeRotationY(theta) {

        const c = Math.cos(theta), s = Math.sin(theta);

        this.set(

            c, 0, s, 0,
            0, 1, 0, 0,
            - s, 0, c, 0,
            0, 0, 0, 1

        );

        return this;

    }

    makeRotationZ(theta) {

        const c = Math.cos(theta), s = Math.sin(theta);

        this.set(

            c, - s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1

        );

        return this;

    }

    makeRotationAxis(axis, angle) {

        // Based on http://www.gamedev.net/reference/articles/article1199.asp

        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const t = 1 - c;
        const x = axis.x, y = axis.y, z = axis.z;
        const tx = t * x, ty = t * y;

        this.set(

            tx * x + c, tx * y - s * z, tx * z + s * y, 0,
            tx * y + s * z, ty * y + c, ty * z - s * x, 0,
            tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
            0, 0, 0, 1

        );

        return this;

    }

    makeScale(x, y, z) {

        this.set(

            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1

        );

        return this;

    }

    makeShear(xy, xz, yx, yz, zx, zy) {

        this.set(

            1, yx, zx, 0,
            xy, 1, zy, 0,
            xz, yz, 1, 0,
            0, 0, 0, 1

        );

        return this;

    }

    compose(position, quaternion, scale) {

        const te = this.elements;

        const x = quaternion._x, y = quaternion._y, z = quaternion._z, w = quaternion._w;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;

        const sx = scale.x, sy = scale.y, sz = scale.z;

        te[0] = (1 - (yy + zz)) * sx;
        te[1] = (xy + wz) * sx;
        te[2] = (xz - wy) * sx;
        te[3] = 0;

        te[4] = (xy - wz) * sy;
        te[5] = (1 - (xx + zz)) * sy;
        te[6] = (yz + wx) * sy;
        te[7] = 0;

        te[8] = (xz + wy) * sz;
        te[9] = (yz - wx) * sz;
        te[10] = (1 - (xx + yy)) * sz;
        te[11] = 0;

        te[12] = position.x;
        te[13] = position.y;
        te[14] = position.z;
        te[15] = 1;

        return this;

    }

    decompose(position, quaternion, scale) {

        const te = this.elements;
        let sx = _v1.set(te[0], te[1], te[2]).length();
        const sy = _v1.set(te[4], te[5], te[6]).length();
        const sz = _v1.set(te[8], te[9], te[10]).length();

        // if determine is negative, we need to invert one scale
        const det = this.determinant();
        if (det < 0) sx = - sx;

        position.x = te[12];
        position.y = te[13];
        position.z = te[14];

        // scale the rotation part
        _m1.copy(this);

        const invSX = 1 / sx;
        const invSY = 1 / sy;
        const invSZ = 1 / sz;

        _m1.elements[0] *= invSX;
        _m1.elements[1] *= invSX;
        _m1.elements[2] *= invSX;

        _m1.elements[4] *= invSY;
        _m1.elements[5] *= invSY;
        _m1.elements[6] *= invSY;

        _m1.elements[8] *= invSZ;
        _m1.elements[9] *= invSZ;
        _m1.elements[10] *= invSZ;

        quaternion.setFromRotationMatrix(_m1);

        scale.x = sx;
        scale.y = sy;
        scale.z = sz;

        return this;

    }

    makePerspective(fieldOfViewYInRadians: number, aspect: number, zNear: number, zFar: number): Matrix4 {

        const te = this.elements;

        const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewYInRadians);

        te[0] = f / aspect;
        te[1] = 0;
        te[2] = 0;
        te[3] = 0;

        te[4] = 0;
        te[5] = f;
        te[6] = 0;
        te[7] = 0;

        te[8] = 0;
        te[9] = 0;
        te[11] = -1;

        te[12] = 0;
        te[13] = 0;
        te[15] = 0;

        const c = - ( zFar + zNear ) / ( zFar - zNear );
		const d = - 2 * zFar * zNear / ( zFar - zNear );
        if (zFar === Infinity) {
            te[10] = -1;
            te[14] = -zNear;
        } else {
            const rangeInv = 1 / (zNear - zFar);
            te[10] = zFar * rangeInv;
            te[14] = zFar * zNear * rangeInv;
        }
        console.log('proj',this)
        return this;

    }

    makeOrthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4 {

        const te = this.elements;
        te[0] = 2 / (right - left);
        te[1] = 0;
        te[2] = 0;
        te[3] = 0;

        te[4] = 0;
        te[5] = 2 / (top - bottom);
        te[6] = 0;
        te[7] = 0;

        te[8] = 0;
        te[9] = 0;
        te[10] = 1 / (near - far);
        te[11] = 0;

        te[12] = (right + left) / (left - right);
        te[13] = (top + bottom) / (bottom - top);
        te[14] = near / (near - far);
        te[15] = 1;

        return this;

    }

    lookAt(eye: Vector3, target: Vector3, up: Vector3): Matrix4 {
        const te = this.elements;

		_z.subVectors( eye, target );

		if ( _z.lengthSq() === 0 ) {

			// eye and target are in the same position

			_z.z = 1;

		}

		_z.normalize();
		_x.crossVectors( up, _z );

		if ( _x.lengthSq() === 0 ) {

			// up and z are parallel

			if ( Math.abs( up.z ) === 1 ) {

				_z.x += 0.0001;

			} else {

				_z.z += 0.0001;

			}

			_z.normalize();
			_x.crossVectors( up, _z );

		}

		_x.normalize();
		_y.crossVectors( _z, _x );

		te[ 0 ] = _x.x; te[ 4 ] = _y.x; te[ 8 ] = _z.x;
		te[ 1 ] = _x.y; te[ 5 ] = _y.y; te[ 9 ] = _z.y;
		te[ 2 ] = _x.z; te[ 6 ] = _y.z; te[ 10 ] = _z.z;

		return this;

    }

    equals(matrix: Matrix4) {

        const te = this.elements;
        const me = matrix.elements;

        for (let i = 0; i < 16; i++) {

            if (te[i] !== me[i]) return false;

        }

        return true;

    }
    /**
     * Check if 2 matrices are approximately equal
     * @param a - Operand matrix.
     * @param b - Operand matrix.
     * @returns true if matrices are approximately equal
     */
    equalsApproximately(a: Matrix4, b: Matrix4): boolean {
        return Math.abs(a.elements[0] - b.elements[0]) < EPSILON &&
            Math.abs(a.elements[1] - b.elements[1]) < EPSILON &&
            Math.abs(a.elements[2] - b.elements[2]) < EPSILON &&
            Math.abs(a.elements[3] - b.elements[3]) < EPSILON &&
            Math.abs(a.elements[4] - b.elements[4]) < EPSILON &&
            Math.abs(a.elements[5] - b.elements[5]) < EPSILON &&
            Math.abs(a.elements[6] - b.elements[6]) < EPSILON &&
            Math.abs(a.elements[7] - b.elements[7]) < EPSILON &&
            Math.abs(a.elements[8] - b.elements[8]) < EPSILON &&
            Math.abs(a.elements[9] - b.elements[9]) < EPSILON &&
            Math.abs(a.elements[10] - b.elements[10]) < EPSILON &&
            Math.abs(a.elements[11] - b.elements[11]) < EPSILON &&
            Math.abs(a.elements[12] - b.elements[12]) < EPSILON &&
            Math.abs(a.elements[13] - b.elements[13]) < EPSILON &&
            Math.abs(a.elements[14] - b.elements[14]) < EPSILON &&
            Math.abs(a.elements[15] - b.elements[15]) < EPSILON;
    }

    fromArray(array: number[], offset = 0) {

        for (let i = 0; i < 16; i++) {

            this.elements[i] = array[i + offset];

        }

        return this;

    }

    toArray(array: number[] = [], offset = 0) {

        const te = this.elements;

        array[offset] = te[0];
        array[offset + 1] = te[1];
        array[offset + 2] = te[2];
        array[offset + 3] = te[3];

        array[offset + 4] = te[4];
        array[offset + 5] = te[5];
        array[offset + 6] = te[6];
        array[offset + 7] = te[7];

        array[offset + 8] = te[8];
        array[offset + 9] = te[9];
        array[offset + 10] = te[10];
        array[offset + 11] = te[11];

        array[offset + 12] = te[12];
        array[offset + 13] = te[13];
        array[offset + 14] = te[14];
        array[offset + 15] = te[15];

        return array;

    }
}
const _v1 = /*@__PURE__*/ new Vector3();
const _m1 = /*@__PURE__*/ new Matrix4();
const _zero = /*@__PURE__*/ new Vector3(0, 0, 0);
const _one = /*@__PURE__*/ new Vector3(1, 1, 1);
const _x = /*@__PURE__*/ new Vector3();
const _y = /*@__PURE__*/ new Vector3();
const _z = /*@__PURE__*/ new Vector3();
let xAxis: Vector3;
let yAxis: Vector3;
let zAxis: Vector3;
export { Matrix4 };