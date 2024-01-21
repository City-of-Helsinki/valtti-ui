import React, { useEffect, useState } from "react";
import { AppState, BackHandler, FlatList } from "react-native";
import { useDispatch } from "react-redux";
import { ChatItem } from "../../components/ChatList/ChatItem";
import {
  ChatListContainer,
  ChatListHeader,
} from "../../components/ChatList/ChatList";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore because estlint is weird
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import defaultAvatar from "../../icons/avatar_0.png";
import { useNavigation } from "../../navigation";

import { StackScreenProps } from "@react-navigation/stack";
import { UseMutationResult } from "@tanstack/react-query";
import { fetchChatLastSeen } from "../../api";
import {
  Divider,
  Spinner,
} from "../../components/Common/CommonStyledComponents";
import { ChatStackParamList } from "../../navigation/types";
import {
  getChats,
  updateJWT,
  updateLastSeen,
  useGetParticipantsList,
  usePostToken,
} from "../../queries";
import { getUser } from "../../redux/hooks";
import { setCurrentChat } from "../../redux/slices/chatSlice";
import { setUserJwt } from "../../redux/slices/userSlice";
import { store } from "../../redux/store";
import {
  dismissSeenNotification,
  registerForPushNotificationsAsync,
} from "../../util/notifications";

