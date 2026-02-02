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

// Check if file was uploaded
if (!isset($_FILES['audio']) || $_FILES['audio']['error'] !== UPLOAD_ERR_OK) {
    sendError(400, 'No audio file uploaded or upload error');
}

// Validate file type (must be audio)
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $_FILES['audio']['tmp_name']);
finfo_close($finfo);

if (strpos($mimeType, 'audio/') !== 0) {
    sendError(400, 'Uploaded file is not an audio file');
}

// Get Deepgram API key
$deepgramKey = getenv('DEEPGRAM_API_KEY') ?: DEEPGRAM_API_KEY;

if (empty($deepgramKey)) {
    sendError(500, 'Deepgram API key not configured');
}

try {
    // Read audio file
    $audioData = file_get_contents($_FILES['audio']['tmp_name']);
    
    // Deepgram API endpoint
    $url = 'https://api.deepgram.com/v1/listen?model=nova-2&detect_language=true&smart_format=true';
    
    // Make API request to Deepgram
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $audioData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Token ' . $deepgramKey,
        'Content-Type: ' . $mimeType
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        error_log("Deepgram API error: HTTP $httpCode - $response");
        sendError(500, 'Voice transcription failed. Please check API key.');
    }
    
    $result = json_decode($response, true);
    
    // Extract transcription
    $transcription = $result['results']['channels'][0]['alternatives'][0]['transcript'] ?? '';
    $detectedLanguage = $result['results']['channels'][0]['detected_language'] ?? 'unknown';
    
    if (empty($transcription)) {
        sendError(500, 'No transcription generated');
    }
    
    // If not English, translate using LibreTranslate
    $englishText = $transcription;
    $translationFallback = false;
    
    if (strtolower($detectedLanguage) !== 'en') {
        try {
            // LibreTranslate API (free, open-source)
            $translateUrl = 'https://libretranslate.com/translate';
            $translateData = json_encode([
                'q' => $transcription,
                'source' => 'auto',
                'target' => 'en',
                'format' => 'text'
            ]);
            
            $ch = curl_init($translateUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $translateData);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            
            $translateResponse = curl_exec($ch);
            $translateHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($translateHttpCode === 200) {
                $translateResult = json_decode($translateResponse, true);
                $englishText = $translateResult['translatedText'] ?? $transcription;
            } else {
                $translationFallback = true;
            }
        } catch (Exception $e) {
            $translationFallback = true;
        }
    }
    
    // Return response
    sendSuccess([
        'originalText' => $transcription,
        'originalLanguage' => $detectedLanguage,
        'englishText' => $englishText,
        'translationFallback' => $translationFallback
    ]);
    
} catch (Exception $e) {
    error_log("Transcription error: " . $e->getMessage());
    sendError(500, 'Voice transcription failed: ' . $e->getMessage());
}
