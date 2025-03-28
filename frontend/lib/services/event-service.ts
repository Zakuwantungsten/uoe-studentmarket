import { apiClient } from "../api-client";

export interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  image?: string;
  organizer: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventFormData {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  image?: string;
}

export const getAllEvents = async (page = 1, limit = 10, upcoming = true) => {
  return await apiClient.get(`/events?page=${page}&limit=${limit}&upcoming=${upcoming}`);
};

export const getEventById = async (id: string) => {
  return await apiClient.get(`/events/${id}`);
};

export const createEvent = async (data: EventFormData) => {
  return await apiClient.post("/events", data);
};

export const updateEvent = async (id: string, data: EventFormData) => {
  return await apiClient.put(`/events/${id}`, data);
};

export const deleteEvent = async (id: string) => {
  return await apiClient.delete(`/events/${id}`);
};

export const rsvpToEvent = async (id: string) => {
  return await apiClient.post(`/events/${id}/rsvp`);
};