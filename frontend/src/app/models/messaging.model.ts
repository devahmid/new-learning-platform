export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  subject: string;
  content: string;
  message_type: 'admin_to_parent' | 'parent_to_admin' | 'admin_to_admin' | 'system';
  is_read: boolean;
  is_important: boolean;
  is_archived: boolean;
  attachments?: MessageAttachment[];
  parent_message_id?: number;
  created_at: string;
  read_at?: string;
  archived_at?: string;
  
  // Données jointes
  sender_name?: string;
  sender_lastname?: string;
  sender_email?: string;
  recipient_name?: string;
  recipient_lastname?: string;
  recipient_email?: string;
}

export interface MessageAttachment {
  id: number;
  message_id: number;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface MessageTemplate {
  id: number;
  name: string;
  subject: string;
  content: string;
  template_type: 'welcome' | 'progress_update' | 'payment_reminder' | 'course_completion' | 'custom';
  available_variables: string[];
  is_active: boolean;
  is_system: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  
  // Données jointes
  created_by_name?: string;
  created_by_lastname?: string;
}

export interface Conversation {
  other_user_id: number;
  other_user_name: string;
  other_user_lastname: string;
  other_user_email: string;
  other_user_role: string;
  last_message_at: string;
  unread_count: number;
  last_message_content: string;
}

export interface EmailNotification {
  id: number;
  message_id: number;
  recipient_email: string;
  subject: string;
  content: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  sent_at?: string;
  error_message?: string;
  attempts: number;
  max_attempts: number;
  next_attempt_at?: string;
  created_at: string;
}

export interface NotificationPreferences {
  id: number;
  user_id: number;
  email_messages: boolean;
  email_progress_updates: boolean;
  email_payment_reminders: boolean;
  email_course_completions: boolean;
  in_app_messages: boolean;
  in_app_progress_updates: boolean;
  in_app_achievements: boolean;
  email_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  created_at: string;
  updated_at: string;
}

export interface MessageFilters {
  is_read?: boolean;
  is_important?: boolean;
  message_type?: string;
  is_archived?: boolean;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface SendMessageRequest {
  recipient_id: number;
  subject: string;
  content: string;
  is_important?: boolean;
  parent_message_id?: number;
  attachments?: any[];
}

export interface SendTemplateMessageRequest {
  template_id: number;
  recipient_id: number;
  variables: { [key: string]: string };
}

export interface MessageStats {
  total: number;
  unread: number;
  important: number;
  archived: number;
  sent_today: number;
  received_today: number;
}

export interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  bounced: number;
}
