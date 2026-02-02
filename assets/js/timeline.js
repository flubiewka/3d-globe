import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000020);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(6, 2, 4);
scene.add(cube);

const points = [];
points.push(new THREE.Vector3(0, 0, 0));
points.push(new THREE.Vector3(3, 1, 2));
points.push(new THREE.Vector3(6, 2, 4));
points.push(new THREE.Vector3(9, 1, 6));
points.push(new THREE.Vector3(12, 3, 8));

const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 5 });
const line = new THREE.Line(geometry, material);
scene.add(line);

points.forEach((point) => {
    const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.copy(point);
    scene.add(sphere);
});

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
