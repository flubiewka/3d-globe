async function loadTableData() {
    try {
        const response = await fetch("api/get_places.php");
        const places = await response.json();
        renderTable(places);
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

function renderTable(places) {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    places.forEach((place) => {
        const row = document.createElement("tr");
        row.setAttribute("data-status", place.status);

        const statusClass =
            place.status === "visited" ? "status-visited" : "status-planned";
        const statusText = place.status === "visited" ? "Been" : "Want";

        const flag = place.country_code
            ? `<img src="https://flagcdn.com/w40/${place.country_code.toLowerCase()}.png" style="width:20px;height:15px;vertical-align:middle;margin-right:6px;">`
            : "";

        row.innerHTML = `
            <td>${place.city_name}</td>
            <td>${flag}${place.country_name || "—"}</td>
            <td class="${statusClass}">${statusText}</td>
            <td class="temp-cell">${place.temp}°C</td>
            <td>${place.added_at && !isNaN(new Date(place.added_at)) ? new Date(place.added_at).toLocaleDateString() : "—"}</td>
            <td><button class="delete-btn" onclick="deletePlace(${place.id}, this)">✕</button></td>
        `;
        tbody.appendChild(row);
    });
}

async function deletePlace(id, btn) {
    const row = btn.closest("tr");
    const city = row.children[0].innerText;

    if (!confirm(`Удалить ${city}?`)) return;

    btn.disabled = true;
    btn.style.opacity = "0.4";

    try {
        const response = await fetch("api/delete_place.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        const data = await response.json();

        if (data.status === "success") {
            row.style.transition = "opacity 0.3s ease, transform 0.3s ease";
            row.style.opacity = "0";
            row.style.transform = "translateX(-20px)";
            setTimeout(() => row.remove(), 300);
        }
    } catch (error) {
        btn.disabled = false;
        btn.style.opacity = "1";
        console.error("Error deleting place:", error);
    }
}

async function refreshAllWeather() {
    const btn = document.querySelector(".refresh-all-btn");
    btn.disabled = true;
    btn.textContent = "↻ ...";

    try {
        const response = await fetch("api/get_places.php");
        const places = await response.json();
        const rows = document.querySelectorAll("#tableBody tr");

        for (let i = 0; i < places.length; i++) {
            const weatherResponse = await fetch("api/update_weather.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: places[i].id }),
            });
            const data = await weatherResponse.json();

            if (data.success) {
                rows[i].querySelector(".temp-cell").innerText =
                    `${data.temp}°C`;
            }
        }
    } catch (error) {
        console.error("Error refreshing weather:", error);
    }

    btn.disabled = false;
    btn.textContent = "↻ Refresh All";
}

function filterTable() {
    const searchTerm = document
        .getElementById("tableSearch")
        .value.toLowerCase();
    const statusFilter = document.getElementById("filterStatus").value;
    const rows = document.querySelectorAll("#tableBody tr");

    rows.forEach((row) => {
        const cityName = row.children[0].innerText.toLowerCase();
        const country = row.children[1].innerText.toLowerCase();
        const status = row.getAttribute("data-status");

        const matchesSearch =
            cityName.includes(searchTerm) || country.includes(searchTerm);
        const matchesStatus = statusFilter === "all" || status === statusFilter;

        row.style.display = matchesSearch && matchesStatus ? "" : "none";
    });
}

document.getElementById("tableSearch").addEventListener("input", filterTable);
document.getElementById("filterStatus").addEventListener("change", filterTable);

window.onload = loadTableData;
