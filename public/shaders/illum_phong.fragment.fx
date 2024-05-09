#version 300 es
precision mediump float;

// Input
in vec3 model_position;
in vec3 model_normal;
in vec2 model_uv;

// Uniforms
// material
uniform vec3 mat_color;
uniform vec3 mat_specular;
uniform float mat_shininess;
uniform sampler2D mat_texture;
// camera
uniform vec3 camera_position;
// lights
uniform vec3 ambient; // Ia
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec4 FragColor;

void main() {

    vec3 diffuse_illum = vec3(0.0, 0.0, 0.0);

    vec3 specular_illum = vec3(0.0, 0.0, 0.0);

    for (int i = 0; i < num_lights; i++) {
        vec3 light_dir = normalize(light_positions[i] - model_position);
        
        vec3 N = model_normal;

        vec3 L = normalize(light_dir);

        vec3 diffuse = light_colors[i] * max(dot(N, L), 0.0);

        vec3 view_dir = normalize(camera_position - model_position);

        vec3 R = normalize(2.0 * dot(N, L) * N - L);

        vec3 specular = light_colors[i] * pow(max(dot(R, view_dir), 0.0), mat_shininess);


        diffuse_illum += diffuse;

        specular_illum += specular;
    }

    vec3 model_color = mat_color * texture(mat_texture, model_uv).rgb;



    // Color
    FragColor = vec4(model_color * diffuse_illum + specular_illum * mat_specular + ambient, 1.0);
}
