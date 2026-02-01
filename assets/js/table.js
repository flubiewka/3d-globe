async function loadTableData() {
    try {
        const res = await fetch("api/get_places.php");
        const places = await res.json();
        renderTable(places);
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

function renderTable(places) {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    places.forEach((place) => {
        const tr = document.createElement("tr");
        const statusClass =
            place.status === "visited" ? "status-visited" : "status-planned";
        const statusText = place.status === "visited" ? "Been" : "Want";

        tr.innerHTML = `
			<td>${place.city_name}</td>
			<td><strong>${place.country_code || "--"}</strong></td>
			<td class="${statusClass}">${statusText}</td>
			<td>${place.temp}°C</td>
			<td>${place.added_at && !isNaN(new Date(place.added_at)) ? new Date(place.added_at).toLocaleDateString() : "—"}</td>
			<td><button class="delete-btn" onclick="deletePlace(${place.id}, this)">✕</button></td>
		`;
        tbody.appendChild(tr);
    });
}

async function deletePlace(id, btn) {
    const row = btn.closest("tr");
    const city = row.children[0].innerText;

    if (!confirm(`Delete ${city}?`)) return;

    btn.disabled = true;
    btn.style.opacity = "0.4";

    try {
        const res = await fetch("api/delete_place.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        const data = await res.json();

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

function filterTable() {
    const searchTerm = document
        .getElementById("tableSearch")
        .value.toLowerCase();
    const statusFilter = document.getElementById("filterStatus").value;
    const rows = document.querySelectorAll("#tableBody tr");

    rows.forEach((row) => {
        const cityName = row.children[0].innerText.toLowerCase();
        const countryCode = row.children[1].innerText.toLowerCase();
        const status =
            row.classList.contains("status-visited") ||
            row.innerText.includes("Been")
                ? "visited"
                : "planned";

        const matchesSearch =
            cityName.includes(searchTerm) || countryCode.includes(searchTerm);
        const matchesStatus = statusFilter === "all" || status === statusFilter;

        row.style.display = matchesSearch && matchesStatus ? "" : "none";
    });
}

document.getElementById("tableSearch").addEventListener("input", filterTable);
document.getElementById("filterStatus").addEventListener("change", filterTable);

window.onload = loadTableData;
