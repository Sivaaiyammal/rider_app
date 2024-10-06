import apiClient from "../APIClient";

// request OTP
export const requestOTP = async (payload) => {
  const { data } = await apiClient.post('/driver/auth/login', payload);
  return data;
};

// verify OTP
export const verifyOTP = async (payload) => {
  const { data } = await apiClient.post('/driver/auth/verifyOTP', payload);
  return data;
};
