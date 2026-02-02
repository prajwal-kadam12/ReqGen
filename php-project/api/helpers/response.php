<?php
// Helper function to send JSON response
function sendResponse($statusCode, $data) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

// Helper function to send error response
function sendError($statusCode, $message, $details = null) {
    $response = ['error' => $message];
    if ($details !== null) {
        $response['details'] = $details;
    }
    sendResponse($statusCode, $response);
}

// Helper function to send success response
function sendSuccess($data = null, $message = null) {
    $response = [];
    if ($message !== null) {
        $response['message'] = $message;
    }
    if ($data !== null) {
        $response = array_merge($response, $data);
    }
    sendResponse(200, $response);
}

// Convert snake_case to camelCase (for frontend compatibility)
function snakeToCamel($string) {
    return lcfirst(str_replace('_', '', ucwords($string, '_')));
}

// Convert array keys from snake_case to camelCase
function convertKeysToCamel($array) {
    if (!is_array($array)) {
        return $array;
    }
    
    $result = [];
    foreach ($array as $key => $value) {
        $camelKey = snakeToCamel($key);
        $result[$camelKey] = is_array($value) ? convertKeysToCamel($value) : $value;
    }
    return $result;
}

// Generate UUID
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}
