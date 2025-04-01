<?php

$fallbackCategories = [
    'electronics',
    'furniture',
    'vehicles',
    'art',
    'jewelry',
    'office',
    'music',
    'default'
];

$targetPath = 'storage/app/public/assets/fallback/';

// Ensure directory exists
if (!is_dir($targetPath)) {
    mkdir($targetPath, 0755, true);
    echo "Created directory: {$targetPath}\n";
}

// Create a placeholder image for each category
foreach ($fallbackCategories as $category) {
    $imagePath = $targetPath . $category . '.jpg';
    
    echo "Creating placeholder image for {$category}... ";
    
    // Create a 800x600 image
    $image = imagecreatetruecolor(800, 600);
    
    // Colors
    $backgroundColor = imagecolorallocate($image, 240, 240, 240);
    $textColor = imagecolorallocate($image, 50, 50, 50);
    $borderColor = imagecolorallocate($image, 200, 200, 200);
    
    // Fill background
    imagefill($image, 0, 0, $backgroundColor);
    
    // Draw border
    imagerectangle($image, 0, 0, 799, 599, $borderColor);
    
    // Text to display
    $text = ucfirst($category);
    
    // Calculate position for centered text
    $fontFile = 5; // Built-in font (larger size)
    $textWidth = imagefontwidth($fontFile) * strlen($text);
    $textHeight = imagefontheight($fontFile);
    
    $x = (800 - $textWidth) / 2;
    $y = (600 - $textHeight) / 2;
    
    // Draw text
    imagestring($image, $fontFile, $x, $y, $text, $textColor);
    
    // Save the image
    imagejpeg($image, $imagePath, 90);
    
    // Free memory
    imagedestroy($image);
    
    echo "Done.\n";
}

echo "Completed creating fallback images.\n"; 