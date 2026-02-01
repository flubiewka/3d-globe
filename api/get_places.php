<?php
    require_once '../includes/db.php';
    header('Content-Type: application/json');

    $sql = "SELECT * FROM visited_places";
    $result = $conn->query($sql);

    $places = [];

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $places[] = $row;
        }
    }

    echo json_encode($places);
?>