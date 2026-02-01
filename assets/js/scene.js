import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
);
export const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
});
export const pointsGroup = new THREE.Group();
export let globe;

export function initScene() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    camera.position.z = 2.5;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const loader = new THREE.TextureLoader();
    globe = new THREE.Mesh(
        new THREE.SphereGeometry(1, 64, 64),
        new THREE.MeshPhongMaterial({
            map: loader.load("assets/textures/earth.jpg"),
            shininess: 5,
        }),
    );
    scene.add(globe);
    globe.add(pointsGroup);

    const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.06, 64, 64),
        new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.9 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true,
        }),
    );
    scene.add(atmosphere);

    return { controls };
}
