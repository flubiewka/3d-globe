import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1.2;
controls.maxDistance = 5;

const loader = new THREE.TextureLoader();
const earthTexture = loader.load('assets/textures/earth.jpg');

const ambientLight = new THREE.AmbientLight(0x404040, 2); 
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 3);
sunLight.position.set(5, 3, 5);
scene.add(sunLight);

const sunGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sunVisual = new THREE.Mesh(sunGeometry, sunMaterial);
sunVisual.position.set(20, 12, 20);
scene.add(sunVisual);

const starGeometry = new THREE.SphereGeometry(80, 64, 64);
const starMaterial = new THREE.MeshBasicMaterial({
    map: loader.load('https://unpkg.com/three-globe/example/img/night-sky.png'),
    side: THREE.BackSide
});
const stars = new THREE.Mesh(starGeometry, starMaterial);
scene.add(stars);

const geometry = new THREE.SphereGeometry(1, 64, 64);
const material = new THREE.MeshPhongMaterial({ 
    map: earthTexture,
    shininess: 15,
    bumpMap: earthTexture,
    bumpScale: 0.05,
    specular: new THREE.Color('grey')
});
const globe = new THREE.Mesh(geometry, material);
scene.add(globe);

const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
const cloudMaterial = new THREE.MeshPhongMaterial({
    map: loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_2048.png'),
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

camera.position.z = 2.5;

let pointsGroup = new THREE.Group();
globe.add(pointsGroup);

function calcPosFromLatLng(lat, lng, radius = 1) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return {
        x: -(radius * Math.sin(phi) * Math.cos(theta)),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta)
    };
}

window.refreshData = function() {
    fetch('api/get_places.php')
        .then(res => res.json())
        .then(places => {
            const list = document.getElementById('citiesList');
            if (list) list.innerHTML = '';
            
            while(pointsGroup.children.length > 0){ 
                pointsGroup.remove(pointsGroup.children[0]); 
            }

            places.forEach(place => {
                if (list) {
                    const item = document.createElement('div');
                    item.style.cssText = 'margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #444; padding: 5px 0;';
                    item.innerHTML = `
                        <span>${place.city_name}</span>
                        <button onclick="deleteCity(${place.id})" style="background: none; border: 1px solid red; color: red; cursor: pointer; border-radius: 3px; padding: 2px 6px;">X</button>
                    `;
                    list.appendChild(item);
                }

                const pos = calcPosFromLatLng(parseFloat(place.lat), parseFloat(place.lng), 1);
                const dotGeometry = new THREE.SphereGeometry(0.015, 12, 12);
                const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const dot = new THREE.Mesh(dotGeometry, dotMaterial);
                dot.position.set(pos.x, pos.y, pos.z);
                pointsGroup.add(dot);
            });
        });
}

window.addCity = function() {
    const input = document.getElementById('cityInput');
    const city = input.value;
    if (!city) return;

    fetch('api/save_place.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: city })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            input.value = '';
            window.refreshData();
        }
    });
};

window.deleteCity = function(id) {
    fetch('api/delete_place.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then(() => window.refreshData());
};

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    globe.rotation.y += 0.0005;
    clouds.rotation.y += 0.0007;
    renderer.render(scene, camera);
}

window.refreshData();
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});