<?php
// Minimal authenticated SMTP client (implicit TLS, e.g. port 465) used by quote.php.
// No third-party libraries. Only defines a function; refuses to run if opened directly.
if (!defined('TW_FORM')) { http_response_code(404); exit; }

/**
 * Send one plain-text email through an authenticated SMTP server.
 * $c: smtp_host, smtp_port (default 465), smtp_user, smtp_pass, optional smtp_verify_peer (default true)
 * Returns true on success; on failure returns false and sets $err to a short technical reason (log it, never show it to visitors).
 */
function tw_smtp_send(array $c, string $from, string $to, string $replyTo, string $subject, string $body, ?string &$err = null): bool {
    $host = (string)($c['smtp_host'] ?? '');
    $port = (int)($c['smtp_port'] ?? 465);
    $user = (string)($c['smtp_user'] ?? '');
    $pass = (string)($c['smtp_pass'] ?? '');
    if ($host === '' || $user === '' || $pass === '') { $err = 'SMTP not configured'; return false; }
    foreach ([$from, $to, $replyTo, $subject] as $v) {
        if (preg_match('/[\r\n]/', $v)) { $err = 'Invalid header value'; return false; }
    }

    $verify = $c['smtp_verify_peer'] ?? true;
    $ctx = stream_context_create(['ssl' => [
        'verify_peer' => (bool)$verify, 'verify_peer_name' => (bool)$verify,
        'SNI_enabled' => true, 'peer_name' => $host,
    ]]);
    $fp = @stream_socket_client("ssl://$host:$port", $errno, $errstr, 12, STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) { $err = "Connect failed: $errstr ($errno)"; return false; }
    stream_set_timeout($fp, 15);

    $read = static function () use ($fp): string {
        $resp = '';
        while (($line = fgets($fp, 1024)) !== false) {
            $resp .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') break; // last line of a (possibly multi-line) reply
        }
        return $resp;
    };
    $expect = static function (string $resp, array $codes, string $step) use (&$err): bool {
        $code = (int)substr($resp, 0, 3);
        if (!in_array($code, $codes, true)) { $err = "$step: " . trim(preg_replace('/\s+/', ' ', $resp)); return false; }
        return true;
    };
    $send = static function (string $line) use ($fp): void { fwrite($fp, $line . "\r\n"); };

    $ok = false;
    do {
        if (!$expect($read(), [220], 'greeting')) break;
        $ehlo = preg_replace('/[^A-Za-z0-9.\-]/', '', $_SERVER['SERVER_NAME'] ?? '') ?: 'localhost';
        $send("EHLO $ehlo");
        if (!$expect($read(), [250], 'EHLO')) break;
        $send('AUTH LOGIN');
        if (!$expect($read(), [334], 'AUTH')) break;
        $send(base64_encode($user));
        if (!$expect($read(), [334], 'AUTH user')) break;
        $send(base64_encode($pass));
        if (!$expect($read(), [235], 'AUTH password')) break;
        $send("MAIL FROM:<$from>");
        if (!$expect($read(), [250], 'MAIL FROM')) break;
        $send("RCPT TO:<$to>");
        if (!$expect($read(), [250, 251], 'RCPT TO')) break;
        $send('DATA');
        if (!$expect($read(), [354], 'DATA')) break;

        $domain = substr(strrchr($from, '@') ?: '@localhost', 1);
        $headers = [
            'Date: ' . date('r'),
            'From: Tourwood Website <' . $from . '>',
            'To: <' . $to . '>',
            'Reply-To: <' . $replyTo . '>',
            'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=',
            'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $domain . '>',
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
        ];
        // base64 body: no dot-stuffing or line-ending problems possible
        $data = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($body), 76, "\r\n");
        fwrite($fp, $data . ".\r\n");
        if (!$expect($read(), [250], 'message')) break;
        $send('QUIT');
        $ok = true;
    } while (false);

    @fclose($fp);
    return $ok;
}
