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
			<td>${new Date(place.added_at).toLocaleDateString()}</td>
		`;
        tbody.appendChild(tr);
    });
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
