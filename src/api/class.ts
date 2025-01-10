import axios from 'axios';
import { Class } from '../types/class';


const API_URL = `${import.meta.env.VITE_SITE}/api/classes`;

export const getClasses = async (token: string): Promise<{ value: string; label: string }[]> => {
  const response = await axios.get<{ _id: string; className: string }[]>(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Transform the response into the format expected by the dropdown
  return response.data.map((cls) => ({
    value: cls._id, // Use the class ID (ObjectId) as the value
    label: cls.className, // Use the class name as the label
  }));
};

export const getClassDetails = async (classId: string, token: string): Promise<any> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SITE}/api/classes/${classId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch class details');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching class details:', error);
    throw error;
  }
};
// Create a class
export const createClass = async (
  classData: Omit<Class, 'id' | 'studentCount'>, 
  token: string
): Promise<Class> => {
  try {
    const response = await axios.post<Class>(API_URL, classData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with an error
        const message = error.response.data?.message || 'Failed to create class';
        console.error('Server error:', error.response.data);
        throw new Error(message);
      } else if (error.request) {
        // Request made but no response received
        console.error('No response received:', error.request);
        throw new Error('Server not responding. Please try again later.');
      } else {
        // Error setting up the request
        console.error('Request setup error:', error.message);
        throw new Error('Failed to send request');
      }
    }
    // Handle non-axios errors
    console.error('Unexpected error:', error);
    throw new Error('An unexpected error occurred');
  }
};

// Update a class
export const updateClass = async (id: string, classData: Partial<Class>, token: string): Promise<Class> => {
  const response = await axios.put<Class>(`${API_URL}/${id}`, classData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Delete a class
export const deleteClass = async (id: string, token: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};