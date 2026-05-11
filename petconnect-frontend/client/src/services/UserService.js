import ApiService from "./Apiservices";

const UserService = {
  // AUTH
  login: async (payload) => {
    const response = await ApiService.post("/users/login", payload);
    return response.data;
  },

  register: async (payload) => {
    const response = await ApiService.post("/users/register", payload);
    return response.data;
  },

  logout: async () => {
    await ApiService.post("/users/logout");
  },

  // Called once on app boot by AuthProvider to rehydrate state from the cookie
  refreshToken: async () => {
    const response = await ApiService.post("/users/refresh-token");
    return response.data;
  },

  // PASSWORD RESET
  forgotPassword: async (email) => {
    const response = await ApiService.post("/users/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await ApiService.post("/users/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },

  // OTP
  // OTP
  sendOtp: async (email) => {
    const response = await ApiService.post("/users/send-otp", { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await ApiService.post("/users/verify-otp", { email, otp });
    return response.data;
  },

  // PROFILE
  getProfile: async () => {
    const response = await ApiService.get("/users/profile");
    return response.data;
  },

  completeProfile: async (userId, profileData) => {
    const response = await ApiService.put(
      `/users/${userId}/profile`,
      profileData,
    );
    return response.data;
  },
};

export default UserService;
