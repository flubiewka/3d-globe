CREATE TABLE `visited_places` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `city_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `lat` float(10, 6) NOT NULL,
    `lng` float(10, 6) NOT NULL,
    `temp` int(11) DEFAULT NULL,
    `weather_desc` varchar(255) DEFAULT NULL,
    `status` varchar(20) DEFAULT 'visited',
    `country_code` char(2) DEFAULT NULL,
    `country_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `added_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;