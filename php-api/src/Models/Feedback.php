<?php

namespace App\Models;

class Feedback extends BaseModel {
    protected static $table = 'feedback';

    protected static $fillable = [
        'overall',
        'navigation',
        'clarity',
        'design',
        'mobile',
        'speed',
        'trust',
        'nps',
        'improvement',
        'consentToContact',
        'email',
        'source',
        'createdAt',
    ];
}

