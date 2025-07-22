import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'https://680cc0c92ea307e081d4edda.mockapi.io';
const FAMILY_API_URL = 'https://6808fb0f942707d722e09f1d.mockapi.io/FamilyData';

const initialUserData = { 
  name: '', 
  email: '',
  gender: '', 
  phone: '', 
  dob: '', 
  bloodGroup: '', 
  height: '', 
  weight: '', 
  isAlcoholic: false, 
  isSmoker: false, 
  allergies: '', 
  surgeries: '', 
  familyHistory: { 
    diabetes: false, 
    cancer: false, 
    heartDisease: false, 
    mentalHealth: false, 
    disability: false 
  }, 
  familyMembers: [], 
  additionalDetails: { 
    provider: '', 
    policyNumber: '', 
    coverageType: '', 
    startDate: '', 
    endDate: '', 
    coverageAmount: '', 
    primaryHolder: false 
  }
};

// Async thunks for API calls
export const fetchHealthData = createAsyncThunk(
  'healthData/fetchHealthData',
  async (email) => {
    const response = await axios.get(`${API_BASE_URL}/personalHealthDetails?email=${encodeURIComponent(email)}`);
    if (response.data.length > 0) {
      const apiData = response.data[0];
      const familyResponse = await axios.get(`${FAMILY_API_URL}?userId=${apiData.id}`);
      apiData.familyMembers = familyResponse.data;
      return apiData;
    }
    return initialUserData;
  }
);

export const saveHealthData = createAsyncThunk(
  'healthData/saveHealthData',
  async ({ data, email }) => {
    const payload = { ...data, email };
    if (!data.id) {
      const response = await axios.post(`${API_BASE_URL}/personalHealthDetails`, payload);
      return { ...data, id: response.data.id };
    } else {
      await axios.put(`${API_BASE_URL}/personalHealthDetails/${data.id}`, payload);
      return data;
    }
  }
);

export const saveFamilyMember = createAsyncThunk(
  'healthData/saveFamilyMember',
  async ({ familyMember, userId }) => {
    const familyMemberData = {
      ...familyMember,
      userId
    };

    if (familyMember.id) {
      await axios.put(`${FAMILY_API_URL}/${familyMember.id}`, familyMemberData);
    } else {
      await axios.post(FAMILY_API_URL, familyMemberData);
    }

    const response = await axios.get(`${FAMILY_API_URL}?userId=${userId}`);
    return response.data;
  }
);

export const deleteFamilyMember = createAsyncThunk(
  'healthData/deleteFamilyMember',
  async ({ familyMemberId, userId }) => {
    await axios.delete(`${FAMILY_API_URL}/${familyMemberId}`);
    const response = await axios.get(`${FAMILY_API_URL}?userId=${userId}`);
    return response.data;
  }
);

const healthDataSlice = createSlice({
  name: 'healthData',
  initialState: {
    data: initialUserData,
    loading: false,
    error: null
  },
  reducers: {
    updateHealthData: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    },
    resetHealthData: (state) => {
      state.data = initialUserData;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealthData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHealthData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchHealthData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(saveHealthData.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(saveFamilyMember.fulfilled, (state, action) => {
        state.data.familyMembers = action.payload;
      })
      .addCase(deleteFamilyMember.fulfilled, (state, action) => {
        state.data.familyMembers = action.payload;
      });
  }
});

export const { updateHealthData, resetHealthData } = healthDataSlice.actions;
export default healthDataSlice.reducer; 