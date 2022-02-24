import { createSlice } from '@reduxjs/toolkit';

export const slice = createSlice({
  name: 'main',
  initialState: {
    loggedIn: false,
  },
  reducers: {
    setLoggedIn: (state, action) => {
      state.loggedIn = action.payload.loggedIn;
    },
  },
});

export const {
  setLoggedIn,
} = slice.actions;

export const selectLoggedIn = (state) => state.main.loggedIn;

export default slice.reducer;
