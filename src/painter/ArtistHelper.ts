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
  defaultBindGroup: GPUBindGroup;
  defaultCullPipeline: GPUComputePipeline;
  clusterMaintainer = new ClusterMaintainer();
  activeCamera: Camera;
  needToResize = false; // it will be changed when clusters change.
  static clusterPool: Object3D[] = [];
  static candidates: Object3D[] = [];
  static rCandidates: Object3D[] = []; // r means remove
  constructor(device: GPUDevice, defaultCullPipeline?: GPUComputePipeline) {
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
    this.defaultCullPipeline = defaultCullPipeline || this.device.createComputePipeline(this.defaultDescriptor);
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
    const { clusters, inputBuffer, outputBuffer, vertexBuffer, outOfMemoryObjects } = this.clusterMaintainer.maintain(clusterArray);
    //TODO!! set needToResize here.

    drawCallList.vertexBuffer = vertexBuffer;
    drawCallList.clusters = clusters;
    drawCallList.opaque.push(...outOfMemoryObjects);
    await this.cull(drawCallList, inputBuffer, outputBuffer);
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
  async cull(drawCallList: DrawCallList, input: Float32Array, output: Float32Array) {
    // use ssbo A(clusters array) as input use ssbo B(culled and simplify cluster array, remove box3, only have information of map )  as output
    const device = this.device;
    const storageBufferSize = 64; // vec4 * 4 * 4
    if ((input.length > 0 && this.defaultBindGroup === undefined) || this.needToResize) {
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
      this.defaultBindGroup = device.createBindGroup({
        label: 'bindGroup for cull',
        layout: this.defaultCullPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: inputBuffer } },
          { binding: 1, resource: { buffer: outputBuffer } },
          { binding: 2, resource: { buffer: countBuffer } },
        ],
      });

      const encoder = device.createCommandEncoder({
        label: 'culling encoder',
      });
      const pass = encoder.beginComputePass({
        label: 'culling compute pass',
      });
      pass.setPipeline(this.defaultCullPipeline);
      pass.setBindGroup(0, this.defaultBindGroup);
      const tmp = input.byteLength / storageBufferSize;
      const dispatchCount = Math.floor(tmp / 256) + 1;
      pass.dispatchWorkgroups(dispatchCount);
      pass.end();

      const resultBuffer = device.createBuffer({
        label: 'result buffer',
        size: count.byteLength,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
      });
      // Encode a command to copy the results to a mappable buffer.
      encoder.copyBufferToBuffer(countBuffer, 0, resultBuffer, 0, resultBuffer.size);

      // Finish encoding and submit the commands
      const commandBuffer = encoder.finish();
      device.queue.submit([commandBuffer]);

      await resultBuffer.mapAsync(GPUMapMode.READ);
      const result = new Uint32Array(resultBuffer.getMappedRange().slice(0));
      resultBuffer.unmap();

      console.log('zero', count);
      console.log('cull result', result);
      drawCallList.clustersBuffer = outputBuffer;
    }
    return [];
  }
}