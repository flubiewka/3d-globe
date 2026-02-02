import * as THREE from "three";
import {
    initScene,
    globe,
    scene,
    camera,
    renderer,
    pointsGroup,
} from "./scene.js";
import { refreshData } from "./api.js";

const { controls } = initScene();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentPlaceId = null;

window.refreshData = refreshData;

window.addCity = async function () {
    const input = document.getElementById("cityInput");
    const status = document.getElementById("statusSelect").value;

    if (!input.value.trim()) return;

    try {
        const response = await fetch("api/save_place.php", {
            method: "POST",
            body: JSON.stringify({ city: input.value, status: status }),
        });
        const data = await response.json();

        if (data.error) {
            alert(data.error);
        } else {
            input.value = "";
            window.refreshData();
        }
    } catch (error) {
        console.error(error);
    }
};

window.deleteCity = async function (id) {
    if (!confirm("Delete city?")) return;

    await fetch("api/delete_place.php", {
        method: "POST",
        body: JSON.stringify({ id: id }),
    });

    const panel = document.getElementById("city-info-panel");
    if (panel) panel.style.display = "none";

    window.refreshData();
};

window.updateWeather = async function () {
    const btn = document.getElementById("btn-refresh");
    btn.disabled = true;
    btn.textContent = "↻ ...";

    try {
        const response = await fetch("api/update_weather.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: currentPlaceId }),
        });
        const data = await response.json();

        if (data.success) {
            document.getElementById("info-temp").innerText = `${data.temp}°C`;
            document.getElementById("info-weather-desc").innerText = data.desc;
            window.refreshData();
        }
    } catch (error) {
        console.error(error);
    }

    btn.disabled = false;
    btn.textContent = "↻ Refresh";
};

document.getElementById("cityInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") window.addCity();
});

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("click", (e) => {
    if (e.target.tagName !== "CANVAS") return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(pointsGroup.children);
    const panel = document.getElementById("city-info-panel");

    if (intersects.length > 0) {
        const data = intersects[0].object.userData;

        if (panel) {
            currentPlaceId = data.id;

            const flag = data.country_code
                ? `<img src="https://flagcdn.com/w40/${data.country_code.toLowerCase()}.png" style="width:24px;height:18px;vertical-align:middle;margin-left:6px;">`
                : "";

            document.getElementById("info-name").innerHTML =
                (data.city_name || "Unknown") + flag;
            document.getElementById("info-lat").innerText = parseFloat(
                data.lat,
            ).toFixed(4);
            document.getElementById("info-lng").innerText = parseFloat(
                data.lng,
            ).toFixed(4);
            document.getElementById("info-temp").innerText = data.temp
                ? `${data.temp}°C`
                : "0°C";
            document.getElementById("info-weather-desc").innerText =
                data.weather_desc || "No Data";

            panel.style.display = "block";
        }
    }
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    if (globe) globe.rotation.y += 0.0005;
    renderer.render(scene, camera);
}

window.refreshData();
animate();
