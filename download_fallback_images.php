<?php

$fallbackImages = [
    'electronics' => 'https://via.placeholder.com/800x600.png?text=Electronics',
    'furniture' => 'https://via.placeholder.com/800x600.png?text=Furniture',
    'vehicles' => 'https://via.placeholder.com/800x600.png?text=Vehicles',
    'art' => 'https://via.placeholder.com/800x600.png?text=Art',
    'jewelry' => 'https://via.placeholder.com/800x600.png?text=Jewelry',
    'office' => 'https://via.placeholder.com/800x600.png?text=Office+Equipment',
    'music' => 'https://via.placeholder.com/800x600.png?text=Musical+Instruments',
    'default' => 'https://via.placeholder.com/800x600.png?text=Asset'
];

$path = 'storage/app/public/assets/fallback/';

if (!is_dir($path)) {
    mkdir($path, 0755, true);
    echo "Created directory: {$path}\n";
}

foreach ($fallbackImages as $name => $url) {
    $filePath = $path . $name . '.jpg';
    
    echo "Downloading {$url} to {$filePath}... ";
    
    $image = file_get_contents($url);
    
    if ($image !== false) {
        file_put_contents($filePath, $image);
        echo "Done.\n";
    } else {
        echo "Failed.\n";
    }
}

echo "Completed downloading fallback images.\n"; 