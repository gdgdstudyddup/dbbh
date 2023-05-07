import { Object3D } from "../3d/Object3D";
import { Hall } from "../3d/Hall";
import { Cluster, DrawCallList } from "./drawcall/Drawcall";

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
  ssbo: Float32Array;
  static clusterPool: Object3D[] = [];
  static candidates: Object3D[] = [];
  static rCandidates: Object3D[] = []; // r means remove
  constructor(device: GPUDevice, cullPipeline?: GPUComputePipeline) {
    this.device = device;
    this.defaultDescriptor = {
      layout: 'auto',
      compute: {
        module: device.createShaderModule({
          code: `// cull shader
          @group(0) @binding(0) var<storage, read_write> data: array<f32>;
  
        @compute @workgroup_size(1) fn computeSomething(
          @builtin(global_invocation_id) id: vec3<u32>
        ) {
          let i = id.x;
          data[i] = data[i] * 2.0;
        }
          `,
        }),
        entryPoint: 'main',
      },
    }
    // this.cullPipeline = cullPipeline || this.device.createComputePipeline(this.defaultDescriptor);
    // init ssbo resize it into 50M or 1G  to be continue. may be can read it from json config file.
  }
  // pre op
  process(hall: Hall) {
    const camera = hall.mainCamera;
    /* traverse and pick which ('cluster' === tag) into clusterPool; and do matrix update work.
      if object state is  clean  do classification put it into where it should be. and set state such as alreadyInClusterPool.
      if object state is  alreadyInClusterPool then continue;
      if is normal object do classification put in opaque queue or transparent queue for paint.
    */
    return new DrawCallList();
  }

  maintainClusterPool() {
    const device = this.device;
    const input = new Float32Array([1, 3, 5]);
    const workBuffer = device.createBuffer({
      label: 'work buffer',
      size: input.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    // Copy our input data to that buffer
    device.queue.writeBuffer(workBuffer, 0, input);
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