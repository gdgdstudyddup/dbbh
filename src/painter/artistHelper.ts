import { Object3D } from "../Object3D";
import { Cluster } from "./drawcall/DrawCall";

/* 
    dynamic object which has cluster Tag in some case, it will be observed some frames then it will be put into cluster objects. 
    keep in mind cluster is an opaque object.
    analyze the draw call list and collect the objects could be render as cluster. 
    when we generate the big buffer, during the process, we could store the offset and the bounding box information.
    if some object has been delete, we first hide it, put it into rCandidates ,then 10s ago or some other strategy, we delete it really.
    if max memory has been touch, latest recently used object will be remove all. rest of things will be paint in normal method. and the re-generate operation should not been execute frequently.
    i thought it can be execute every five seconds or ten. and memory contains texture and vertices data.
*/
// collect cluster and do cull
export class ArtistHelper {
  device: GPUDevice;
  defaultDescriptor: GPUComputePipelineDescriptor;
  cullPipeline: GPUComputePipeline;
  ssbo: [];
  static clusterPool: Object3D[] = [];
  static candidates: Object3D[] = [];
  static rCandidates: Object3D[] = []; // r means remove
  constructor(device: GPUDevice, cullPipeline?: GPUComputePipeline) {
    this.device = device;
    this.defaultDescriptor = {
      layout: 'auto',
      compute: {
        module: device.createShaderModule({
          code: '// cull shader',
        }),
        entryPoint: 'main',
      },
    }
    this.cullPipeline = cullPipeline || this.device.createComputePipeline(this.defaultDescriptor);
    // init ssbo resize it into 50M or 1G  to be continue. may be can read it from json config file.
  }
  // pre op
  process(hall: Object3D) {

    /* traverse and pick which ('cluster' === tag) into clusterPool; and do matrix update work.
      if object state is  clean  do classification put it into where it should be. and set state such as alreadyInClusterPool.
      if object state is  alreadyInClusterPool then continue;
      if is normal object do classification put in opaque queue or transparent queue for paint.
    */
  }

  maintainClusterPool() {

  }

  // pre op
  classification() {
    // collect things should be cluster
  }

  //------------------parameters may be wrong check it later.-----------------------------------------------------------
  // render op 
  sort(clusters: Cluster[]) {

  }

  // render op how to do it in gpu driven?????????????????????????????????????
  cullCluster(clusters: Cluster[]): Cluster[] {
    return []; // it is a ssbo result
  }

  // render op
  cull(objects: Object3D): Object3D[] {
    return [];
  }
}