#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec3 normal;
in vec2 uv;

// Uniforms
// projection 3D to 2D
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
// material
uniform vec2 texture_scale;

// Output
out vec3 model_position;
out vec3 model_normal;
out vec2 model_uv;

void main() {
    vec3 pos = vec3(world * vec4(position, 1.0));
    vec3 norm = inverse(transpose(mat3(world))) * normal;

    // Pass vertex position onto the fragment shader
    model_position = pos;
    // Pass vertex normal onto the fragment shader
    model_normal = norm;
    // Pass vertex texcoord onto the fragment shader
    model_uv = uv*texture_scale;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world * vec4(position, 1.0);;
}
