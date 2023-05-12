import { Object3D } from "../3d/Object3D";
import { Hall } from "../3d/Hall";
import { DrawCallList } from "./drawcall/DrawCall";
import { ClusterMaintainer, ClusterStruct } from "./maintainer/ClusterMaintainer";
import { Mesh } from "../3d/Mesh";
import { Camera } from "../3d/camera/Camera";

/* 
    dynamic object which has cluster Tag in some case, it will be observed some frames then it will be put into cluster objects. 
    keep in mind cluster is an opaque object.
    analyze the draw call list and collect the objects could be render as cluster. 
    when we generate the big buffer, during the process, we could store the offset and the bounding box information.
    if some object has been delete, we first hide it, put it into rCandidates ,then 10s ago or some other strategy, we delete it really.
    if max memory has been touch, latest recently used object will be remove all. rest of things will be paint in normal method. and the re-generate operation should not been execute frequently.
    i thought it can be execute every five seconds or ten. and memory contains texture and vertices data.
*/
//collect cluster and do cull
export class ArtistHelper {
  device: GPUDevice;
  defaultDescriptor: GPUComputePipelineDescriptor;
  cullPipeline: GPUComputePipeline;
  clusterMaintainer = new ClusterMaintainer();
  activeCamera: Camera;
  static clusterPool: Object3D[] = [];
  static candidates: Object3D[] = [];
  static rCandidates: Object3D[] = []; // r means remove
  constructor(device: GPUDevice, cullPipeline?: GPUComputePipeline) {
    this.device = device;
    this.defaultDescriptor = {
      layout: 'auto',
      compute: {
        module: device.createShaderModule({
          code: this.defaultCullShaderCode(),
        }),
        entryPoint: 'computeCull',
      },
    }
    this.cullPipeline = cullPipeline || this.device.createComputePipeline(this.defaultDescriptor);
    const input = new Uint32Array(16); // minimal size is 64 byte
    const output = new Uint32Array(16);
    const count = new Uint32Array(16);
    const inputBuffer = device.createBuffer({
      label: 'input buffer',
      size: input.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });

    const outputBuffer = device.createBuffer({
      label: 'output buffer',
      size: output.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    const countBuffer = device.createBuffer({
      label: 'count buffer',
      size: count.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });

    // Copy our input data to that buffer
    device.queue.writeBuffer(inputBuffer, 0, input);
    const bindGroup = device.createBindGroup({
      label: 'bindGroup for cull',
      layout: this.cullPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: inputBuffer } },
        { binding: 1, resource: { buffer: outputBuffer } },
        { binding: 2, resource: { buffer: countBuffer } },
      ],
    });

    // init ssbo resize it into 50M or 1G  to be continue. may be can read it from json config file.
  }
  defaultCullShaderCode() {
    return `// cull shader
    struct ClusterStruct
    {
      ssml: vec4f,
      min: vec4f,
      max: vec4f,
      custom: vec4f,
    };
    struct CountStruct {
      count: atomic<u32>
    };
    @group(0) @binding(0) var<storage, read_write> inputClusters: array<ClusterStruct>;
    @group(0) @binding(1) var<storage, read_write> outputClusters: array<ClusterStruct>;
    @group(0) @binding(2) var<storage, read_write> clusterCount: CountStruct;

  @compute @workgroup_size(1) fn computeCull(
    @builtin(global_invocation_id) id: vec3<u32>
  ) {
    let count = atomicLoad(&clusterCount.count);
    let cluster = inputClusters[id.x];
    let levelPass = true;
    let frustumPass = true;
    let ocPass = true;
    if(frustumPass && ocPass && levelPass) {
      outputClusters[count] = cluster;
      atomicAdd(&clusterCount.count, 1);
    }
  }
    `;
  }
  // pre op
  async process(hall: Hall) {
    this.activeCamera = hall.mainCamera;
    // now we just do it  its update part
    hall.updateWorldMatrix(); // TODO it should be changed to  update object only who has been modify some stuff such as position.
    /* traverse and pick which ('cluster' === tag) into clusterPool; and do matrix update work.
      if object state is  clean  do classification put it into where it should be. and set state such as alreadyInClusterPool.
      if object state is  alreadyInClusterPool then continue;
      if is normal object do classification put in opaque queue or transparent queue for paint.
    */
    const drawCallList = new DrawCallList();
    drawCallList.transparent = [];
    drawCallList.opaque = [];
    const clusterArray: Mesh[] = []
    hall.traverse((object) => {
      if (object.tag === 'cluster') {
        clusterArray.push(object);
      } else if (object.material.transparent) {
        drawCallList.transparent.push(object)
      } else {
        drawCallList.opaque.push(object);
      }
    });
    const { clusters, vertexBuffer, outOfMemoryObjects } = this.clusterMaintainer.maintain(clusterArray);

    drawCallList.vertexBuffer = vertexBuffer;
    drawCallList.clusters = clusters;
    drawCallList.opaque.push(...outOfMemoryObjects);
    await this.cull(drawCallList);
    return drawCallList;
  }
  getBufferFromClusterStructs(clusters: ClusterStruct[]) {

  }
  // pre op
  classification() {
    // collect things should be cluster
  }

  //------------------parameters may be wrong check it later.-----------------------------------------------------------
  // render op 
  sort(clusters: ClusterStruct[]) {

  }

  // render op how to do it in gpu driven?????????????????????????????????????
  async cullCluster(clusters: ClusterStruct[]) {
    return []; // it is a ssbo result
  }

  // render op
  async cull(drawCallList: DrawCallList) {
    // use ssbo A(clusters array) as input use ssbo B(culled and simplify cluster array, remove box3, only have information of map )  as output
    return [];
  }
}