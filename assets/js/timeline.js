import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export async function refreshData() {
    const response = await fetch("api/get_places.php");
    const places = await response.json();
    if (!places || places.length === 0) return;
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

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(10, 2, 4);
    controls.update();

    const places = await refreshData();
    if (!places?.length) return;

    const visitedPlaces = places.filter((p) => p.status === "visited");
    // Сортируем по дате (старые первыми)
    visitedPlaces.sort((a, b) => new Date(a.added_at) - new Date(b.added_at));

    const points = [];
    const gap = 20;

    visitedPlaces.forEach((place, i) => {
        const point = new THREE.Vector3(i * gap, 0, 0);
        points.push(point);

        // Красивая сфера - как на глобусе
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 32, 32),
            new THREE.MeshPhongMaterial({
                color: 0x00d9ff,
                emissive: 0x00d9ff,
                emissiveIntensity: 1.2,
                shininess: 100,
                wireframe: false,
            }),
        );
        sphere.position.copy(point);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        scene.add(sphere);

        // Кольцо вокруг сферы
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.2, 0.15, 8, 32),
            new THREE.MeshBasicMaterial({
                color: 0x00d9ff,
                transparent: true,
                opacity: 0.6,
            }),
        );
        ring.position.copy(point);
        ring.rotation.x = Math.PI * 0.3;
        scene.add(ring);

        // Текст - большой и читаемый
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 512;
        const context = canvas.getContext("2d");

        // Фон с градиентом
        context.fillStyle = "rgba(15, 23, 42, 0.8)";
        context.fillRect(0, 0, 1024, 512);
        context.strokeStyle = "rgba(0, 217, 255, 0.3)";
        context.lineWidth = 2;
        context.strokeRect(10, 10, 1004, 492);

        // Текст
        context.fillStyle = "#00d9ff";
        context.font = "bold 96px Arial";
        context.textAlign = "center";
        context.fillText(place.city_name, 512, 150);

        context.fillStyle = "#aaa";
        context.font = "72px Arial";
        context.fillText(place.country_name, 512, 280);

        context.fillStyle = "#666";
        context.font = "56px Arial";
        // Извлекаем только дату без времени
        const dateOnly = place.added_at.split(" ")[0];
        context.fillText(dateOnly, 512, 400);

        const texture = new THREE.CanvasTexture(canvas);
        const textMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 3),
            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
            }),
        );
        textMesh.position.copy(point);
        textMesh.position.y += 2.5;
        textMesh.lookAt(point.x - 1, point.y + 2.5, point.z - 1);
        scene.add(textMesh);
    });

    // Линия - элегантная и тонкая
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00d9ff,
        linewidth: 2,
        transparent: true,
        opacity: 0.4,
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);

    // Освещение
    const light = new THREE.PointLight(0x00d9ff, 1.5, 200);
    light.position.set(0, 10, 0);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Анимация
    const cycleLength = (visitedPlaces.length - 1) * gap;
    let isAnimating = true;
    let isPaused = false;
    let startTime = Date.now();
    let elapsedAtPause = 0; // Сохраняем прошедшее время при паузе

    function animate() {
        controls.update();

        if (isAnimating && !isPaused) {
            const elapsed = elapsedAtPause + (Date.now() - startTime);
            const position = Math.min(elapsed * 0.05, cycleLength);

            camera.position.x = position;
            camera.position.y = 3;
            camera.position.z = -7;
            controls.target.set(position + 5, 3, 0);

            if (position >= cycleLength) {
                isAnimating = false;
            }
        }

        renderer.render(scene, camera);
    }

    // UI - простой и чистый
    const uiContainer = document.createElement("div");
    uiContainer.className = "timeline-ui";

    const title = document.createElement("div");
    title.className = "timeline-title";
    title.textContent = "Timeline";
    uiContainer.appendChild(title);

    const stats = document.createElement("div");
    stats.className = "timeline-stats";
    stats.innerHTML = `
        <div>Мест: <span>${visitedPlaces.length}</span></div>
        <div>Прогресс: <span id="progress-text">0%</span></div>
    `;
    uiContainer.appendChild(stats);

    const progressBar = document.createElement("div");
    progressBar.className = "timeline-progress-bar";

    const progressFill = document.createElement("div");
    progressFill.className = "timeline-progress-fill";
    progressBar.appendChild(progressFill);
    uiContainer.appendChild(progressBar);

    // Кнопка паузы
    const pauseBtn = document.createElement("button");
    pauseBtn.className = "timeline-btn";
    pauseBtn.textContent = "Пауза";
    pauseBtn.onclick = () => {
        if (isAnimating) {
            if (isPaused) {
                // Возобновляем
                isPaused = false;
                startTime = Date.now();
                pauseBtn.textContent = "Пауза";
            } else {
                // Паузируем
                isPaused = true;
                elapsedAtPause += Date.now() - startTime;
                pauseBtn.textContent = "Продолжить";
            }
        } else {
            // Анимация закончилась, перезапустить
            startTime = Date.now();
            elapsedAtPause = 0;
            isAnimating = true;
            isPaused = false;
            pauseBtn.textContent = "Пауза";
        }
    };
    uiContainer.appendChild(pauseBtn);

    document.body.appendChild(uiContainer);

    // Обновление прогресса
    function updateProgress() {
        if (isAnimating || isPaused) {
            const elapsed =
                elapsedAtPause + (isPaused ? 0 : Date.now() - startTime);
            const progress = Math.min(
                ((elapsed * 0.05) / cycleLength) * 100,
                100,
            );
            document.getElementById("progress-text").textContent =
                Math.round(progress) + "%";
            progressFill.style.width = progress + "%";
        }
    }

    function animateWithProgress() {
        animate();
        updateProgress();
        requestAnimationFrame(animateWithProgress);
    }

    animateWithProgress();

    // Пауза по нажатию пробела
    document.addEventListener("keydown", (event) => {
        if (event.code === "Space") {
            event.preventDefault();
            pauseBtn.click();
        }
    });

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

initializeScene();
