import { createSlice } from '@reduxjs/toolkit';

export const slice = createSlice({
  name: 'main',
  initialState: {
    loggedIn: false,
    isIframe: false,
    paymentRedirect: '/reader',
  },
  reducers: {
    setLoggedIn: (state, action) => {
      state.loggedIn = action.payload.loggedIn;
    },
    setIsIframe: (state, action) => {
      state.isIframe = action.payload.isIframe;
    },
    setPaymentRedirect: (state, action) => {
      if (state.paymentRedirect === '/reader' && action.payload.paymentRedirect !== undefined) {
        state.paymentRedirect = action.payload.paymentRedirect;
      }
    },
  },
});

export const {
  setLoggedIn,
  setIsIframe,
  setPaymentRedirect,
  setReferrer,
} = slice.actions;

export const selectLoggedIn = (state) => state.main.loggedIn;
export const selectIsIframe = (state) => state.main.isIframe;
export const selectPaymentRedirect = (state) => state.main.paymentRedirect;

export default slice.reducer;
