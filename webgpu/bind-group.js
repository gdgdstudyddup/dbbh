export class BindGroup {
    constructor(device, { buffer_descriptor, bind_group_layout, offset, size, binding }) {
        const buffer = device.createBuffer(buffer_descriptor);
        const buffer_resource = {
            buffer: buffer,
            offset: offset,
            size: size
        };
        const buffer_bind_group_entry = {
            binding: binding,
            resource: buffer_resource
        };
        const bind_group_descriptor = {
            layout: bind_group_layout,
            entries: [buffer_bind_group_entry]
        };
        this.bind_buffer = buffer;
        this.resource = device.createBindGroup(bind_group_descriptor);
    }
}