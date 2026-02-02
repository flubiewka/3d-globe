import * as THREE from "three";
import { pointsGroup } from "./scene.js";
import { calcPos } from "./utils.js";

function getFlag(code) {
    return `<img src="https://flagcdn.com/w40/${code.toLowerCase()}.png" style="width:20px;height:15px;vertical-align:middle;margin-right:4px;">`;
}

export async function refreshData() {
    const response = await fetch("api/get_places.php");
    const places = await response.json();
    const list = document.getElementById("citiesList");

    if (!list) return;

    list.innerHTML = "";

    while (pointsGroup.children.length > 0) {
        pointsGroup.remove(pointsGroup.children[0]);
    }

    places.forEach((place) => {
        const item = document.createElement("div");
        item.className = `city-item ${place.status}`;

        const flag = place.country_code ? getFlag(place.country_code) : "";
        const statusText = place.status === "visited" ? "Been" : "Want";

        item.innerHTML = `
            <span>${flag}${place.city_name} (${statusText})</span>
            <button class="btn-delete" onclick="deleteCity(${place.id})">&times;</button>
        `;
        list.appendChild(item);

        const color = place.status === "planned" ? 0x33ff33 : 0xff3333;
        const geometry = new THREE.SphereGeometry(0.015, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const dot = new THREE.Mesh(geometry, material);

        const position = calcPos(parseFloat(place.lat), parseFloat(place.lng));
        dot.position.copy(position);
        dot.userData = place;
        pointsGroup.add(dot);
    });
}
