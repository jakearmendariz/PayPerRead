import { createSlice } from '@reduxjs/toolkit';

export const slice = createSlice({
  name: 'main',
  initialState: {
    loggedIn: false,
    isIframe: false,
  },
  reducers: {
    setLoggedIn: (state, action) => {
      state.loggedIn = action.payload.loggedIn;
    },
    setIsIframe: (state, action) => {
      state.isIframe = action.payload.isIframe;
    },
  },
});

export const {
  setLoggedIn,
  setIsIframe,
} = slice.actions;

export const selectLoggedIn = (state) => state.main.loggedIn;
export const selectIsIframe = (state) => state.main.isIframe;

export default slice.reducer;
