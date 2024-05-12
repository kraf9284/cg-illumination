#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec2 uv;

// Uniforms
// projection 3D to 2D
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
// height displacement
uniform vec2 ground_size;
uniform float height_scalar;
uniform sampler2D heightmap;
// material
uniform vec2 texture_scale;

// Output
out vec3 model_position;
out vec3 model_normal;
out vec2 model_uv;

void main() {
    // Get initial position of vertex (prior to height displacement)
    vec3 world_pos = (world * vec4(position, 1.0)).xyz;

    vec3 neighbor1 = vec3(world_pos.x + 0.1, world_pos.y, world_pos.z);
    vec2 neighbor1UV = uv;
    neighbor1UV.x += 0.1 / ground_size.x;

    vec3 neighbor2 = vec3(world_pos.x, world_pos.y, world_pos.z + 0.1);
    vec2 neighbor2UV = uv;
    neighbor2UV.y += 0.1 / ground_size.y;

    world_pos.y += 2.0 * height_scalar * (texture(heightmap, uv).r - 0.5);

    neighbor1.y += 2.0 * height_scalar * (texture(heightmap, neighbor1UV).r - 0.5);

    neighbor2.y += 2.0 * height_scalar * (texture(heightmap, neighbor2UV).r - 0.5);

    vec3 tangent = neighbor1 - world_pos;
    vec3 bitangent = neighbor2 - world_pos;
    vec3 normal = cross(tangent, bitangent);

    model_normal = normalize(normal);
    // Pass vertex texcoord onto the fragment shader
    model_uv = uv*texture_scale;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * vec4(world_pos, 1.0);
}
