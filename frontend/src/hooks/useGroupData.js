import { useState, useCallback } from 'react';
import {
  getGroup,
  createGroup as createGroupAPI,
  updateGroup as updateGroupAPI
} from '../api/endpoints';

export const useGroupData = () => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGroup = useCallback(async (groupId, adminToken) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGroup(groupId, adminToken);
      setGroup(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGroup = useCallback(async (groupData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createGroupAPI(groupData);
      setGroup(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGroup = useCallback(async (groupId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const data = await updateGroupAPI(groupId, updates);
      setGroup(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    group,
    loading,
    error,
    fetchGroup,
    createGroup,
    updateGroup,
  };
};