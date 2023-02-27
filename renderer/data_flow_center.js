import { bunny_buffer_geometry } from '../assets/bunny.js'
class DataFlowCenter {
    constructor() {

    }
    get_data(parameter) { // get the formality format data.
        const data = {
            position:bunny_buffer_geometry.data.attributes.position.array,
            index: bunny_buffer_geometry.data.index.array,
        }
        console.log(data);
        return data;
    }
    // get_shadow_data() maybe only set some parameter is enough just like main camera lod level 
}
export const data_flow_center = new DataFlowCenter();