export default function ChatListScreen(
  navigator: StackScreenProps<ChatStackParamList, "ChatListTab">
) {
  const participantMutation = useGetParticipantsList();
  const mutation: UseMutationResult<
    {
      notifierID: string;
    },
    unknown,
    postToken,
    unknown
  > = usePostToken();
  const isFocused = useIsFocused();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  let { fetchChats: refetchChats } = navigator.route.params || {
    fetchChats: false,
  };
  const [isLoadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        // if the app becomes active fetch all chats
        // this has to be done because if the application is running in the foreground we have to
        // refetch and rerender the notification "balls"
        fetchChats();
      }
    });
    const notificationSubscription =
      Notifications.addNotificationReceivedListener(notificationListener);

    return () => {
      subscription.remove();
      notificationSubscription.remove();
    };
  });

  useEffect(() => {
    if (isFocused) {
      if (refetchChats) {
        fetchChats();
        refetchChats = false;
        return;
      }
      // when a user goes into a chat and comes back to this chat list afterwards
      // we have refetch all unread messages to clear out old notifiers. By notifiers I mean the "balls"
      getNotRead(chats);
    }
  }, [isFocused]);

  // notification listener, listens to notifications while the application is active.
  // upon a new notification sets the chat's variable unread to true
  const notificationListener = function (
    notification: Notifications.Notification
  ) {
    const notificationChatID = notification.request.content.data["chatID"];
    // if the notification request contains chatID set unread
    if (notificationChatID && chats && chats.length > 0) {
      // set chat as unread in the state
      const newChats = chats.map((val) =>
        val.chatID === notificationChatID ? { ...val, hasunread: true } : val
      );
      setChats(newChats);
    }
  };

  useEffect(() => {
    if (refetchChats) {
      setChats([]);
      refetchChats = false;
      fetchChats();
    } else {
      fetchChats();
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      BackHandler.addEventListener("hardwareBackPress", () => {
        if (navigator.navigation.getState().index === 0) return true;
        else return false;
      });
    }, [])
  );

  useEffect(() => {
    const lastSeenInterval: NodeJS.Timeout = setInterval(async () => {
      const userID = getUser().id;
      if (!userID) return clearInterval(lastSeenInterval);
      else await updateLastSeen();
    }, 60000);

    const JWTinterval = setInterval(async () => {
      const pinLogin = getUser().pinLogin;
      if (pinLogin.userToken) {
        const jwt = await updateJWT();
        dispatch(setUserJwt(jwt.jwt));
      } else {
        clearInterval(JWTinterval);
      }
    }, 60000 * 30);

    return () => {
      clearInterval(JWTinterval);
      clearInterval(lastSeenInterval);
    };
  }, []);

  // FIXME: use react-query (useQuery) instead, we shouldn't use these whilst we can use react-query
  const fetchChats = () => {
    setLoadingChats(true);
    getChats()
      .then((chatList) => {
        setChats([]);
        let testList: ChatItem[] = [];
        for (const chat of chatList) {
          const test: ChatItem = {
            chatID: chat.chatID,
            chatType: chat.chatType,
            name: chat.name ? chat.name : chat.chatID,
          };
          testList = testList.concat(test);
        }
        return testList;
      })
      .then(async (testList) => {
        // let token = undefined;
        // if (!isRunningInExpoGo)
        // token = await registerForPushNotificationsAsync();
        const token = await registerForPushNotificationsAsync();
        let list: string[] = [];
        let realChatList: ChatItem[] = [];

        for (const chat of testList) {
          if (token && token.tokenPayload !== undefined) {
            mutation.mutate({
              chatID: chat.chatID,
              notificationToken: {
                tokenPayload: token.tokenPayload,
                tokenType: token.tokenType,
              },
            });
          }
          list = list.concat(chat.chatID);
        }

        participantMutation.mutate(list, {
          onSuccess: (data) => {
            const userID = store.getState().user.user.id;
            for (const chat of testList) {
              const chatters = data.find(
                (p: ParticipantList) => p.chatID === chat.chatID
              );
              if (!chatters?.participants) {
                // if no participants, there is no chats
                setChats([]);
                return;
              }
              const chatter = chatters.participants.find(
                (p) => p.profileID !== userID
              );

              if (chat.chatType === "one-to-one") {
                if (!chatter) continue;
                const finalChat: ChatItem = {
                  chatID: chat.chatID,
                  chatType: chat.chatType,
                  name: chatter.name ? chatter.name : chat.name,
                  pictureURI: chatter.pictureURI
                    ? chatter.pictureURI
                    : undefined,
                  participants: chatters.participants,
                };
                realChatList = realChatList.concat(finalChat);
              } else {
                const finalChat: ChatItem = {
                  chatID: chat.chatID,
                  chatType: chat.chatType,
                  name: chat.name,
                  pictureURI: "groupChat",
                  participants: chatters.participants,
                };
                realChatList = realChatList.concat(finalChat);
              }
            }
            // sets loading chats to false
            getNotRead(realChatList);
          },
          onError: (error) => {
            console.log(error);
          },
        });
      });
  };

  const getNotRead = async (chatsList: ChatItem[]) => {
    const userID = getUser().id;
    const localChats: ChatItem[] = [];

    for (const chat of chatsList) {
      const seen = await fetchChatLastSeen(chat.chatID);
      const notSeenChat: ChatItem = {
        chatID: chat.chatID,
        hasunread:
          seen !== null &&
          Object.keys(seen).length !== 0 &&
          !Object.keys(seen).includes(userID),
        chatType: chat.chatType,
        name: chat.name,
        pictureURI: chat.pictureURI,
        participants: chat.participants,
      };
      localChats.push(notSeenChat);
    }
    setChats(localChats);
    setLoadingChats(false);

    // if there is no unread messagese set badge count to zero
    if (chats.filter((chat) => chat.hasunread).length === 0) {
      Notifications.setBadgeCountAsync(0);
    }
  };

  const fetchMoreChats = () => null;

  const HandleOnPress = async (chatID: string) => {
    const chat = chats.find((chat) => chat.chatID === chatID);
    if (!chat) return;
    dispatch(
      setCurrentChat({
        currentChatID: chatID,
        currentChatName: chat?.name ? chat?.name : "",
        chatType: chat?.chatType,
      })
    );

    // set chat as read in the state
    const newChats = chats.map((val) =>
      val.chatID === chatID ? { ...val, hasunread: false } : val
    );
    setChats(newChats);
    // when opening a chat dismiss the notifications relating to the chat
    await dismissSeenNotification(chatID);
    navigation.navigate("ChatTab", { participants: chat?.participants });
  };

  const toProfile = () => {
    navigation.push("ProfileTab");
  };

  const toAddChat = () => {
    navigation.push("AddChatTab");
  };
  const renderItem = ({ item }: { item: ChatItem }) => {
    return (
      <ChatItem
        key={item.chatID}
        chat={item}
        onClick={HandleOnPress}
        avatar={item.pictureURI ? item.pictureURI : defaultAvatar}
      />
    );
  };
  return (
    <ChatListContainer>
      <ChatListHeader
        toProfile={toProfile}
        roleType={getUser().roleType}
        toAddChat={toAddChat}
      />
      {isLoadingChats ? (
        <>
          <Divider />
          <Spinner />
        </>
      ) : (
        <FlatList
          onEndReached={() => {
            fetchMoreChats();
          }}
          onEndReachedThreshold={0.3}
          data={chats}
          renderItem={renderItem}
        />
      )}
    </ChatListContainer>
  );
}
