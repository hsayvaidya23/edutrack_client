import axios from 'axios';
import { Teacher } from '../types/teacher';

const API_URL = `${import.meta.env.VITE_SITE}/api/teachers`;

// Get all teachers
export const getTeachers = async (token: string): Promise<Teacher[]> => {
  try {
    const response = await axios.get<Teacher[]>(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Ensure the response data is in the expected format
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid response format: Expected an array of teachers');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Axios-specific error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Backend error:', error.response.data);
        throw new Error(error.response.data.message || 'Failed to fetch teachers');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw new Error('No response received from the server');
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
        throw new Error('Failed to set up the request');
      }
    } else {
      // Non-Axios error
      console.error('Unexpected error:', error);
      throw new Error('An unexpected error occurred');
    }
  }
};


// Create a teacher
export const createTeacher = async (teacherData: Omit<Teacher, 'id'>, token: string): Promise<Teacher> => {
  const response = await axios.post<Teacher>(API_URL, teacherData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateTeacher = async (
  id: string | undefined, 
  teacherData: Partial<Teacher>, 
  token: string
): Promise<Teacher> => {
  if (!id) {
    throw new Error('Teacher ID is required');
  }

  try {
    const response = await axios.put<Teacher>(`${API_URL}/${id}`, teacherData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Handle specific HTTP errors
        if (error.response.status === 404) {
          throw new Error('Teacher not found');
        }
        if (error.response.status === 500) {
          throw new Error(`Server error: ${error.response.data.message || 'Unknown error'}`);
        }
        throw new Error(error.response.data.message || 'Failed to update teacher');
      }
      throw new Error('Network error occurred');
    }
    throw new Error('An unexpected error occurred');
  }
};

// Delete a teacher
export const deleteTeacher = async (
  id: string | undefined, 
  token: string
): Promise<void> => {
  if (!id) {
    throw new Error('Teacher ID is required');
  }

  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Handle specific HTTP errors
        if (error.response.status === 404) {
          throw new Error('Teacher not found');
        }
        if (error.response.status === 500) {
          throw new Error(`Server error: ${error.response.data.message || 'Unknown error'}`);
        }
        throw new Error(error.response.data.message || 'Failed to delete teacher');
      }
      throw new Error('Network error occurred');
    }
    throw new Error('An unexpected error occurred');
  }
};