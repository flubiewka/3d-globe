import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export async function refreshData() {
    const response = await fetch("api/get_places.php");
    const places = await response.json();

    if (!places || places.length === 0) return;

    console.log("Загруженные места:", places);
    return places;
}

async function initializeScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000020);

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );
    camera.position.set(-5, 3, -7);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(10, 2, 4);
    controls.update();

    const points = [];

    async function init() {
        const places = await refreshData();
        if (!places || places.length === 0) return;

        const visitedPlaces = places.filter(
            (place) => place.status === "visited",
        );
        const dataAmount = visitedPlaces.length;
        console.log("Количество мест для анимации:", dataAmount);

        for (let i = 0; i < dataAmount; i += 1) {
            const point = new THREE.Vector3(i * 10, 0, 0);
            points.push(point);

            const canvas = document.createElement("canvas");
            canvas.width = 256;
            canvas.height = 128;
            const context = canvas.getContext("2d");
            context.fillStyle = "white";
            context.font = "32px Arial";
            const cityName = visitedPlaces[i]?.city_name || "Неизвестно";
            const country = visitedPlaces[i]?.country_name || "";
            const date = visitedPlaces[i]?.added_at || "";

            context.fillText(`${cityName}, ${country}`, 10, 40);
            context.fillText(`Дата: ${date}`, 10, 70);

            const texture = new THREE.CanvasTexture(canvas);
            const planeGeometry = new THREE.PlaneGeometry(2, 1);
            const planeMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
            });
            const textMesh = new THREE.Mesh(planeGeometry, planeMaterial);
            textMesh.position.copy(point);
            textMesh.position.y += 1.5;
            textMesh.lookAt(point.x - 1, point.y + 1.5, point.z - 1);
            scene.add(textMesh);

            // Точка
            const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const sphereMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.copy(point);
            scene.add(sphere);
        }
        // Линия
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            linewidth: 5,
        });
        const line = new THREE.Line(geometry, material);
        scene.add(line);

        animate();
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    await init();
}

initializeScene();
