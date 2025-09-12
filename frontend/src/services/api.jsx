const API_BASE_URL = 'http://localhost:8000'; // Update with your backend URL

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const processFile = async (filename) => {
  try {
    const response = await fetch(`${API_BASE_URL}/process/${filename}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Processing failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
};

export const downloadFile = async (filename) => {
  try {
    const response = await fetch(`${API_BASE_URL}/download/${filename}`);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

export const getProcessingStatus = async (filename) => {
  try {
    const response = await fetch(`${API_BASE_URL}/status/${filename}`);

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking status:', error);
    throw error;
  }
};