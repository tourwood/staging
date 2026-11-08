<?php
// Tourwood quote/contact form handler (runs on the cPanel host).
// Protections: POST only, honeypot field, minimum fill time, Cloudflare Turnstile verification,
// header-injection checks, simple per-IP rate limit. Secrets live in config.php (not in git).
declare(strict_types=1);
ob_start(); // swallow any stray output so the JSON reply stays valid

// Attempt trace (no personal data): records the stage where each submission ended, for troubleshooting.
// Written to the folder ABOVE the website folder so it is never downloadable. Disable with 'diag_log' => false in config.php.
function tw_diag(string $msg): void {
    global $cfg;
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') return; // ignore bots probing with GET
    $f = (is_array($cfg ?? null) && array_key_exists('diag_log', $cfg)) ? $cfg['diag_log'] : (dirname(__DIR__) . '/tourwood-form-attempts.txt');
    if (!$f) return;
    if (@file_put_contents($f, date('c') . ' | ' . $msg . "\n", FILE_APPEND | LOCK_EX) === false) error_log('Tourwood form: cannot write ' . $f);
}

function out(bool $ok, string $error = '', int $code = 200): void {
    tw_diag(($ok ? 'ok' : 'stopped') . " | HTTP $code" . ($error !== '' ? " | $error" : ''));
    while (ob_get_level() > 0) ob_end_clean(); // discard stray output
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(false, 'Method not allowed.', 405);

$cfgFile = __DIR__ . '/config.php';
if (!is_file($cfgFile)) out(false, 'The form is not configured yet. Please use the phone number on our Contact page.', 500);
ob_start();
$cfg = require $cfgFile;
$stray = ob_get_clean();
if ($stray !== '' && $stray !== false) error_log('Tourwood form: config.php prints text before <?php or after ?> (' . strlen($stray) . ' bytes). Remove it (check for a BOM or stray character on line 1).');
if (!is_array($cfg)) out(false, 'The form is not configured correctly. Please use the phone number on our Contact page.', 500);

// Honeypot: real visitors never fill this in. Pretend success so bots learn nothing.
$hp = trim((string)($_POST['tw_extra_q7x'] ?? ''));
if ($hp !== '') { tw_diag('honeypot filled, ' . strlen($hp) . ' chars (silent success, nothing sent)'); out(true); }

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
if ($logFile && $logFile[0] !== '/') $logFile = dirname(__DIR__) . '/' . ltrim($logFile, './');
// Never keep personal details inside the public website folder.
if ($logFile && strpos(str_replace('\\', '/', (string)$logFile), str_replace('\\', '/', __DIR__) . '/') === 0) $logFile = dirname(__DIR__) . '/tourwood-quote-log.txt';
if ($logFile) {
    $line = date('c') . " | $name | $email | " . ($phone ?: '-') . " | $prop | " . str_replace(["\r", "\n"], ' ', $msg ?: '-') . "\n";
    if (@file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX) !== false) @chmod($logFile, 0600);
    else error_log('Tourwood form: cannot write ' . $logFile);
}

define('TW_FORM', true);
$smtpErr = null;
if (!empty($cfg['smtp_host']) && !empty($cfg['smtp_pass'])) {
    require __DIR__ . '/_smtp.php';
    $sent = tw_smtp_send($cfg, $cfg['from'], $cfg['to'], $email, $subject, $body, $smtpErr);
    if (!$sent) error_log('Tourwood form SMTP failure: ' . $smtpErr);
} else {
    $sent = mail($cfg['to'], '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $hdr, '-f' . $cfg['from']);
}
// Private record of the send result (never shown to visitors) to help troubleshooting.
if ($logFile) @file_put_contents($logFile, '  -> ' . ($sent ? 'sent' : 'FAILED: ' . ($smtpErr ?? 'mail() returned false')) . "\n", FILE_APPEND | LOCK_EX);
if (!$sent) tw_diag('send failed: ' . ($smtpErr ?? 'mail() returned false'));
if (!$sent) out(false, 'Sorry, that did not send. Please use the phone number on our Contact page.', 500);

@touch($rl);
out(true);
