import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DefaultTheme } from "styled-components/native";
import { blueTheme } from "../../components/themes/default";
export interface ThemeState {
  theme: DefaultTheme;
}

const initialState: ThemeState = {
  theme: blueTheme,
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setCurrentTheme: (
      state: ThemeState,
      action: PayloadAction<DefaultTheme>
    ) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.theme = action.payload;
    },
  },
});

export const { setCurrentTheme } = themeSlice.actions;
export default themeSlice.reducer;
