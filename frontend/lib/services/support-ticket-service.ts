import { apiClient } from '@/lib/api-client';

interface TicketMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    role?: string;
  };
  content: string;
  attachments?: string[];
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SupportTicket {
  _id: string;
  ticketId: string;
  subject: string;
  description: string;
  category: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  user: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  messages: TicketMessage[];
  lastResponseBy?: 'User' | 'Admin';
  lastResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketListResponse {
  success: boolean;
  data: SupportTicket[];
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
}

interface TicketResponse {
  success: boolean;
  data: SupportTicket;
  message?: string;
}

interface TicketCreateData {
  subject: string;
  description: string;
  category: string;
}

interface TicketResponseData {
  content: string;
  attachments?: string[];
}

interface TicketStatsResponse {
  success: boolean;
  data: {
    totalTickets: number;
    byStatus: {
      Open?: number;
      'In Progress'?: number;
      Resolved?: number;
      Closed?: number;
    };
    byCategory: {
      [key: string]: number;
    };
    byPriority: {
      Low?: number;
      Medium?: number;
      High?: number;
      Critical?: number;
    };
    averageResponseTime: string;
    ticketsToday: number;
    resolvedToday: number;
  };
}

// Get all tickets with pagination and filtering
export async function getTickets(
  page = 1,
  limit = 10,
  status?: string,
  category?: string,
  priority?: string,
  search?: string,
  assignedTo?: string,
  unassigned?: boolean,
  token?: string
) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) queryParams.append('status', status);
  if (category) queryParams.append('category', category);
  if (priority) queryParams.append('priority', priority);
  if (search) queryParams.append('search', search);
  if (assignedTo) queryParams.append('assignedTo', assignedTo);
  if (unassigned !== undefined) queryParams.append('unassigned', unassigned.toString());

  return apiClient.get<TicketListResponse>(
    `/support-tickets?${queryParams.toString()}`,
    { token }
  );
}

// Get a specific ticket by ID
export async function getTicketById(id: string, token?: string) {
  return apiClient.get<TicketResponse>(`/support-tickets/${id}`, { token });
}

// Create a new support ticket
export async function createTicket(data: TicketCreateData, token?: string) {
  return apiClient.post<TicketResponse>('/support-tickets', data, { token });
}

// Add a response to a ticket
export async function addTicketResponse(
  id: string,
  data: TicketResponseData,
  token?: string
) {
  return apiClient.post<TicketResponse>(
    `/support-tickets/${id}/responses`,
    data,
    { token }
  );
}

// Update ticket status (admin only)
export async function updateTicketStatus(
  id: string,
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed',
  token?: string
) {
  return apiClient.patch<TicketResponse>(
    `/support-tickets/${id}/status`,
    { status },
    { token }
  );
}

// Assign ticket to an admin (admin only)
export async function assignTicket(id: string, adminId: string, token?: string) {
  return apiClient.patch<TicketResponse>(
    `/support-tickets/${id}/assign`,
    { adminId },
    { token }
  );
}

// Update ticket priority (admin only)
export async function updateTicketPriority(
  id: string,
  priority: 'Low' | 'Medium' | 'High' | 'Critical',
  token?: string
) {
  return apiClient.patch<TicketResponse>(
    `/support-tickets/${id}/priority`,
    { priority },
    { token }
  );
}

// Get ticket statistics (admin only)
export async function getTicketStats(token?: string) {
  return apiClient.get<TicketStatsResponse>('/support-tickets/stats', { token });
}

export const supportTicketService = {
  getTickets,
  getTicketById,
  createTicket,
  addTicketResponse,
  updateTicketStatus,
  assignTicket,
  updateTicketPriority,
  getTicketStats,
};

export default supportTicketService;