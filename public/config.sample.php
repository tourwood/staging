<?php
// Copy to config.php on the server (same folder as quote.php) and fill in. NEVER commit config.php.
return [
    'turnstile_secret' => 'PASTE_CLOUDFLARE_TURNSTILE_SECRET_KEY',
    'to'   => 'info@tourwood.com.au',
    // The sender address does NOT need to be a real mailbox (no licence needed), but the domain's SPF record must allow this
    // hosting server to send for tourwood.com.au, otherwise Microsoft 365 may junk or reject the form emails.
    'from' => 'noreply@tourwood.com.au',
    // Every valid submission is also saved here (private, outside public_html). Set to false to disable.
    // 'log_file' => '/home/YOURCPANELUSER/tourwood-quote-log.txt',
];
