<?php
require_once '../includes/db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$city = $data['city'];

$output = shell_exec("python ../api/get_coords.py " . escapeshellarg($city) . " 2>&1");
$result = json_decode($output, true);

if ($result && !isset($result['error'])) {
    $stmt = $conn->prepare("INSERT INTO visited_places (city_name, lat, lng, temp, weather_desc) VALUES (?, ?, ?, ?, ?)");
    
    $stmt->bind_param(
        "ssdis", 
        $city, 
        $result['lat'], 
        $result['lng'], 
        $result['temp'], 
        $result['desc']
    );

    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "DB error"]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "City not found"]);
}
?>