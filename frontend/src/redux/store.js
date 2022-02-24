import { configureStore } from '@reduxjs/toolkit';
import mainReducer from './slice';

export default configureStore({
  reducer: {
    main: mainReducer,
  },
});
