import * as Clipboard from "expo-clipboard";
import {
  Alert,
  AppState,
  FlatList,
  Keyboard,
  Modal,
  TouchableOpacity,
  View,
} from "react-native";
import styled from "styled-components/native";

import {
  BackIcon,
  ChatContainer,
  ChatHeader,
  DeleteIcon,
  ImageHeader,
  InfoContainer,
  LargeImageContainerStyle,
  MessageInformation,
  MessageInformationContainerStyle,
  MessageInfoText,
} from "../../components/Chat/Chat";
import ChatInput from "../../components/Chat/ChatInput";
import ChatMessage from "../../components/Chat/ChatMessage";
import {
  ChatIcon,
  ImageLoader,
  LargeIcon,
  LargeImage,
  SpinnerContainer,
  WhiteText,
} from "../../components/Chat/ChatMessageItem";
import {
  Divider,
  Spinner,
} from "../../components/Common/CommonStyledComponents";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore because estlint is weird
import defaultAvatar from "../../icons/avatar_0.png";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore because estlint is weird
import { ImagePickerAsset } from "expo-image-picker";
import groupChat from "../../icons/groupChat.png";
import { avatars } from "../../icons/icons";
import { useNavigation } from "../../navigation";
import {
  entrySeen,
  fetchChatEntryState,
  MessageItem,
  useCurrentChatMessages,
  useGetParticipants,
  usePostImageMessage,
  usePostSoundMessage,
  usePostTextMessage,
} from "../../queries";
import { useProfile, useUser } from "../../redux/hooks";
import { store } from "../../redux/store";
import { formatTime, formatTimestamp, useImage } from "../../utils";

import { removeMessage } from "../../api";

import { StackScreenProps } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import { ChatStackParamList } from "../../navigation/types";
import { dismissSeenNotification } from "../../util/notifications";

import ConversationSettings, {
  Conversation,
} from "../../components/Chat/ConversationSettings";
import { ImageUtils } from "../../imageUtils";

// el psykoosi => https://learn.microsoft.com/en-us/javascript/api/@azure/keyvault-certificates/requireatleastone?view=azure-node-latest
export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
    Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export type SendMessageItem = {
  type: "image" | "text" | "sound";
} & RequireAtLeastOne<{
  message?: string;
  media?: ImagePickerAsset;
  soundBase64: string;
}>;

