import { Avatar } from "@rneui/base";
import { TouchableOpacity, View } from "react-native";
import styled from "styled-components/native";
import { avatars } from "../../icons/icons";
import { InfoText } from "../Common/CommonStyledComponents";

export const ListItemStyle = styled(View)`
  align-items: center;
  flex-direction: row;
  padding-left: ${(props) => props.theme.sizes.padding};
  padding-right: ${(props) => props.theme.sizes.padding};
  margin-left: ${(props) => props.theme.sizes.margin};
  margin-right: ${(props) => props.theme.sizes.margin};
  padding-top: 8px;
  padding-left: 8px;
  justify-content: space-between;
`;

const ChatItemText = styled(InfoText)`
  width: 80%;
  margin-right: auto;
  text-align: left;
`;

const Unread = styled(InfoText)`
  color: ${(props) => props.theme.colors.primary};
  font-weight: bold;
  text-align: right;
`;

export const ChatItem = ({
  chat,
  onClick,
  avatar,
}: {
  chat: ChatItem;
  avatar: string;
  onClick: (chatID: string) => void;
}) => {
  const { chatID, name, hasunread } = chat;
  const picture = avatars.find((pic) => pic.picture === avatar)?.avatar;
  return (
    <TouchableOpacity onPress={() => onClick(chatID)}>
      <ListItemStyle>
        <Avatar size={45} source={picture ? picture : avatar} />
        <ChatItemText>{name}</ChatItemText>
        {hasunread && <Unread>⬤</Unread>}
      </ListItemStyle>
    </TouchableOpacity>
  );
};
