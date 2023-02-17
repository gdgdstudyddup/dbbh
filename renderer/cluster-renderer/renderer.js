import { data_flow_center } from '../data_flow_center.js';
export class ClusterRenderer {
    constructor(parameter) {

    }
    render() {
        // pure data
        const data = data_flow_center.get_data();
        // compute stuff occlusion cull re-sort choose lod
        // render stuff
        // taa maybe next time? no, do it this time
        // record stuff maybe next time~
    }
}