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

window.refreshData = refreshData;

window.addCity = async function () {
  const input = document.getElementById("cityInput");
  const status = document.getElementById("statusSelect").value;
  if (!input.value) return;

  await fetch("api/save_place.php", {
    method: "POST",
    body: JSON.stringify({ city: input.value, status: status }),
  });
  input.value = "";
  window.refreshData();
};

window.deleteCity = async function (id) {
  await fetch("api/delete_place.php", {
    method: "POST",
    body: JSON.stringify({ id: id }),
  });
  const panel = document.getElementById("city-info-panel");
  if (panel) panel.style.display = "none";
  window.refreshData();
};

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

  if (intersects.length > 0) {
    const data = intersects[0].object.userData;
    const panel = document.getElementById("city-info-panel");

    if (panel) {
      const countryLabel = data.country_code ? ` [${data.country_code}]` : "";
      document.getElementById("info-name").innerText =
        (data.city_name || "Unknown") + countryLabel;

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
