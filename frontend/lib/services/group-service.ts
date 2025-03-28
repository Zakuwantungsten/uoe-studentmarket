import { apiClient } from "../api-client";

export interface Group {
  _id: string;
  name: string;
  description: string;
  image?: string;
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  members: {
    _id: string;
    name: string;
    email: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupFormData {
  name: string;
  description: string;
  image?: string;
}

export const getAllGroups = async (page = 1, limit = 10) => {
  return await apiClient.get(`/groups?page=${page}&limit=${limit}`);
};

export const getGroupById = async (id: string) => {
  return await apiClient.get(`/groups/${id}`);
};

export const createGroup = async (data: GroupFormData) => {
  return await apiClient.post("/groups", data);
};

export const updateGroup = async (id: string, data: GroupFormData) => {
  return await apiClient.put(`/groups/${id}`, data);
};

export const deleteGroup = async (id: string) => {
  return await apiClient.delete(`/groups/${id}`);
};

export const joinGroup = async (id: string) => {
  return await apiClient.post(`/groups/${id}/join`);
};

export const leaveGroup = async (id: string) => {
  return await apiClient.post(`/groups/${id}/leave`);
};