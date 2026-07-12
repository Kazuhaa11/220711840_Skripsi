import type { PaginationMeta } from "@/types/api";
import type { SelectOption } from "@/components/ui/Select";

export type WhatsAppLogStatus = "Pending" | "Terkirim" | "Dilewati" | "Gagal";

export interface AdminWhatsAppLogItem {
  id: number;
  notification_key: string;
  event_type: string;
  event_type_label: string;
  notifiable_type?: string | null;
  notifiable_type_label?: string | null;
  notifiable_id?: number | string | null;
  target?: string | null;
  message?: string | null;
  message_preview?: string | null;
  status: WhatsAppLogStatus;
  status_label: string;
  error_message?: string | null;
  sent_at?: string | null;
  sent_at_label?: string | null;
  created_at?: string | null;
  created_at_label?: string | null;
  updated_at?: string | null;
  updated_at_label?: string | null;
  can_retry?: boolean;
  fonnte_response?: unknown | null;
}

export interface AdminWhatsAppLogStats {
  total: number;
  pending: number;
  sent: number;
  skipped: number;
  failed: number;
}

export interface AdminWhatsAppLogFilterOptions {
  statuses: SelectOption[];
  event_types: SelectOption[];
}

export interface AdminWhatsAppLogListData {
  items: AdminWhatsAppLogItem[];
  pagination: PaginationMeta;
  stats: AdminWhatsAppLogStats;
  filter_options: AdminWhatsAppLogFilterOptions;
}

export interface AdminWhatsAppLogDetailData {
  item: AdminWhatsAppLogItem;
}

export interface AdminWhatsAppLogRetryData {
  item: AdminWhatsAppLogItem;
  result?: unknown;
}

export interface AdminWhatsAppLogQuery {
  q?: string;
  status?: string;
  event_type?: string;
  target?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}
