import { Animated, Platform } from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import styled from "styled-components/native";
import { TitleContainer } from "../Common/CommonStyledComponents";
import { TitleText } from "../Common/Title";

export const ChatListContainer = styled.View`
  background: ${(props) => props.theme.colors.secondary};
  ${Platform.OS === "ios" ? 'margin-top: 35px;' : ''}
  width: 100%;
  height: 100%;
  ${Platform.OS === "ios" ? 'padding-bottom: 35px;' : ''}
`;

const ChatListTitle = styled(TitleContainer)`
  flex-direction: row;
  padding-right: 20px;
  padding-left: 20px;
  text-align: "center";
  width: 100%;
  padding-bottom: 0px;
  margin-bottom: 0px;
`;

const ProfileIcon = styled(Icon)`
  padding-left: 6px;
  padding-right: 10px;
  font-size: ${(props) => props.theme.sizes.large};
  color: ${(props) => props.theme.colors.grey};
  right: 10px;
  position: absolute;
`;

const AddChatIcon = styled(Icon)`
  padding-left: 6px;
  padding-right: 10px;
  font-size: ${(props) => props.theme.sizes.large};
  color: ${(props) => props.theme.colors.grey};
  right: 40px;
  position: absolute;
`;

export const ChatListHeader = ({
  toProfile,
  toAddChat,
  roleType,
}: {
  toProfile: () => void;
  toAddChat: () => void;
  roleType: string;
}) => {
  return (
    <AnimatedHeader>
      <ChatListTitle>
        <TitleText>Keskustelut</TitleText>
        {(roleType === "admin" || roleType === "caregiver") && (
          <AddChatIcon name="pencil" onPress={toAddChat} />
        )}
        <ProfileIcon name="person-fill" onPress={toProfile} />
      </ChatListTitle>
    </AnimatedHeader>
  );
};

export const AnimatedHeader = styled(Animated.View)`
  align-items: center;
  left: 0;
  right: 0;
  padding-top: 10px;
  padding-bottom: 7px;
  background-color: ${(props) => props.theme.colors.white};
  textalign: "center";
`;
