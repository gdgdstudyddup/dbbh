const position_attribute_num = 0;
const transform_binding_num = 0;
const bind_group_index = 0;

export const shader_string = `
struct FragmentData {
    @builtin(position) position: vec4<f32>,
};
struct Uniforms {
    modelViewProjectionMatrix: mat4x4<f32>
};
@group(${bind_group_index}) @binding(${transform_binding_num}) var<uniform> uniforms: Uniforms;
@vertex
fn vertex_main(
    @builtin(instance_index) instanceIdx : u32,
    @builtin(vertex_index) VertexIndex : u32,
    @location(${position_attribute_num}) position: vec4<f32>,
) -> FragmentData {
    var outData: FragmentData;
    outData.position = uniforms.modelViewProjectionMatrix * position;
    //if(instanceIdx==0){outData.color = vec4<f32>(1.0,0.0,0.0,1.0);}
    return outData;
}
@fragment
fn fragment_main(data: FragmentData) -> @location(0) vec4<f32> {
    return data.position;
}
`;