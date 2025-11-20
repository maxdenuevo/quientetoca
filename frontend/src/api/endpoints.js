// ========================================
// QUIENTETO.CA - API ENDPOINTS
// ========================================
// This file provides a simple interface to the API client
// It works with both REST API and Supabase backends
// ========================================

import { apiClient } from '../lib/api-client';

// ========================================
// GROUP ENDPOINTS
// ========================================

export const createGroup = async (groupData) => {
  return await apiClient.createGroup(groupData);
};

export const getGroup = async (groupId, adminToken) => {
  return await apiClient.getGroup(groupId, adminToken);
};

export const updateGroup = async (groupId, updateData) => {
  return await apiClient.updateGroup(groupId, updateData);
};

// ========================================
// PARTICIPANT ENDPOINTS
// ========================================

export const getParticipant = async (participantId) => {
  return await apiClient.getParticipant(participantId);
};

export const updateParticipant = async (participantId, updateData) => {
  return await apiClient.updateParticipant(participantId, updateData);
};

// ========================================
// UTILITY ENDPOINTS
// ========================================

export const healthCheck = async () => {
  return await apiClient.healthCheck();
};
