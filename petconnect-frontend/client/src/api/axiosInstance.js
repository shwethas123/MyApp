import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getDashboardStats = async () => {
  const response = await axiosInstance.get("admin/dashboard");
  return response.data;
};

export const getAdminUsers = async (page = 1, limit = 10, search = "", role = "") => {
  const response = await axiosInstance.get(`admin/users?page=${page}&limit=${limit}&search=${search}&role=${role}`);
  return response.data;
};

export const updateUserStatus = async (id, account_status) => {
  const response = await axiosInstance.patch(`admin/users/${id}/status`, { account_status });
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await axiosInstance.patch(`admin/users/${id}/role`, { role });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`admin/users/${id}`);
  return response.data;
};
export const getAdminReports = async (page = 1, limit = 10, status = "") => {
  const response = await axiosInstance.get(`admin/reports?page=${page}&limit=${limit}&status=${status}`);
  return response.data;
};

export const updateReportStatus = async (id, status) => {
  const response = await axiosInstance.patch(`admin/reports/${id}`, { status });
  return response.data;
};
export default axiosInstance;
