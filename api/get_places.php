<?php
header('Content-Type: application/json');
require_once '../includes/db.php';

$sql = "SELECT id, city_name, lat, lng, temp, weather_desc, status FROM visited_places ORDER BY added_at DESC";
$result = $conn->query($sql);

$places = [];
while($row = $result->fetch_assoc()) {
    $places[] = $row;
}

echo json_encode($places);
$conn->close();