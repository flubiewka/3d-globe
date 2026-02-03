import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene;
let camera;
let renderer;
let globe;
let moon;
let sun;
let controls;
let pointsGroup;

function createScene() {
    scene = new THREE.Scene();
}

function createCamera() {
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        2000,
    );
    camera.position.x = 0;
    camera.position.y = 3;
    camera.position.z = 6;
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
}

function createStars() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let i = 0; i < 15000; i++) {
        positions.push(
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000,
        );
        const brightness = 0.5 + Math.random() * 0.5;
        colors.push(brightness, brightness, brightness);
    }

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
}

function createSun() {
    const loader = new THREE.TextureLoader();
    const geometry = new THREE.SphereGeometry(6, 64, 64);
    const material = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                float viewAngle = dot(vNormal, normalize(-vPosition));
                float intensity = pow(0.1 - viewAngle, 7.0);
                gl_FragColor = vec4(1.0, 0.5, 0.15, 1.0) * intensity;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
    });

    sun = new THREE.Mesh(geometry, material);
    sun.position.set(-25, 8, -20);
    scene.add(sun);

    const light = new THREE.PointLight(0xffffff, 10, 500, 0.5);
    light.position.set(-25, 8, -20);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.far = 500;
    scene.add(light);
}

function createEarth() {
    const loader = new THREE.TextureLoader();

    pointsGroup = new THREE.Group();

    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        map: loader.load("assets/textures/earth_2.jpg"),
        roughness: 0.6,
        metalness: 0.5,
    });

    globe = new THREE.Mesh(geometry, material);
    globe.receiveShadow = true;
    globe.castShadow = true;
    scene.add(globe);
    globe.add(pointsGroup);
}

function createMoon() {
    const loader = new THREE.TextureLoader();
    const geometry = new THREE.SphereGeometry(0.25, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        map: loader.load("assets/textures/moon.jpg"),
        roughness: 1,
        metalness: 0,
    });

    moon = new THREE.Mesh(geometry, material);
    moon.castShadow = true;
    moon.receiveShadow = true;
    scene.add(moon);
}

function createAtmosphere() {
    const geometry = new THREE.SphereGeometry(1.06, 64, 64);
    const material = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                float viewAngle = dot(vNormal, normalize(-vPosition));
                float intensity = pow(0.6 - viewAngle, 3.0);
                gl_FragColor = vec4(0.4, 0.7, 1.0, 1.0) * intensity;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
    });

    const atmosphere = new THREE.Mesh(geometry, material);
    scene.add(atmosphere);
}

function createLights() {
    const light = new THREE.AmbientLight(0xffffff, 0.05);
    scene.add(light);
}

function createControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
}

let moonAngle = 0;

function animate() {
    requestAnimationFrame(animate);

    moonAngle += 0.003;
    moon.position.x = Math.cos(moonAngle) * 5;
    moon.position.z = Math.sin(moonAngle) * 5;
    moon.rotation.y += 0.002;

    sun.rotation.y += 0.001;

    controls.update();
    renderer.render(scene, camera);
}

export function initScene() {
    createScene();
    createCamera();
    createRenderer();
    createStars();
    createSun();
    createLights();
    createEarth();
    createMoon();
    createAtmosphere();
    createControls();
    animate();

    return { controls };
}

export { scene, camera, renderer, globe, pointsGroup };
