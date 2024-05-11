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

    vec3 pos = vec3(world * vec4(position, 1.0));
    vec3 norm = inverse(transpose(mat3(world))) * normal;
    
    for (int i = 0; i < num_lights; i++) {
        vec3 light_dir = normalize(light_positions[i] - pos);

        vec3 N = normalize(norm);

        vec3 L = normalize(light_dir);

 

        // Final diffuse

        vec3 diffuse = light_colors[i] * max(dot(N, L), 0.0);

 

        vec3 view_dir = normalize(camera_position - pos);

        vec3 R = normalize(2.0 * dot(N, L) * N - L);



        // Final specular

        vec3 specular = light_colors[i] * pow(max(dot(R, view_dir), 0.0), mat_shininess);

 

        diffuse_illum += diffuse;

        specular_illum += specular;

    }

 

    // Pass vertex texcoord onto the fragment shader

    model_uv = uv * texture_scale;

 

    // Transform and project vertex from 3D world-space to 2D screen-space

    gl_Position = projection * view * world * vec4(position, 1.0);

}
