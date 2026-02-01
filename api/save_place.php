<?php
header('Content-Type: application/json');
require_once '../includes/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$city_input = $data['city'] ?? '';
$status = $data['status'] ?? 'visited';

if (empty($city_input)) exit(json_encode(['error' => 'Empty city']));

$script = __DIR__ . '/get_coords.py';
$cmd = 'python ' . escapeshellarg($script) . ' ' . escapeshellarg($city_input) . ' 2>&1';
$output = shell_exec($cmd);
$res = json_decode($output, true);

if (!$res || isset($res['error'])) exit(json_encode(['error' => 'Not found']));


$stmt = $conn->prepare("INSERT INTO visited_places (city_name, lat, lng, temp, weather_desc, status, country_code, country_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

$c_name = $res['city'];
$lat = (float)$res['lat'];
$lng = (float)$res['lng'];
$temp = (int)$res['temp'];
$desc = $res['desc'];
$code = $res['country_code'] ?? '';
$country = $res['country_name'] ?? '';

$stmt->bind_param("sddissss", $c_name, $lat, $lng, $temp, $desc, $status, $code, $country);

if ($stmt->execute()) echo json_encode(['success' => true]);
else echo json_encode(['error' => $stmt->error]);

$stmt->close();
$conn->close();