import { NavigatorScreenParams } from "@react-navigation/core";

export type ChatStackParamList = {
  MapScreen: undefined;
  ChatTab: {
    fetchChats?: boolean;
    participants?: Participant[];
  };
  ChatListTab: { fetchChats: boolean } | undefined;
  AddChat: { fetchChats: boolean } | undefined;
  AddChatTab: { fetchChats: boolean } | undefined;
  AddOneToOneChat: undefined;
  AvatarChanger: undefined;
  AddGroup: undefined;
  ProfileTab: undefined;
};

export type LoginStackParamList = {
  LoadingScreen: undefined;
  RegisterTab: undefined;
  MultiUsePhone: undefined;
  ConfirmationNumber: undefined;
};

export type NavigationProps = {
  ChatStack: NavigatorScreenParams<ChatStackParamList>;
  LoginStack: NavigatorScreenParams<LoginStackParamList>;
} & ChatStackParamList &
  LoginStackParamList;