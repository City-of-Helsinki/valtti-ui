import { View } from "react-native";
import styled from "styled-components/native";
import { MessageItem } from "../../queries";
import { formatDateIndicator } from "../../utils";

import { Avatar } from "../Common/CommonStyledComponents";
import { ChatMessageItem } from "./ChatMessageItem";

type ChatMessageProps = {
  sender?: string;
  avatarUri?: string;
  avatar?: number;
  messages: MessageItem[];
  onLongPress: (message: MessageItem) => void;
  onPress?: (message: MessageItem) => void;
  dayHasChanged?: boolean;
  outgoing: boolean;
};

const DateInfo = styled(View)<DateInfoProps>`
  position: absolute;
  bottom: 0;
  width: 100%;
  ${(props) => (props.outgoing ? "" : `left: -${props.offset / 2}px`)}
`;

const DateInfoTextContainer = styled.View`
  padding: 0 30px;
  margin: 10px auto;
  border-radius: 50px;
  background: ${(props) => props.theme.colors.lightGreyTransparency};
  height: 30px;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const DateInfoText = styled.Text`
  color: ${(props) => props.theme.colors.grey};
`;

export interface DateInfoProps {
  offset: number;
  outgoing: boolean;
}

const ListItemStyle = styled(View)`
  align-items: center;
  flex-direction: row;
  padding-left: 3px;
  padding-right: 3px;
  margin-left: 5px;
  margin-right: 5px;
  padding-top: 8px;
`;

export interface HasPadding {
  hasPadding?: boolean;
  outgoing: boolean;
}
const ChatDateContainer = styled(View)<HasPadding>`
  flex: 1;
  width: 100%;
  align-items: ${(props) => (props.outgoing ? "flex-end" : "flex-start")};
  position: relative;
  padding-bottom: ${(props) => (props.hasPadding ? "48px" : "0px")};
`;

interface Outgoing {
  outgoing?: boolean;
}
export const MessageContainer = styled.View<Outgoing>`
  margin: 4px;
  flex-direction: row;
  align-items: ${(props) => (props.outgoing ? "flex-end" : "flex-start")};
`;

export const ItemContainer = styled(View)<Outgoing>`
  flex: 1;
  align-items: ${(props) => (props.outgoing ? "flex-end" : "flex-start")};
`;

// combined component for both incoming and outgoing chat msgs
const ChatMessage = (
  {
    sender,
    avatarUri,
    avatar,
    messages,
    outgoing,
    onLongPress,
    onPress
  }: ChatMessageProps) => {
  const avatarSize = 40;

  return (
    <ListItemStyle>
      <MessageContainer outgoing={outgoing}>
        {!outgoing && (
          <Avatar
            source={
              avatarUri ? { uri: avatarUri as string } : (avatar as number)
            }
            size={avatarSize}
          />
        )}
        <ItemContainer outgoing={outgoing}>
          {messages.map((messageItem, index) => {
            return (
              <ChatDateContainer
                hasPadding={messageItem.dayHasChanged}
                outgoing={outgoing}
                key={messageItem.entryID}
              >
                <ChatMessageItem
                  messageItem={messageItem}
                  index={index}
                  messagesLength={messages.length}
                  onLongPress={onLongPress}
                  onPress={onPress}
                  outgoing={outgoing}
                  sender={sender}
                />
                {messageItem.dayHasChanged && (
                  <DateInfo offset={avatarSize} outgoing={outgoing}>
                    <DateInfoTextContainer>
                      <DateInfoText>
                        {formatDateIndicator(messageItem.date)}
                      </DateInfoText>
                    </DateInfoTextContainer>
                  </DateInfo>
                )}
              </ChatDateContainer>
            );
          })}
        </ItemContainer>
      </MessageContainer>
    </ListItemStyle>
  );
};

export default ChatMessage;
