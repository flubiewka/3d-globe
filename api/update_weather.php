<?php
header('Content-Type: application/json');
require_once '../includes/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? null;

if (!$id) exit(json_encode(['error' => 'No id']));

$row = $conn->query("SELECT lat, lng FROM visited_places WHERE id = $id")->fetch_assoc();
if (!$row) exit(json_encode(['error' => 'Not found']));

$env = parse_str(file_get_contents(__DIR__ . '/../.env'), $env_vars);
$api_key = $env_vars['WEATHER_API_KEY'] ?? '';

$url = "https://api.openweathermap.org/data/2.5/weather?lat={$row['lat']}&lon={$row['lng']}&units=metric&appid={$api_key}";

$response = file_get_contents($url);
if (!$response) exit(json_encode(['error' => 'Weather API failed']));

$weather = json_decode($response, true);
$temp = (int)round($weather['main']['temp']);
$desc = $weather['weather'][0]['description'];

$stmt = $conn->prepare("UPDATE visited_places SET temp = ?, weather_desc = ? WHERE id = ?");
$stmt->bind_param("isi", $temp, $desc, $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'temp' => $temp, 'desc' => $desc]);
} else {
    echo json_encode(['error' => $stmt->error]);
}

$stmt->close();
$conn->close();