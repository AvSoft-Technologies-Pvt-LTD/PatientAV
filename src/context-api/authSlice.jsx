import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://6810972027f2fdac2411f6a5.mockapi.io/users';

// --- Register User ---
export const registerUser = createAsyncThunk('auth/registerUser', async (userData) => {
  const userWithOtp = {
    ...userData,
    registerOTP: '123456',
    loginOTP: null
  };
  const response = await axios.post(BASE_URL, userWithOtp);
  return response.data;
});

// --- Login with Email & Password ---
export const loginUser = createAsyncThunk('auth/loginUser',async ({ email, password }, thunkAPI) => {
    try {
      const response = await axios.get(BASE_URL);
      const user = response.data.find((u) => u.email === email && u.password === password);

      if (!user) throw new Error('Invalid credentials');

      const userWithToken = { ...user, token: 'mock-jwt-token-login' };
      localStorage.setItem('user', JSON.stringify(userWithToken));
      localStorage.setItem('token', userWithToken.token);
      localStorage.setItem('email', user.email);      
      localStorage.setItem('userId', user.id);         

      return userWithToken;
    } catch (err) {
      return thunkAPI.rejectWithValue('Invalid email or password');
    }
  }
);
// --- Send Registration OTP ---
export const sendOTP = createAsyncThunk('auth/sendOTP', async (phone, thunkAPI) => {
  try {
    const response = await axios.get(BASE_URL);
    const user = response.data.find((u) => u.phone === phone);
    if (!user) throw new Error('User not found');

    const updatedUser = { ...user, registerOTP: '123456' };
    await axios.put(`${BASE_URL}/${user.id}`, updatedUser);

    return { message: 'Registration OTP sent', otp: '123456' };
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// --- Send Login OTP ---
export const sendLoginOTP = createAsyncThunk('auth/sendLoginOTP', async (phone, thunkAPI) => {
  try {
    const response = await axios.get(BASE_URL);
    const user = response.data.find((u) => u.phone === phone);
    if (!user) throw new Error('User not found');

    const updatedUser = { ...user, loginOTP: '654321' };
    await axios.put(`${BASE_URL}/${user.id}`, updatedUser);

    return { message: 'Login OTP sent', otp: '654321' };
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// --- Verify OTP ---
export const verifyOTP = createAsyncThunk('auth/verifyOTP', async ({ phone, otp, type }, thunkAPI) => {
  try {
    const response = await axios.get(BASE_URL);
    const user = response.data.find((u) => u.phone === phone);
    if (!user) throw new Error('User not found');

    const isValid = (
      (type === 'register' && user.registerOTP === otp) ||
      (type === 'login' && user.loginOTP === otp)
    );

    if (!isValid) throw new Error('Invalid OTP');

    const userWithToken = {
      ...user,
      token: `mock-jwt-token-${type}-${Date.now()}`
    };

    localStorage.setItem('user', JSON.stringify(userWithToken));
    localStorage.setItem('token', userWithToken.token);

    return userWithToken;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'OTP Verification failed');
  }
});

// --- Auth Slice ---
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isOTPSent: false,
    isVerified: false,
    isAuthenticated: false,
    userType: null,
  },
  reducers: {
    resetAuthState: (state) => {
      state.loading = false;
      state.error = null;
      state.isOTPSent = false;
      state.isVerified = false;
      state.isAuthenticated = false;
      state.user = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setUserType: (state, action) => {
      state.userType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isOTPSent = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Login with email/password
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isVerified = true;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send OTP for registration
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.loading = false;
        state.isOTPSent = true;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send OTP for login
      .addCase(sendLoginOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendLoginOTP.fulfilled, (state) => {
        state.loading = false;
        state.isOTPSent = true;
      })
      .addCase(sendLoginOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isVerified = true;
        state.isAuthenticated = true;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetAuthState, setUser, setUserType } = authSlice.actions;

export default authSlice.reducer;


