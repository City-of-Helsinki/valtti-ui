import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { client } from "../../api";
import { User } from "../types";

// types from internal lib
type IPinCredentials = any;
type IProfile = any;

export interface UserSlice {
  user: User;
  profile: IProfile;
}

const initialState: UserSlice = {
  user: {
    phoneNumber: "",
    id: "",
    jwt: "",
    roleType: "relative",
    pinLogin: {
      PIN: "",
      userToken: "",
      // cookie: "",
    },
  },
  profile: {},
};

/**
 * Sets profile data to the state
 */
export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async ({
    userID,
    roleType,
  }: {
    userID: string;
    roleType: User["roleType"];
  }) => {
    // if the user is a child the roletype should be 'relative' if the user is a professional the roletype should be 'caregiver'
    try {
      return await client.fetchUser(userID, "");
    } catch (exception) {
      console.error(exception);
      throw exception;
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.user = action.payload;
    },
    updateUserData: (state, action: PayloadAction<Partial<User>>) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    updateProfileData: (state, action: PayloadAction<Partial<IProfile>>) => {
      state.profile = {
        ...state.profile,
        ...action.payload,
      };
    },
    setPhoneNumberState: (state, action: PayloadAction<string>) => {
      state.user.phoneNumber = action.payload;
    },
    // depricated, why should we have multiple seperate actions to set user data.
    // we should preferably use updateUserData to set all the data with one dispatch
    setUserJwt: (state, action: PayloadAction<string>) => {
      state.user.jwt = action.payload;
    },
    setPINLogin: (state, action: PayloadAction<IPinCredentials>) => {
      state.user.pinLogin = action.payload;
    },
    setToInitialState: (state) => {
      state.user = initialState.user;
      state.profile = initialState.profile;
    },
    setPictureURI: (state, action: PayloadAction<string>) => {
      state.profile.pictureURI = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchUserById.fulfilled, (state, action) => {
      if (action.payload.name) {
        state.profile.name = action.payload.name;
      } else {
        state.profile.name = "No username";
      }
      if (action.payload.pictureURI) {
        state.profile.pictureURI = action.payload.pictureURI;
      } else {
        state.profile.pictureURI = "";
      }
      if (action.payload.descriptionURI) {
        state.profile.descriptionURI = action.payload.descriptionURI;
      } else {
        state.profile.descriptionURI = "";
      }
    });
  },
});

export const {
  setUser,
  setPhoneNumberState,
  setUserJwt,
  setPINLogin,
  updateUserData,
  updateProfileData,
  setToInitialState,
  setPictureURI,
} = userSlice.actions;
export default userSlice.reducer;
