import { apiClient } from "../api-client";

export interface Discussion {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  discussion: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionFormData {
  title: string;
  content: string;
}

export interface CommentFormData {
  content: string;
  discussionId: string;
}

// Discussion service methods
export const getAllDiscussions = async (page = 1, limit = 10) => {
  return await apiClient.get(`/discussions?page=${page}&limit=${limit}`);
};

export const getDiscussionById = async (id: string) => {
  return await apiClient.get(`/discussions/${id}`);
};

export const createDiscussion = async (data: DiscussionFormData) => {
  return await apiClient.post("/discussions", data);
};

export const updateDiscussion = async (id: string, data: DiscussionFormData) => {
  return await apiClient.put(`/discussions/${id}`, data);
};

export const deleteDiscussion = async (id: string) => {
  return await apiClient.delete(`/discussions/${id}`);
};

// Comment service methods
export const getCommentsByDiscussion = async (discussionId: string, page = 1, limit = 10) => {
  return await apiClient.get(`/discussions/${discussionId}/comments?page=${page}&limit=${limit}`);
};

export const createComment = async (data: CommentFormData) => {
  return await apiClient.post("/comments", data);
};

export const updateComment = async (id: string, content: string) => {
  return await apiClient.put(`/comments/${id}`, { content });
};

export const deleteComment = async (id: string) => {
  return await apiClient.delete(`/comments/${id}`);
};