export default function Chat(
  navigator: StackScreenProps<ChatStackParamList, "ChatTab">
) {
  const { participants } = navigator.route.params || { participants: [] };
  const user = useUser();
  const chat = store.getState().chat;
  const isFocused = navigator.navigation.isFocused();
  const participantMutation = useGetParticipants();
  const [lastSeen, setLastSeen] = useState("");
  const [seenEntries, setSeenEntries] = useState<string[]>([]);
  const [seenBy, setSeenBy] = useState<SeenBy[]>([]);
  // it was easier to have them both in the same state rather than to wait for one state update to finish to recieve the next and then try to pain the modal
  const [showMessageInformation, setShowMessage] = useState<{
    show: boolean;
    message?: MessageItem;
  }>({ show: false });
  const [showImageInfo, setShowLargeImage] = useState<{
    show: boolean;
    message?: MessageItem;
  }>({ show: false });
  const [showConvoSettings, setShowConvoSettings] = useState(false);
  const [conversation, setConversation] = useState<Conversation>({
    type: "",
    id: "",
  });

  const profile = useProfile();
  const {
    messages,
    fetchPerviousMessages,
    fetchIncomingMessages,
    isLoading: isLoadingMessages,
    isError,
    fetchError,
  } = useCurrentChatMessages();
  const navigation = useNavigation();
  const myAvatar =
    avatars.find((avatar) => avatar.picture === profile.pictureURI)?.avatar ||
    defaultAvatar;
  const textMsgMutation = usePostTextMessage();
  const imageMsgMutation = usePostImageMessage();
  const soundMsgMutation = usePostSoundMessage();

  // TODO find a better solution because hooks cant have conditionals we cant if so we have to use "as string"
  if (!participants) throw new Error("participants is undefined");

  // if there is only one participant we'll use this variable to get the name etc
  const participantUser = participants.find(
    (p: Participant) => p.profileID !== user.id
  );

  const postNewMessage = async ({
    type,
    message,
    media,
    soundBase64,
  }: SendMessageItem) => {
    if (type === "image") {
      if (!!media && typeof media.base64 === "string") {
        imageMsgMutation.mutate({
          media,
          senderId: user.id,
          date: new Date(),
        });
      }
    } else if (type === "text") {
      if (!message || message.length === 0) return;
      textMsgMutation.mutate({
        message: message as string,
        senderId: user.id,
        date: new Date(),
      });
    } else if (type === "sound") {
      soundMsgMutation.mutate({
        base64: soundBase64 || "",
        senderId: user.id,
        date: new Date(),
      });
    } else {
      console.log("This message type has not been implemented yet");
      return;
    }
  };

  const GetParticipants = async () => {
    try {
      participantMutation.mutate(chat.currentChatID, {
        onSuccess: async (data) => {
          const userID = user.id;
          const chatter = data.find((p) => p.profileID !== userID);
          if (!chatter) {
            Alert.alert("Kääk! Jotain meni pieleen yritä myöhemmin uudelleen");
            return;
          }
          if (chatter.lastSeen)
            setLastSeen(formatTimestamp(new Date(chatter.lastSeen)));
        },
        onError: (error) => {
          console.log("error: " + error);
        },
      });
    } catch (error) {
      console.log("error: " + error);
    }
  };

  useEffect(() => {
    const entries = messages
      .flatMap((val) => Object.values(val))
      .flatMap((e) => e.map((m) => m.entryID));
    for (const entryID of entries) {
      if (!seenEntries.includes(entryID)) {
        entrySeen(entryID, chat.currentChatID);
      }

      setSeenEntries([...seenEntries, entryID]);
    }
  }, [messages]);

  const getMessageState = async (entryID: string) => {
    const state = await fetchChatEntryState(entryID, chat.currentChatID);
    return state;
  };

  useEffect(() => {
    if (showMessageInformation.message) {
      getMessageState(showMessageInformation.message.entryID).then((state) => {
        const arr = Object.keys(state).map((key) => ({
          userID: key,
          seenAT: state[key],
        }));
        const seenArr: SeenBy[] = [];
        for (const participant of participants) {
          const seen = arr.find((s) => s.userID === participant.profileID);
          if (seen && seen.userID !== user.id) {
            seenArr.push({
              name: participant.name as string,
              seenAt: seen.seenAT,
              userID: participant.profileID as string,
            });
          }
        }
        setSeenBy(seenArr);
      });
    }

    return () => {
      setSeenBy([]);
    };
  }, [showMessageInformation]);

  useEffect(() => {
    GetParticipants();
  }, [isFocused]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextState) => {
        if (nextState === "active") {
          // if the app becomes active fetch all new messages
          // this has to be done because if the application is running in the foreground we have to
          // refetch and rerender the messages
          fetchIncomingMessages();
          // if there is new messages then there must be new notifications that we have to clear out. So let's clear some notifications.
          await dismissSeenNotification(chat.currentChatID);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  });

  const notDoneYet = () => {
    Alert.alert("Tämä toiminnallisuus ei ole vielä käytössä.");
  };

  const renderItem = ({ item }: { item: MessageGroup }) => {
    const msgs = Object.values(item)[0];
    if (msgs.length <= 0) throw new Error("messages cannot be empty");
    const { outgoing, date } = msgs[msgs.length - 1];
    const sender = participants.find(
      (p: Participant) => p.profileID === msgs[0].senderID
    );
    const senderAvatar =
      avatars.find((avatar) => avatar.picture === sender?.pictureURI)?.avatar ||
      defaultAvatar;

    return (
      <ChatMessage
        avatar={outgoing ? myAvatar : senderAvatar || defaultAvatar}
        sender={outgoing ? profile.name : sender?.name}
        messages={msgs}
        key={date.getTime()}
        onLongPress={(message: MessageItem) => {
          setShowMessage({ show: true, message })
        }}
        onPress={(message: MessageItem) => {
          // on short press open the large image modal, reasoning behind this is that other chat applications have done this also which makes it easier for new users to adapt to this application
          if(message.type === "image"){
            setShowLargeImage({show:true, message})
          }
        }}
        outgoing={outgoing}
      />
    );
  };

  // When conversation is deleted, navigate to chatList-screen
  const onConversationDeleted = () =>
    navigation.navigate("ChatListTab", { fetchChats: true });

  // If there was error fetching chat messages
  // and the error type is NotAuthorizedError
  // then in most cases the chat was just deleted
  // in that case, navigate to chatList screen
  if (isError && fetchError?.name === "NotAuthorizedError") {
    onConversationDeleted();
    Alert.alert("", "Tämä keskustelu on poistettu.");
  }

  return (
    <ChatContainer style={{ flex: 1 }}>
      <ChatHeader
        profile={{
          name:
            chat.chatType === "external" || participantUser?.name === null
              ? chat.currentChatName
              : participantUser?.name,
          avatar:
            chat.chatType == "external"
              ? groupChat
              : avatars.find(
                  (avatar) => avatar.picture === participantUser?.pictureURI
                )?.avatar || defaultAvatar,
          lastSeen:
            chat.chatType == "external"
              ? ""
              : lastSeen
              ? lastSeen
              : "jonkin aikaa sitten",
        }}
        onBack={() => {
          Keyboard.dismiss();
          navigation.navigate("ChatListTab");
        }}
        showSettings={() => {
          Keyboard.dismiss();
          setShowConvoSettings(true);
          setConversation({ type: chat.chatType, id: chat.currentChatID });
        }}
      />
      {isLoadingMessages && messages.length === 0 ? (
        <SpinnerContainer>
          <Spinner />
        </SpinnerContainer>
      ) : (
        <>
          <FlatList
            inverted={true}
            onEndReached={() => {
              fetchPerviousMessages();
            }}
            onEndReachedThreshold={0.3}
            data={messages}
            renderItem={renderItem}
          />
          {imageMsgMutation.isLoading && (
            <ImageLoader>
              <Spinner />
            </ImageLoader>
          )}
        </>
      )}

      <Modal
        presentationStyle="overFullScreen"
        animationType="slide"
        transparent={true}
        visible={showConvoSettings}
      >
        <ConversationSettings
          conversation={conversation}
          onClose={() => setShowConvoSettings(false)}
          onConversationDeleted={onConversationDeleted}
        />
      </Modal>

      <Modal
        presentationStyle="overFullScreen"
        animationType="slide"
        transparent={true}
        visible={showImageInfo.show}
      >
        <LargeImageContent 
          message={showImageInfo.message}
          onClose={()=> setShowLargeImage({show:false})}
        />
      </Modal>
      
      <Modal
        presentationStyle="overFullScreen"
        animationType="slide"
        transparent={true}
        visible={showMessageInformation.show}
      >
        <MessageInformationContainer
          onClose={() => setShowMessage({ show: false })}
          message={showMessageInformation.message}
          chatID={chat.currentChatID}
          seenBy={seenBy}
        />
      </Modal>
      <ChatInput
        isSendingMsg={textMsgMutation.isLoading}
        onSend={postNewMessage}
        notDoneYet={notDoneYet}
      />
    </ChatContainer>
  );
}

