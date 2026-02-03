import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// Добавляем три стандартные надстройки для эффектов
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

async function getData() {
    const response = await fetch("api/get_places.php");
    const places = await response.json();
    return places;
}

function getFlag(code) {
    return `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
}

function createStars(scene) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let i = 0; i < 100000; i++) {
        positions.push(
            (Math.random() - 0.5) * 700,
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 700,
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
        size: 0.2,
        vertexColors: true,
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
}

async function init() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.015);

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );
    camera.position.set(-1, 3, -7);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // --- НАСТРОЙКА БЛУМА (САМАЯ ПРОСТАЯ) ---
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // Параметры: сила (1.5), радиус (0.4), порог (0.85)
    const bloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,
        0.9,
        1,
    );
    composer.addPass(bloom);
    // ---------------------------------------

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(4, 3, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.update();

    createStars(scene);

    const places = await getData();
    if (!places || places.length === 0) return;

    const visited = places.filter((p) => p.status === "visited");
    visited.sort((a, b) => new Date(a.added_at) - new Date(b.added_at));

    const points = [];
    const spacing = 20;

    visited.forEach(async (place, index) => {
        const x = index * spacing;
        const y = 0;
        const z = 0;
        const point = new THREE.Vector3(x, y, z);
        points.push(point);

        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 32, 32),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(0x00d9ff).multiplyScalar(2.28),
                transparent: true,
                opacity: 0.9,
            }),
        );
        sphere.position.copy(point);
        scene.add(sphere);

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.2, 0.1, 8, 32),
            new THREE.MeshBasicMaterial({
                color: 0x00d9ff,
                transparent: true,
                opacity: 0.4,
            }),
        );
        ring.position.copy(point);
        ring.rotation.x = Math.PI / 3;
        scene.add(ring);

        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = getFlag(place.country_code);

        await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });

        if (img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, 0, 0, 1024, 512);
            ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
            ctx.fillRect(0, 0, 1024, 512);
        } else {
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fillRect(0, 0, 1024, 512);
        }

        ctx.strokeStyle = "rgba(0, 217, 255, 0.5)";
        ctx.lineWidth = 10;
        ctx.strokeRect(20, 20, 984, 472);

        ctx.fillStyle = "#00d9ff";
        ctx.font = "bold 90px Arial";
        ctx.textAlign = "center";
        ctx.fillText(place.city_name, 512, 150);

        ctx.fillStyle = "#ffffff";
        ctx.font = "70px Arial";
        ctx.fillText(place.country_name || "", 512, 270);

        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "50px Arial";
        const date = place.added_at ? place.added_at.split(" ")[0] : "";
        ctx.fillText(date, 512, 380);

        const texture = new THREE.CanvasTexture(canvas);
        const label = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 3),
            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
            }),
        );
        label.position.set(x, 2.5, 0);
        label.lookAt(x - 0.7, 2.5, -1);
        scene.add(label);

        if (index === visited.length - 1) {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(
                points,
            );
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x00d9ff,
                transparent: true,
                opacity: 0.5,
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
        }
    });

    const light = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(light);

    const pointLight = new THREE.PointLight(0x00d9ff, 1, 100);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    const maxDistance = (visited.length - 1) * spacing;
    let isPlaying = false;
    let isPaused = false;
    let startTime = 0;
    let pausedTime = 0;
    const animSpeed = 0.02;

    const ui = document.createElement("div");
    ui.className = "timeline-ui";

    const title = document.createElement("div");
    title.className = "timeline-title";
    title.textContent = "Journey Timeline";
    ui.appendChild(title);

    const stats = document.createElement("div");
    stats.className = "timeline-stats";
    stats.innerHTML = `
        <div>Places: <span>${visited.length}</span></div>
        <div>Progress: <span id="progress">0%</span></div>
    `;
    ui.appendChild(stats);

    const progressBar = document.createElement("div");
    progressBar.className = "timeline-progress-bar";
    const progressFill = document.createElement("div");
    progressFill.className = "timeline-progress-fill";
    progressBar.appendChild(progressFill);
    ui.appendChild(progressBar);

    const btn = document.createElement("button");
    btn.className = "timeline-btn";
    btn.textContent = "Start Journey";
    ui.appendChild(btn);

    document.body.appendChild(ui);

    btn.onclick = () => {
        if (!isPlaying) {
            isPlaying = true;
            isPaused = false;
            startTime = Date.now();
            pausedTime = 0;
            btn.textContent = "Pause";
        } else if (isPaused) {
            isPaused = false;
            startTime = Date.now();
            btn.textContent = "Pause";
        } else {
            isPaused = true;
            pausedTime += Date.now() - startTime;
            btn.textContent = "Resume";
        }
    };

    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            btn.click();
        }
    });

    function updateProgress() {
        if (isPlaying && !isPaused) {
            const elapsed = pausedTime + (Date.now() - startTime);
            const position = Math.min(elapsed * animSpeed, maxDistance);
            const progress = Math.min((position / maxDistance) * 100, 100);

            camera.position.x = position;
            camera.position.y = 3;
            camera.position.z = -7;
            controls.target.set(position + 5, 3, 0);

            document.getElementById("progress").textContent =
                Math.round(progress) + "%";
            progressFill.style.width = progress + "%";

            if (position >= maxDistance) {
                isPlaying = false;
                btn.textContent = "Restart";
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        updateProgress();
        controls.update();
        // ВМЕСТО renderer.render используем composer.render
        composer.render();
    }

    animate();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        // Обновляем размер композитора при изменении окна
        composer.setSize(window.innerWidth, window.innerHeight);
    });
}

init();
