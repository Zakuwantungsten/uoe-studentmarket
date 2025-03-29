import { apiClient } from '@/lib/api-client';

interface Announcement {
  _id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'critical';
  status: 'active' | 'inactive';
  displayLocation: string;
  startDate: string;
  endDate?: string;
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

interface AnnouncementListResponse {
  success: boolean;
  data: Announcement[];
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
}

interface AnnouncementResponse {
  success: boolean;
  data: Announcement;
  message?: string;
}

interface AnnouncementCreateData {
  title: string;
  description: string;
  type?: 'info' | 'warning' | 'critical';
  displayLocation?: string;
  startDate?: Date;
  endDate?: Date;
}

interface AnnouncementUpdateData extends Partial<AnnouncementCreateData> {
  status?: 'active' | 'inactive';
}

// Get all announcements with pagination and filtering
export async function getAnnouncements(
  page = 1,
  limit = 10,
  status?: string,
  type?: string,
  displayLocation?: string,
  active?: boolean,
  token?: string
) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) queryParams.append('status', status);
  if (type) queryParams.append('type', type);
  if (displayLocation) queryParams.append('displayLocation', displayLocation);
  if (active !== undefined) queryParams.append('active', active.toString());

  return apiClient.get<AnnouncementListResponse>(
    `/announcements?${queryParams.toString()}`,
    { token }
  );
}

// Get active announcements for display
export async function getActiveAnnouncements(
  displayLocation?: string,
  token?: string
) {
  const queryParams = new URLSearchParams();
  if (displayLocation) queryParams.append('displayLocation', displayLocation);

  return apiClient.get<{ success: boolean; data: Announcement[] }>(
    `/announcements/active?${queryParams.toString()}`,
    { token }
  );
}

// Get a specific announcement by ID
export async function getAnnouncementById(id: string, token?: string) {
  return apiClient.get<AnnouncementResponse>(`/announcements/${id}`, { token });
}

// Create a new announcement
export async function createAnnouncement(
  data: AnnouncementCreateData,
  token?: string
) {
  return apiClient.post<AnnouncementResponse>('/announcements', data, { token });
}

// Update an announcement
export async function updateAnnouncement(
  id: string,
  data: AnnouncementUpdateData,
  token?: string
) {
  return apiClient.put<AnnouncementResponse>(`/announcements/${id}`, data, {
    token,
  });
}

// Delete an announcement
export async function deleteAnnouncement(id: string, token?: string) {
  return apiClient.delete<{ success: boolean; message: string }>(
    `/announcements/${id}`,
    { token }
  );
}

// Change announcement status (activate/deactivate)
export async function changeAnnouncementStatus(
  id: string,
  status: 'active' | 'inactive',
  token?: string
) {
  return apiClient.patch<AnnouncementResponse>(
    `/announcements/${id}/status`,
    { status },
    { token }
  );
}

export const announcementService = {
  getAnnouncements,
  getActiveAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  changeAnnouncementStatus,
};

export default announcementService;