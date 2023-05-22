import { Euler } from "../math/Euler";
import { generateUUID } from "../math/MathUtils";
import { Matrix4 } from "../math/Matrix4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";

export class Object3D {
    static DEFAULT_UP = new Vector3(0, 0, 1);
    isObject3D = true;
    isOCobject = false;
    uuid = generateUUID();
    tag: string;
    parent: Object3D;
    children: Object3D[];
    up = Object3D.DEFAULT_UP.clone();
    _position = new Vector3();
    _rotation = new Euler();
    _quaternion = new Quaternion();
    _scale = new Vector3(1, 1, 1);
    localMatrix = new Matrix4();
    worldMatrix = new Matrix4();
    localMatrixAutoUpdate = true;
    worldMatrixAutoUpdate = true;
    localMatrixNeedsUpdate = true;
    worldMatrixNeedsUpdate = true;
    visible = true;
    castShadow = false;
    receiveShadow = false;

    frustumCulled = true;
    renderOrder = 0;
    userData = {};

    constructor() {
        this.children = [];
    }

    get position() { return this._position };
    set position(v: Vector3) {
        if (!this._position.equals(v)) {
            this._position.copy(v);
            if (this.localMatrixAutoUpdate) {
                this.localMatrixNeedsUpdate = true;
            }
        }
    }
    get scale() { return this._scale };
    set scale(v: Vector3) {
        if (!this._scale.equals(v)) {
            this._scale.copy(v);
            if (this.localMatrixAutoUpdate) {
                this.localMatrixNeedsUpdate = true;
            }
        }
    }

    get rotation() { return this._rotation };
    set rotation(v: Euler) {
        if (!this._rotation.equals(v)) {
            this._rotation.copy(v);
            if (this.localMatrixAutoUpdate) {
                this.localMatrixNeedsUpdate = true;
            }
        }
    }

    get quaternion() { return this._quaternion };
    set quaternion(v: Quaternion) {
        if (!this._quaternion.equals(v)) {
            this._quaternion.copy(v);
            if (this.localMatrixAutoUpdate) {
                this.localMatrixNeedsUpdate = true;
            }
        }
    }
    lookAt(x, y, z) {

        // This method does not support objects having non-uniformly-scaled parent(s)

        if (x.isVector3) {

            _target.copy(x);

        } else {

            _target.set(x, y, z);

        }

        const parent = this.parent;

        this.manuallyUpdateMatrix(true, false);

        _position.setFromMatrixPosition(this.worldMatrix);

        if ((this as any).isCamera || (this as any).isLight) {

            _m1.lookAt(_position, _target, this.up);

        } else {

            _m1.lookAt(_target, _position, this.up);

        }

        this.quaternion.setFromRotationMatrix(_m1);

        if (parent) {

            _m1.extractRotation(parent.worldMatrix);
            _q1.setFromRotationMatrix(_m1);
            this.quaternion.premultiply(_q1.invert());

        }

    }
    updateLocalMatrix(force = false) {
        if (this.localMatrixNeedsUpdate || force) {
            this.localMatrix.compose(this.position, this.quaternion, this.scale);
            this.localMatrixNeedsUpdate = false;
            if (this.worldMatrixAutoUpdate) {
                this.worldMatrixNeedsUpdate = true;
                this.updateWorldMatrix(true);
            }
        }

    }

    updateWorldMatrix(force = false) {
        if (this.localMatrixNeedsUpdate || force) {
            this.localMatrix.compose(this.position, this.quaternion, this.scale);
            this.localMatrixNeedsUpdate = false;
        }
        if (this.worldMatrixNeedsUpdate || force) {
            if (this.parent === undefined) {

                this.worldMatrix.copy(this.localMatrix);

            } else {

                this.worldMatrix.multiplyMatrices(this.parent.worldMatrix, this.localMatrix);

            }
            this.worldMatrixNeedsUpdate = false;
            force = true;
        }
        const children = this.children;

        for (let i = 0, l = children.length; i < l; i++) {

            const child = children[i];

            if (child.worldMatrixAutoUpdate === true || force === true) {

                child.updateWorldMatrix(force);

            }

        }
    }


    manuallyUpdateMatrix(updateParents = false, updateChildren = true) {
        const parent = this.parent;

        if (updateParents === true && parent !== undefined && parent.worldMatrixAutoUpdate === true) {

            parent.manuallyUpdateMatrix(true, false);

        }

        if (this.localMatrixAutoUpdate) this.updateLocalMatrix();

        if (this.parent === undefined) {

            this.worldMatrix.copy(this.localMatrix);

        } else {

            this.worldMatrix.multiplyMatrices(this.parent.worldMatrix, this.localMatrix);

        }


        if (updateChildren === true) {

            const children = this.children;

            for (let i = 0, l = children.length; i < l; i++) {

                const child = children[i];

                if (child.worldMatrixAutoUpdate === true) {

                    child.manuallyUpdateMatrix(false, true);

                }

            }

        }
    }

    add(objects: Object3D[]) {
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            if (object === this) {

                console.error('Object3D.add: object can\'t be added as a child of itself.', object);
                return this;

            }
            if (object && object.isObject3D) {

                if (object.parent !== undefined) {

                    object.parent.remove([object]);

                }

                object.parent = this;
                this.children.push(object);

            } else {

                console.error('Object3D.add: object not an instance of Object3D.', object);

            }
        }
    }

    remove(objects: Object3D[]) {
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            const index = this.children.indexOf(object);

            if (index !== - 1) {

                object.parent = undefined;
                this.children.splice(index, 1);

            }
        }

        return this;
    }

    removeFromParent() {

        const parent = this.parent;

        if (parent !== undefined) {

            parent.remove([this]);

        }

        return this;

    }

    clear() {

        for (let i = 0; i < this.children.length; i++) {

            const object = this.children[i];

            object.parent = undefined;


        }

        this.children.length = 0;

        return this;


    }

    traverse(callback) {

        callback(this);

        const children = this.children;

        for (let i = 0, l = children.length; i < l; i++) {

            children[i].traverse(callback);

        }

    }

    traverseVisible(callback) {

        if (this.visible === false) return;

        callback(this);

        const children = this.children;

        for (let i = 0, l = children.length; i < l; i++) {

            children[i].traverseVisible(callback);

        }

    }

    traverseAncestors(callback) {

        const parent = this.parent;

        if (parent !== null) {

            callback(parent);

            parent.traverseAncestors(callback);

        }

    }
}
const _v1 = /*@__PURE__*/ new Vector3();
const _q1 = /*@__PURE__*/ new Quaternion();
const _m1 = /*@__PURE__*/ new Matrix4();
const _target = /*@__PURE__*/ new Vector3();

const _position = /*@__PURE__*/ new Vector3();
const _scale = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();