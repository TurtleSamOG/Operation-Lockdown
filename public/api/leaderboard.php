<?php
declare(strict_types=1);
require_once __DIR__.'/../../main-system/lib/scoring.php';
api_method('GET');
api_guard(fn():array=>leaderboard_data());
