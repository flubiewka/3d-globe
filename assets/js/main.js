import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const loader = new THREE.TextureLoader();
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.set(5, 3, 5);
scene.add(sunLight);

const stars = new THREE.Mesh(
    new THREE.SphereGeometry(80, 64, 64),
    new THREE.MeshBasicMaterial({
        map: loader.load('https://unpkg.com/three-globe/example/img/night-sky.png'),
        side: THREE.BackSide
    })
);
scene.add(stars);

const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.MeshPhongMaterial({
        map: loader.load('assets/textures/earth.jpg'),
        bumpMap: loader.load('assets/textures/earth.jpg'),
        bumpScale: 0.05
    })
);
scene.add(globe);

camera.position.z = 2.5;

const pointsGroup = new THREE.Group();
globe.add(pointsGroup);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function calcPos(lat, lng) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -(Math.sin(phi) * Math.cos(theta)),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
    );
}

// Новая функция: поворот глобуса к выбранному городу
window.focusCity = function(lat, lng) {
    const pos = calcPos(lat, lng);
    // Простое наведение камеры (можно позже сделать плавную анимацию)
    controls.target.set(0, 0, 0);
    camera.lookAt(pos);
}

window.refreshData = function() {
    fetch('api/get_places.php')
        .then(res => res.json())
        .then(places => {
            const list = document.getElementById('citiesList');
            if (!list) return;
            
            list.innerHTML = '';
            while(pointsGroup.children.length > 0) pointsGroup.remove(pointsGroup.children[0]);

            places.forEach(place => {
                const item = document.createElement('div');
                item.className = 'city-item';
                item.innerHTML = `
                    <span onclick="focusCity(${place.lat}, ${place.lng})">${place.city_name}</span>
                    <button class="btn-delete" onclick="deleteCity(${place.id})">&times;</button>
                `;
                list.appendChild(item);

                const dot = new THREE.Mesh(
                    new THREE.SphereGeometry(0.015, 12, 12),
                    new THREE.MeshBasicMaterial({ color: 0xff0000 })
                );
                const pos = calcPos(parseFloat(place.lat), parseFloat(place.lng));
                dot.position.copy(pos);
                dot.userData = place;
                pointsGroup.add(dot);
            });
        });
}

window.addCity = function() {
    const input = document.getElementById('cityInput');
    if (!input.value) return;
    
    fetch('api/save_place.php', {
        method: 'POST',
        body: JSON.stringify({ city: input.value })
    }).then(() => {
        input.value = '';
        window.refreshData();
    });
}

window.deleteCity = function(id) {
    fetch('api/delete_place.php', {
        method: 'POST',
        body: JSON.stringify({ id: id })
    }).then(() => {
        const panel = document.getElementById('city-info-panel');
        if (panel) panel.style.display = 'none';
        window.refreshData();
    });
}

window.addEventListener('click', (e) => {
    if (e.target.tagName !== 'CANVAS') return; // Не кликать сквозь UI
    
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(pointsGroup.children);
    if (intersects.length > 0) {
        const data = intersects[0].object.userData;
        const panel = document.getElementById('city-info-panel');
        if (panel) {
            document.getElementById('info-name').innerText = data.city_name || 'Unknown';
            document.getElementById('info-lat').innerText = parseFloat(data.lat).toFixed(4);
            document.getElementById('info-lng').innerText = parseFloat(data.lng).toFixed(4);
            document.getElementById('info-temp').innerText = data.temp ? `${data.temp}°C` : '--°C';
            document.getElementById('info-weather-desc').innerText = data.weather_desc || '';
            panel.style.display = 'block';
        }
    }
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    globe.rotation.y += 0.0002;
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.refreshData();
animate();