import * as THREE from 'three';
import { pointsGroup } from './scene.js';
import { calcPos } from './utils.js';

export async function refreshData() {
    const res = await fetch('api/get_places.php');
    const places = await res.json();
    const list = document.getElementById('citiesList');
    if (!list) return;

    list.innerHTML = '';
    while(pointsGroup.children.length > 0) pointsGroup.remove(pointsGroup.children[0]);

    places.forEach(place => {
        const item = document.createElement('div');
        item.className = `city-item ${place.status}`;
        
        const codeHtml = place.country_code ? `<b>[${place.country_code}]</b> ` : '';

        item.innerHTML = `
            <span>${codeHtml}${place.city_name} (${place.status === 'visited' ? 'Been' : 'Want'})</span>
            <button class="btn-delete" onclick="deleteCity(${place.id})">&times;</button>
        `;
        list.appendChild(item);

        const dotColor = place.status === 'planned' ? 0x33ff33 : 0xff3333;
        const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.015, 8, 8),
            new THREE.MeshBasicMaterial({ color: dotColor })
        );
        
        const pos = calcPos(parseFloat(place.lat), parseFloat(place.lng));
        dot.position.copy(pos);
        dot.userData = place;
        pointsGroup.add(dot);
    });
}