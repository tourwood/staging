<?php
// Tourwood quote/contact form handler (runs on the cPanel host).
// Protections: POST only, honeypot field, minimum fill time, Cloudflare Turnstile verification,
// header-injection checks, simple per-IP rate limit. Secrets live in config.php (not in git).
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function out(bool $ok, string $error = '', int $code = 200): void {
    http_response_code($code);
    echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(false, 'Method not allowed.', 405);

$cfgFile = __DIR__ . '/config.php';
if (!is_file($cfgFile)) out(false, 'The form is not configured yet. Please use the phone number on our Contact page.', 500);
$cfg = require $cfgFile;

// Honeypot: real visitors never fill this in. Pretend success so bots learn nothing.
if (trim((string)($_POST['company_website'] ?? '')) !== '') out(true);

// Too fast to be human (form value is a JS timestamp in ms).
$t = (int)($_POST['t'] ?? 0);
if ($t > 0 && (microtime(true) * 1000 - $t) < 3000) out(false, 'Please try again in a moment.', 429);

// Rate limit: one submission per 30s per IP.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rl = sys_get_temp_dir() . '/tw_quote_' . md5($ip);
if (is_file($rl) && (time() - (int)filemtime($rl)) < 30) out(false, 'Please wait a moment before sending again.', 429);

// Turnstile
$token = (string)($_POST['cf-turnstile-response'] ?? '');
if ($token === '') out(false, 'Please complete the verification and try again.', 400);
$ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 8,
    CURLOPT_POSTFIELDS => http_build_query(['secret' => $cfg['turnstile_secret'], 'response' => $token, 'remoteip' => $ip]),
]);
$res = curl_exec($ch);
curl_close($ch);
$verdict = $res ? json_decode($res, true) : null;
if (!is_array($verdict) || empty($verdict['success'])) out(false, 'Verification failed. Please try again.', 400);

// Validate fields
$clean = static fn(string $s, int $max): string => mb_substr(trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $s)), 0, $max);
$name = $clean((string)($_POST['name'] ?? ''), 100);
$email = $clean((string)($_POST['email'] ?? ''), 150);
$phone = $clean((string)($_POST['phone'] ?? ''), 30);
$prop = $clean((string)($_POST['property'] ?? ''), 60);
$msg = $clean((string)($_POST['message'] ?? ''), 2000);

if ($name === '' || $prop === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) out(false, 'Please check your details and try again.', 400);
foreach ([$name, $email, $phone, $prop] as $v) {
    if (preg_match('/[\r\n]/', $v)) out(false, 'Invalid input.', 400); // header injection
}

$subject = 'Website quote request: ' . $name;
$body = "Name: $name\nEmail: $email\nPhone: " . ($phone ?: '-') . "\nProperty type: $prop\n\nMessage:\n" . ($msg ?: '-') . "\n\n--\nSent from the Tourwood website (IP $ip)\n";
$headers = [
    'From' => $cfg['from'],
    'Reply-To' => $email,
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
];
$hdr = '';
foreach ($headers as $k => $v) $hdr .= "$k: $v\r\n";

// Safety net: keep a private copy of every valid submission (outside public_html) so no enquiry is lost if email delivery fails.
$logFile = $cfg['log_file'] ?? (dirname(__DIR__) . '/tourwood-quote-log.txt');
if ($logFile) {
    $line = date('c') . " | $name | $email | " . ($phone ?: '-') . " | $prop | " . str_replace(["\r", "\n"], ' ', $msg ?: '-') . "\n";
    if (@file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX) !== false) @chmod($logFile, 0600);
}

$sent = mail($cfg['to'], '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $hdr, '-f' . $cfg['from']);
if (!$sent) out(false, 'Sorry, that did not send. Please use the phone number on our Contact page.', 500);

@touch($rl);
out(true);
