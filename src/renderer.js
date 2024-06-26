import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { CreateCylinder } from '@babylonjs/core';
import { CreateIcoSphere } from '@babylonjs/core';
import { CreateHemisphere } from '@babylonjs/core';
import { VertexData } from '@babylonjs/core';
import { Mesh } from '@babylonjs/core';
import { MeshBuilder } from '@babylonjs/core';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { KeyboardEventTypes } from '@babylonjs/core';

const BASE_URL = import.meta.env.BASE_URL || '/';

class Renderer {
    constructor(canvas, engine, material_callback, ground_mesh_callback) {
        this.canvas = canvas;
        this.engine = engine;
        this.scenes = [
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.1, 0.1, 0.1, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(1.0, 1.0, 1.0, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(1.0, 1.0, 1.0, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.3, 0.3, 0.3),
                lights: [],
                models: []
            }
        ];
        this.active_scene = 0;
        this.active_light = 0;
        this.shading_alg = 'gouraud';

        this.scenes.forEach((scene, idx) => {
            scene.materials = material_callback(scene.scene);
            scene.ground_mesh = ground_mesh_callback(scene.scene, scene.ground_subdivisions);
            this['createScene'+ idx](idx);
        });
    }

    createScene0(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture(BASE_URL + 'heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.65, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.1, 0.1, 0.1),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];
        
        // Create other models
        let sphere = CreateSphere('sphere', {segments: 32}, scene);
        sphere.position = new Vector3(1.0, 0.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);

        let box = CreateBox('box', {width: 2, height: 1, depth: 1}, scene);
        box.position = new Vector3(-1.0, 0.5, 2.0);
        box.metadata = {
            mat_color: new Color3(0.75, 0.15, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        box.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(box);
        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.event.key) {
                case "a":
                    current_scene.lights[this.active_light].position.x -= 1;
                    break;
                case "d":
                    current_scene.lights[this.active_light].position.x += 1;
                    break;
                case "f":
                    current_scene.lights[this.active_light].position.y -= 1;
                    break;
                case "r":
                    current_scene.lights[this.active_light].position.y += 1;
                    break;
                case "w":
                    current_scene.lights[this.active_light].position.z -= 1;
                    break;
                case "s":
                    current_scene.lights[this.active_light].position.z += 1;
                    break;
            }  
        });

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    createScene1(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create light0
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 0.0, 0.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        // Create light1
        let light1 = new PointLight('light1', new Vector3(0.0, 4.0, 0.0), scene);
        light1.diffuse = new Color3(0.56, 0.56, 0.91);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        // Create light2
        let light2 = new PointLight('light2', new Vector3(2.0, 3.0, 3.0), scene);
        light2.diffuse = new Color3(0.1, 1.0, 0.1);
        light2.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light2);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture(BASE_URL + 'heightmaps/iceland.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.5, 0.5, 0.5),
            mat_texture: white_texture,
            mat_specular: new Color3(0.3, 0.3, 0.3),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];
        
        // Create other models
        let cyl = CreateCylinder('cylinder', {tessellation: 32}, scene);
        cyl.position = new Vector3(1.0, 1.0, 3.0);
        cyl.metadata = {
            mat_color: new Color3(0.7, 0.7, 0.7),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        cyl.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(cyl);

        let ico = CreateIcoSphere('icosphere', {subdivisions: 1, radius: 0.6}, scene);
        ico.position = new Vector3(1.0, 2.5, 3.0);
        ico.metadata = {
            mat_color: new Color3(0.7, 0.7, 0.7),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        ico.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(ico);

        let hemi = CreateHemisphere('hemisphere', {segments: 32, diameter: 4.0}, scene);
        hemi.position = new Vector3(-5.0, 0.0, 5.0);
        hemi.metadata = {
            mat_color: new Color3(1.0, 0.1, 1.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.7, 0.7, 0.7),
            mat_shininess: 6,
            texture_scale: new Vector2(1.0, 1.0)
        }
        hemi.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(hemi);

        // Create custom parent mesh
        let cust = new Mesh("custom", scene);

        // Define vertices
        let vertices = [
            new Vector3(-1, -1, -1),
            new Vector3(1, -1, -1),
            new Vector3(1, 1, -1),
            new Vector3(-1, 1, -1),
            new Vector3(-1, -1, 1),
            new Vector3(1, -1, 1),
            new Vector3(1, 1, 1),
            new Vector3(-1, 1, 1)
        ];
        
        // Define indices
        let indices = [
            0, 1, 1, 2, 2, 3, 3, 0, // Front face
            4, 5, 5, 6, 6, 7, 7, 4, // Back face
            0, 4, 1, 5, 2, 6, 3, 7  // Connecting edges
        ];
        
        // Create VertexData
        let vertexData = new VertexData();
        
        vertexData.positions = vertices.flatMap(vertex => [vertex.x, vertex.y, vertex.z]);
        vertexData.indices = indices;
        vertexData.applyToMesh(cust);

        cust.position = new Vector3(-4.0, 3.0, -4.0);
        
        // Create material
        cust.metadata = {
            mat_color: new Color3(1.0, 0.0, 0.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.9, 0.9, 0.9),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        cust.material = materials['illum_' + this.shading_alg];

        // Make lines frame
        let lines = MeshBuilder.CreateLineSystem("lines", {lines: indices}, scene);

        // Set parent to lines mesh
        lines.parent = cust;

        // Create rectangular prisms connecting the edges
        for (let i = 0; i < indices.length; i += 2) {
            let p1 = vertices[indices[i]];
            let p2 = vertices[indices[i + 1]];

            let length = Vector3.Distance(p1, p2);
            let direction = p2.subtract(p1);
            let center = p1.add(direction.scale(0.5));

            let box = MeshBuilder.CreateBox("box", {size: length, width: 0.2, height: 0.2}, scene);
            box.position = center;
            box.lookAt(p2);
            box.parent = cust;
        }
        current_scene.models.push(cust);
        
        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.event.key) {
                case "a":
                    current_scene.lights[this.active_light].position.x -= 1;
                    break;
                case "d":
                    current_scene.lights[this.active_light].position.x += 1;
                    break;
                case "f":
                    current_scene.lights[this.active_light].position.y -= 1;
                    break;
                case "r":
                    current_scene.lights[this.active_light].position.y += 1;
                    break;
                case "w":
                    current_scene.lights[this.active_light].position.z -= 1;
                    break;
                case "s":
                    current_scene.lights[this.active_light].position.z += 1;
                    break;
            }  
        });
        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }
    createScene2(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create light0 - White Light
        let light0 = new PointLight('light0', new Vector3(1.0, 5.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0); // White light
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let turf_texture = new Texture(BASE_URL + 'textures/field.jpg', scene);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture(BASE_URL + 'heightmaps/mulch-heightmap.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(1, 1, 1),
            mat_texture: turf_texture,
            mat_specular: Color3.Black(),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }

        ground_mesh.material = materials['ground_' + this.shading_alg];
        
            // Create stacked spheres
        let sphere1 = CreateSphere('sphere1', { segments: 32, diameter: 1 }, scene);
        sphere1.position = new Vector3(0, 0.5, 0); // Position at the center
        sphere1.metadata = {
            mat_color: new Color3(1, 1, 1), // Red
            mat_texture: new Texture(BASE_URL + 'textures/balldimpled.jpg', scene),
            mat_specular: new Color3(0.2, 0.2, 0.2),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere1.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere1);

        let sphere2 = CreateSphere('sphere2', { segments: 32, diameter: 1 }, scene);
        sphere2.position = new Vector3(0, 1.5, 0); // Position above the first sphere
        sphere2.metadata = {
            mat_color: new Color3(1, 1, 1), // Green
            mat_texture: new Texture(BASE_URL + 'textures/baseball.jpg', scene),
            mat_specular: new Color3(0.1, 0.1, 0.1),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere2.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere2);

        let sphere3 = CreateSphere('sphere3', { segments: 32, diameter: 1 }, scene);
        sphere3.position = new Vector3(0, 2.5, 0); // Position above the second sphere
        sphere3.metadata = {
            mat_color: new Color3(1, 1, 1), // Blue
            mat_texture: new Texture(BASE_URL + 'textures/futbol.jpg', scene),
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        //cust.material = materials['illum_' + this.shading_alg];
        //current_scene.models.push(cust);

        // Animation function - called before each cust gets rendered
        sphere3.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere3);


        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.event.key) {
                case "a":
                    current_scene.lights[this.active_light].position.x -= 1;
                    break;
                case "d":
                    current_scene.lights[this.active_light].position.x += 1;
                    break;
                case "f":
                    current_scene.lights[this.active_light].position.y -= 1;
                    break;
                case "r":
                    current_scene.lights[this.active_light].position.y += 1;
                    break;
                case "w":
                    current_scene.lights[this.active_light].position.z -= 1;
                    break;
                case "s":
                    current_scene.lights[this.active_light].position.z += 1;
                    break;
            }  
        });
        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }
    createScene3(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create light0 - White Light
        let light0 = new PointLight('light0', new Vector3(1.0, 5.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0); // White light
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let turf_texture = new Texture(BASE_URL + 'textures/field.jpg', scene);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture(BASE_URL + 'heightmaps/mulch-heightmap.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(1, 1, 1),
            mat_texture: turf_texture,
            mat_specular: Color3.Black(),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }

        ground_mesh.material = materials['ground_' + this.shading_alg];
        
            // Create stacked spheres
        let sphere1 = CreateSphere('sphere1', { segments: 32, diameter: 1 }, scene);
        sphere1.position = new Vector3(0, 0.5, 0); // Position at the center
        sphere1.metadata = {
            mat_color: new Color3(1, 1, 1), // Red
            mat_texture: new Texture(BASE_URL + 'textures/balldimpled.jpg', scene),
            mat_specular: new Color3(0.2, 0.2, 0.2),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere1.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere1);

        let sphere2 = CreateSphere('sphere2', { segments: 32, diameter: 1 }, scene);
        sphere2.position = new Vector3(0, 1.5, 0); // Position above the first sphere
        sphere2.metadata = {
            mat_color: new Color3(1, 1, 1), // Green
            mat_texture: new Texture(BASE_URL + 'textures/baseball.jpg', scene),
            mat_specular: new Color3(0.1, 0.1, 0.1),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere2.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere2);

        let sphere3 = CreateSphere('sphere3', { segments: 32, diameter: 1 }, scene);
        sphere3.position = new Vector3(0, 2.5, 0); // Position above the second sphere
        sphere3.metadata = {
            mat_color: new Color3(1, 1, 1), // Blue
            mat_texture: new Texture(BASE_URL + 'textures/futbol.jpg', scene),
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        //cust.material = materials['illum_' + this.shading_alg];
        //current_scene.models.push(cust);

        // Animation function - called before each frame gets rendered
        sphere3.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere3);


        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.event.key) {
                case "a":
                    current_scene.lights[this.active_light].position.x -= 1;
                    break;
                case "d":
                    current_scene.lights[this.active_light].position.x += 1;
                    break;
                case "f":
                    current_scene.lights[this.active_light].position.y -= 1;
                    break;
                case "r":
                    current_scene.lights[this.active_light].position.y += 1;
                    break;
                case "w":
                    current_scene.lights[this.active_light].position.z -= 1;
                    break;
                case "s":
                    current_scene.lights[this.active_light].position.z += 1;
                    break;
            }  
        });
        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    

    updateShaderUniforms(scene_idx, shader) {
        let current_scene = this.scenes[scene_idx];
        shader.setVector3('camera_position', current_scene.camera.position);
        shader.setColor3('ambient', current_scene.scene.ambientColor);
        shader.setInt('num_lights', current_scene.lights.length);
        let light_positions = [];
        let light_colors = [];
        current_scene.lights.forEach((light) => {
            light_positions.push(light.position.x, light.position.y, light.position.z);
            light_colors.push(light.diffuse);
        });
        shader.setArray3('light_positions', light_positions);
        shader.setColor3Array('light_colors', light_colors);
    }

    getActiveScene() {
        return this.scenes[this.active_scene].scene;
    }
    
    setActiveScene(idx) {
        this.active_scene = idx;
    }

    setShadingAlgorithm(algorithm) {
        this.shading_alg = algorithm;

        this.scenes.forEach((scene) => {
            let materials = scene.materials;
            let ground_mesh = scene.ground_mesh;

            ground_mesh.material = materials['ground_' + this.shading_alg];
            scene.models.forEach((model) => {
                model.material = materials['illum_' + this.shading_alg];
            });
        });
    }

    setHeightScale(scale) {
        this.scenes.forEach((scene) => {
            let ground_mesh = scene.ground_mesh;
            ground_mesh.metadata.height_scalar = scale;
        });
    }

    setActiveLight(idx) {
        console.log(idx);
        this.active_light = idx;
    }
}

export { Renderer }