const Button = styled.TouchableOpacity`
  margin-left: 10px;
`;

const MessageInformationContainer = ({
  message,
  onClose,
  seenBy,
  chatID,
}: {
  message: MessageItem | undefined;
  onClose: () => void;
  seenBy: SeenBy[];
  chatID: string;
}) => {
  // returns undefined if the message is not type of image
  const image = useImage(message, "large");
  // copy chat message content using
  // clipboard api and close dialog
  const copyMessageContent = async () => {
    await Clipboard.setStringAsync(message?.message || "");
    onClose();
  };

  // remove own (outgoing) chat message
  const removeOwnMessage = async () => {
    // FIXME: Again, anti-pattern. Message state shouldn't
    // be able to change after time limit

    // check if time limit for removing a message
    // has been exceeded
    const sentTime = message?.date.getTime() || 0;
    const current = new Date().getTime();
    if (Math.abs(current - sentTime) > 5 * 60 * 1000) {
      Alert.alert(
        "Virhe.",
        "Voit poistaa viestin vain 5 minuutin sisällä sen lähettämisestä."
      );
      return onClose();
    }

    try {
      await removeMessage(chatID || "", message?.entryID || "");
    } catch (error) {
      // log other errors
      console.error(error);
    } finally {
      Alert.alert("Onnistui!", "Viestisi poistettiin onnistuneesti.");
      // close dialog
      onClose();
    }
  };

  if (!message) {
    return (
      <MessageInformationContainerStyle>
        <Spinner></Spinner>
      </MessageInformationContainerStyle>
    );
  }

  return (
    <MessageInformationContainerStyle>
      <MessageInformation outgoing={message?.outgoing}>
        <InfoContainer
          style={{
            justifyContent: "space-between",
            flexDirection: "row",
            width: "90%",
          }}
        >
          <MessageInfoText black={true}>Viestin tiedot</MessageInfoText>
          {/* Swipe up gesture was too timely to construct from scratch, but if we have time it would be a nice addon */}
          <TouchableOpacity onPress={onClose}>
            <LargeIcon size={45} name="x" />
          </TouchableOpacity>
        </InfoContainer>

        <InfoContainer>
          <MessageInfoText>
            Lähetetty{" "}
            {(message?.date.getDate() || "") +
              "." +
              // because in javascript months start from zero :)))
              ((message?.date.getMonth() || 0) + 1)}{" "}
            {formatTimestamp(message?.date || "")}
          </MessageInfoText>
        </InfoContainer>
        <InfoContainer>
          <MessageInfoText>
            Luettu:{"\n"}
            {seenBy.map((seen: any) => {
              return (
                <MessageInfoText key={seen.userID}>
                  {seen.name} {formatTime(seen.seenAt || "")} {"\n"}
                </MessageInfoText>
              );
            })}
          </MessageInfoText>
        </InfoContainer>
        <Divider />
        {message.type === "text" && (
          <Button onPress={copyMessageContent}>
            <InfoContainer>
              <ChatIcon name="copy" />
              <MessageInfoText>Kopioi viesti</MessageInfoText>
            </InfoContainer>
          </Button>
        )}
        {/* If the message is image show option to download the image to camera roll */}
        {message.type === "image" &&
          // If the image has not been downloaded yet show a spinner instead of the button
          (image !== undefined ? (
            <Button
              onPress={async () => {
                // check if the image has been downloaded succesfully
                if (!image) {
                  Alert.alert(
                    "Odota hetki",
                    "Kuvaa ladataan vielä puhelimellessi, ole hyvä ja odota hetki!"
                  );
                } else {
                  await ImageUtils.saveImageToCameraRoll(
                    message?.entryID,
                    image.content
                  );
                }
              }}
            >
              <InfoContainer>
                <ChatIcon name="copy" />
                <MessageInfoText>Tallenna galleriaan</MessageInfoText>
              </InfoContainer>
            </Button>
          ) : (
            <Spinner />
          ))}
        {message?.outgoing && (
          <Button onPress={removeOwnMessage}>
            <InfoContainer>
              <DeleteIcon />
              <MessageInfoText>Poista</MessageInfoText>
            </InfoContainer>
          </Button>
        )}
      </MessageInformation>
    </MessageInformationContainerStyle>
  );
};

const LargeImageContent = ({
  message,
  onClose,
}: {
  message: MessageItem | undefined;
  onClose: () => void;
}) => {
  const image = useImage(message as MessageItem, "large");
  if (!message) {
    return (
      <LargeImageContainerStyle>
        <Spinner></Spinner>
      </LargeImageContainerStyle>
    );
  }
  return (
    <LargeImageContainerStyle>
      <TouchableOpacity onPress={onClose}>
        <ImageHeader color="black">
          <BackIcon name="chevron-left" onPress={onClose} />
          <TouchableOpacity onPress={onClose}>
            <WhiteText>Takaisin</WhiteText>
          </TouchableOpacity>
        </ImageHeader>
      </TouchableOpacity>
      <View
        style={{ height: "80%", display: "flex", justifyContent: "center" }}
      >
        {!!image && <LargeImage image={image} />}
      </View>
      <View>
        <WhiteText>{message.sender}</WhiteText>
        <WhiteText>{formatTimestamp(message.date)}</WhiteText>
      </View>
    </LargeImageContainerStyle>
  );
};
