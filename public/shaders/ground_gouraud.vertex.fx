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
uniform float mat_shininess;
uniform vec2 texture_scale;
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


    // Get initial position of vertex (prior to height displacement)
    vec3 world_pos = (world * vec4(position, 1.0)).xyz;

    // Pass diffuse and specular illumination onto the fragment shader
    diffuse_illum = vec3(0.0, 0.0, 0.0);
    specular_illum = vec3(0.0, 0.0, 0.0);
    

    vec3 neighbor1 = vec3(world_pos.x + 0.1, world_pos.y, world_pos.z);
    vec2 neighbor1UV = uv;
    neighbor1UV.x += 0.1;

    vec3 neighbor2 = vec3(world_pos.x, world_pos.y, world_pos.z + 0.1);
    vec2 neighbor2UV = uv;
    neighbor2UV.y += 0.1;

    world_pos.y += 2.0 * height_scalar * (texture(heightmap, uv).r - 0.5);

    neighbor1.y += 2.0 * height_scalar * (texture(heightmap, neighbor1UV).r - 0.5);

    neighbor2.y += 2.0 * height_scalar * (texture(heightmap, neighbor2UV).r - 0.5);

    vec3 tangent = neighbor1 - world_pos;
    vec3 bitangent = neighbor2 - world_pos;
    vec3 normal = cross(tangent, bitangent);


    for(int i=0; i<num_lights; i++){

        vec3 light_dir = normalize(light_positions[i] - position);

        vec3 N = normalize(normal);

        vec3 L = normalize(light_dir);

        vec3 diffuse = light_colors[i] * max(dot(N, L), 0.0);


        vec3 view_dir = normalize(camera_position - position);

        vec3 R = normalize(2.0 * dot(N, L) * N - L);


        vec3 specular = light_colors[i] * pow(max(dot(R, view_dir), 0.0), mat_shininess);


        diffuse_illum += diffuse;

        specular_illum += specular;

    }
    
    // Pass vertex texcoord onto the fragment shader
    model_uv = uv * texture_scale;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * vec4(world_pos, 1.0);
}

