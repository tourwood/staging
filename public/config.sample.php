<?php
// Copy to config.php on the server (same folder as quote.php) and fill in. NEVER commit config.php.
return [
    'turnstile_secret' => 'PASTE_CLOUDFLARE_TURNSTILE_SECRET_KEY',
    'to'   => 'info@tourwood.com.au',
    'from' => 'noreply@tourwood.com.au', // must be an address on the hosting domain so mail is not flagged as spoofed
];
