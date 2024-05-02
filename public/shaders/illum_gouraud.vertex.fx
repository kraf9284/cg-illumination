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
uniform float mat_shininess;
// camera
uniform vec3 camera_position;
// lights
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec2 model_uv;
out vec3 diffuse_illum;
out vec3 specular_illum;

void main() {
    // Pass diffuse and specular illumination onto the fragment shader
    diffuse_illum = vec3(0.0, 0.0, 0.0);
    specular_illum = vec3(0.0, 0.0, 0.0);

    for (int i = 0; i < num_lights; i++) {
        vec3 light_dir = normalize(light_positions[i] - position);
        vec3 N = normalize(normal);
        vec3 L = normalize(light_dir;)
        float Kd = 1;

        // Final diffuse
        vec3 diffuse = light_colors[i] * Kd * dot(N, L);

        vec3 view_dir = normalize(camera_position - position);
        vec3 R = 2 * dot(N, L) * N - L;
        float Ks = 1;

        // Final specular
        specular = light_colors[i] * Ks * dot(R, view_dir) ^ mat_shininess;

        diffuse_illum += diffuse;
        specular_illum += specular;
    }

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv * texture_scale;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world * vec4(position, 1.0);
}
