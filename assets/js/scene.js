import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000,
);
export const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
});

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

export const pointsGroup = new THREE.Group();
export let globe;
let moon, sun;

export function initScene() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    camera.position.set(0, 3, 6);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const loader = new THREE.TextureLoader();

    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
    });
    const starVertices = [];
    const starColors = [];
    for (let i = 0; i < 15000; i++) {
        starVertices.push(
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000,
        );
        const brightness = 0.5 + Math.random() * 0.5;
        starColors.push(brightness, brightness, brightness);
    }
    starGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(starVertices, 3),
    );
    starGeometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(starColors, 3),
    );
    scene.add(new THREE.Points(starGeometry, starMaterial));

    const sunPos = new THREE.Vector3(-25, 8, -20);

    sun = new THREE.Mesh(
        new THREE.SphereGeometry(3, 32, 32),
        new THREE.MeshBasicMaterial({
            map: loader.load("assets/textures/sun.jpg"),
            color: 0xffffff,
        }),
    );
    sun.position.copy(sunPos);
    scene.add(sun);

    const sunLight = new THREE.PointLight(0xffffff, 10, 500, 0.5);
    sunLight.position.copy(sunPos);
    sunLight.castShadow = true;

    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.far = 500;
    scene.add(sunLight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.05));

    globe = new THREE.Mesh(
        new THREE.SphereGeometry(1, 64, 64),
        new THREE.MeshStandardMaterial({
            map: loader.load("assets/textures/earth_2.jpg"),
            roughness: 0.8,
            metalness: 0.2,
        }),
    );
    globe.receiveShadow = true;
    globe.castShadow = true;
    scene.add(globe);
    globe.add(pointsGroup);

    moon = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 32, 32),
        new THREE.MeshStandardMaterial({
            map: loader.load("assets/textures/moon.jpg"),
            roughness: 1,
            metalness: 0,
        }),
    );
    moon.castShadow = true;
    moon.receiveShadow = true;
    scene.add(moon);

    const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.06, 64, 64),
        new THREE.ShaderMaterial({
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
        }),
    );
    scene.add(atmosphere);

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
    animate();

    return { controls };
}
