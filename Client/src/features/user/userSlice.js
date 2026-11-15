import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import toast from "react-hot-toast";

const initialState = {
    value: null,
    loading: false,
    error: null
}

export const fetchUser = createAsyncThunk('user/fetchUser', async (token, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/api/user/data', {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (data.success) {
            return data.user
        } else {
            return rejectWithValue(data.message || 'User not found')
        }
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message)
    }
})

export const updateUser = createAsyncThunk('user/update', async ({ userData, token }, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/api/user/update', userData, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (data.success) {
            toast.success(data.message)
            return data.user
        } else {
            toast.error(data.message)
            return rejectWithValue(data.message)
        }
    } catch (error) {
        toast.error(error.response?.data?.message || error.message)
        return rejectWithValue(error.message)
    }
})

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUser: (state) => {
            state.value = null
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false
                state.value = action.payload
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.value = action.payload
            })
    }
})

export const { clearUser } = userSlice.actions
export default userSlice.reducer
