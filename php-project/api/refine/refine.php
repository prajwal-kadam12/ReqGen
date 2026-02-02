<?php
require_once '../helpers/cors.php';
require_once '../helpers/response.php';
require_once '../helpers/auth.php';

session_start();
requireAuth();

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError(405, 'Method not allowed');
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['originalNote']) || !isset($input['documentType'])) {
    sendError(400, 'originalNote and documentType are required');
}

// Get OpenAI API key
$openaiKey = getenv('OPENAI_API_KEY') ?: OPENAI_API_KEY;

if (empty($openaiKey)) {
    sendError(500, 'OpenAI API key not configured');
}

$originalNote = $input['originalNote'];
$documentType = $input['documentType'];

// Create prompt based on document type
$prompts = [
    'BRD' => "You are a professional business analyst. Convert the following notes into a well-structured Business Requirements Document (BRD). Include sections like Executive Summary, Business Objectives, Stakeholders, Requirements, Success Criteria, and Timeline. Format in HTML with proper headings and lists.",
    'SRS' => "You are a software requirements specialist. Convert the following notes into a detailed Software Requirements Specification (SRS). Include sections like Introduction, System Overview, Functional Requirements, Non-Functional Requirements, Interface Requirements, and Constraints. Format in HTML with proper headings and lists.",
    'SDD' => "You are a system architect. Convert the following notes into a comprehensive System Design Document (SDD). Include sections like Architecture Overview, System Components, Data Models, API Specifications, Security Design, and Deployment Strategy. Format in HTML with proper headings and lists.",
    'PO' => "You are a procurement specialist. Convert the following notes into a formal Purchase Order document. Include sections like Vendor Information, Items/Services Requested, Quantities, Pricing, Terms and Conditions, and Delivery Schedule. Format in HTML with proper headings and tables."
];

$systemPrompt = $prompts[$documentType] ?? $prompts['BRD'];

try {
    // OpenAI API endpoint
    $url = 'https://api.openai.com/v1/chat/completions';
    
    // Prepare request data
    $requestData = json_encode([
        'model' => 'gpt-3.5-turbo',
        'messages' => [
            [
                'role' => 'system',
                'content' => $systemPrompt
            ],
            [
                'role' => 'user',
                'content' => $originalNote
            ]
        ],
        'temperature' => 0.7,
        'max_tokens' => 2000
    ]);
    
    // Make API request to OpenAI
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $requestData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $openaiKey,
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        error_log("OpenAI API error: HTTP $httpCode - $response");
        sendError(500, 'AI refinement failed. Please check API key and quota.');
    }
    
    $result = json_decode($response, true);
    
    // Extract refined content
    $refinedContent = $result['choices'][0]['message']['content'] ?? '';
    
    if (empty($refinedContent)) {
        sendError(500, 'No refined content generated');
    }
    
    // Return refined content
    sendSuccess([
        'refinedNote' => $refinedContent,
        'content' => $refinedContent
    ]);
    
} catch (Exception $e) {
    error_log("Refinement error: " . $e->getMessage());
    sendError(500, 'AI refinement failed: ' . $e->getMessage());
}
