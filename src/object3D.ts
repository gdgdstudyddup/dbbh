export class Object3D {
    uuid:string;
    tag:string;
    children: Object3D[];
    addObject(object: Object3D) {
        this.children.push(object);
        // object.updateSomeInfomation
    }
    removeObject(object: Object3D) {
        // do something such as follow
        // transform = object.getWorldTransform
        // remove from this.children
        // object.setTransform(transform)
    }
}