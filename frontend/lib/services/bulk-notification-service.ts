import { apiClient } from '@/lib/api-client';

interface BulkNotification {
  _id: string;
  title: string;
  content: string;
  recipientType: 'all' | 'providers' | 'customers' | 'inactive' | 'custom';
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  notificationType: 'email' | 'in-app' | 'both';
  customRecipients?: string[];
  customFilter?: {
    roles?: string[];
    departments?: string[];
    joinedAfter?: string;
    joinedBefore?: string;
    hasBookings?: boolean;
    hasServices?: boolean;
  };
  scheduledFor?: string;
  sentAt?: string;
  deliveryStats: {
    total: number;
    delivered: number;
    failed: number;
    opened: number;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DeliveryRecord {
  _id: string;
  bulkNotificationId: string;
  recipient: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  notificationId?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'opened';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface BulkNotificationListResponse {
  success: boolean;
  data: BulkNotification[];
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
}

interface BulkNotificationResponse {
  success: boolean;
  data: BulkNotification;
  message?: string;
}

interface DeliveryRecordListResponse {
  success: boolean;
  data: DeliveryRecord[];
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
}

interface BulkNotificationCreateData {
  title: string;
  content: string;
  recipientType: 'all' | 'providers' | 'customers' | 'inactive' | 'custom';
  notificationType: 'email' | 'in-app' | 'both';
  customRecipients?: string[];
  customFilter?: {
    roles?: string[];
    departments?: string[];
    joinedAfter?: Date;
    joinedBefore?: Date;
    hasBookings?: boolean;
    hasServices?: boolean;
  };
  scheduledFor?: Date;
}

interface BulkNotificationUpdateData extends Partial<BulkNotificationCreateData> {}

// Get all bulk notifications with pagination and filtering
export async function getBulkNotifications(
  page = 1,
  limit = 10,
  status?: string,
  recipientType?: string,
  notificationType?: string,
  search?: string,
  token?: string
) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) queryParams.append('status', status);
  if (recipientType) queryParams.append('recipientType', recipientType);
  if (notificationType) queryParams.append('notificationType', notificationType);
  if (search) queryParams.append('search', search);

  return apiClient.get<BulkNotificationListResponse>(
    `/bulk-notifications?${queryParams.toString()}`,
    { token }
  );
}

// Get a specific bulk notification by ID
export async function getBulkNotificationById(id: string, token?: string) {
  return apiClient.get<BulkNotificationResponse>(`/bulk-notifications/${id}`, {
    token,
  });
}

// Create a new bulk notification
export async function createBulkNotification(
  data: BulkNotificationCreateData,
  token?: string
) {
  return apiClient.post<BulkNotificationResponse>(
    '/bulk-notifications',
    data,
    { token }
  );
}

// Update a bulk notification
export async function updateBulkNotification(
  id: string,
  data: BulkNotificationUpdateData,
  token?: string
) {
  return apiClient.put<BulkNotificationResponse>(
    `/bulk-notifications/${id}`,
    data,
    { token }
  );
}

// Delete a bulk notification
export async function deleteBulkNotification(id: string, token?: string) {
  return apiClient.delete<{ success: boolean; message: string }>(
    `/bulk-notifications/${id}`,
    { token }
  );
}

// Send a bulk notification immediately
export async function sendBulkNotification(id: string, token?: string) {
  return apiClient.post<BulkNotificationResponse>(
    `/bulk-notifications/${id}/send`,
    {},
    { token }
  );
}

// Get delivery records for a bulk notification
export async function getDeliveryRecords(
  id: string,
  page = 1,
  limit = 20,
  status?: string,
  token?: string
) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) queryParams.append('status', status);

  return apiClient.get<DeliveryRecordListResponse>(
    `/bulk-notifications/${id}/delivery-records?${queryParams.toString()}`,
    { token }
  );
}

export const bulkNotificationService = {
  getBulkNotifications,
  getBulkNotificationById,
  createBulkNotification,
  updateBulkNotification,
  deleteBulkNotification,
  sendBulkNotification,
  getDeliveryRecords,
};

export default bulkNotificationService;