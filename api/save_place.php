<?php
    require_once '../includes/db.php';

    header('Content-Type: application/json');
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    $city = $data['city'];
    $city_safe = escapeshellarg($city);
    $output = shell_exec("python get_coords.py " . $city_safe);

    $result = json_decode($output, true);
    if (isset($result['lat'])) {

        $stmt = $conn->prepare("INSERT INTO visited_places (city_name, lat, lng) VALUES (?, ?, ?)");

        $stmt->bind_param("sdd", $city, $result['lat'], $result['lng']); // string, double, double
        

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "city" => $city]);
        } else {
            echo json_encode(["status" => "error", "message" => $stmt->error]);
        }
        
        $stmt->close();
    } else {
        echo $output; 
    }
?>