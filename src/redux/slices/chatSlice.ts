import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatState {
  currentChatID: string;
  currentChatName: string;
  chatType: string;
  // chats: {
  //   [chatId: string]: {
  //     // not sure if we want to use this
  //     messages?: MessageItem[];
  //     latestMessageDate: Date;
  //     oldestMessageDate: Date;
  //   };
  // };
}

const initialState: ChatState = {
  currentChatID: "",
  currentChatName: "",
  chatType: "",
  // chats: {},
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentChat: (state: ChatState, action: PayloadAction<ChatState>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.currentChatID = action.payload.currentChatID;
      state.currentChatName = action.payload.currentChatName;
      state.chatType = action.payload.chatType;
    },
    // setChatMessages: (state, action: PayloadAction<ChatState>)
  },
});

export const { setCurrentChat } = chatSlice.actions;
export default chatSlice.reducer;
