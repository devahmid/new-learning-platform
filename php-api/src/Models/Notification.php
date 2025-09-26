<?php

namespace App\Models;

use App\Core\BaseModel;

class Notification extends BaseModel
{
    protected static $table = 'notifications';

    public $id;
    public $subject;
    public $content;
    public $admin_id;
    public $total_recipients;
    public $success_count;
    public $error_count;
    public $sent_at;
    public $created_at;
    public $updated_at;

    public function __construct()
    {
        parent::__construct();
    }

    public function toArray()
    {
        return [
            'id' => $this->id,
            'subject' => $this->subject,
            'content' => $this->content,
            'admin_id' => $this->admin_id,
            'total_recipients' => $this->total_recipients,
            'success_count' => $this->success_count,
            'error_count' => $this->error_count,
            'sent_at' => $this->sent_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
