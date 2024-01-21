import { Avatar } from "@rneui/base";
import {
  Animated,
  GestureResponderEvent,
  ImageSourcePropType,
  Platform,
  Text,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import styled from "styled-components/native";
import { ChatIcon } from "./ChatMessageItem";

export const ChatContainer = styled.View`
  background: ${(props) => props.theme.colors.secondary};
  ${Platform.OS === "ios" ? "margin-top: 35px;" : ""}
  width: 100%;
`;

const NameContainer = styled.View`
  flex-direction: column;
  padding-right: 8px;
  padding-left: 8px;
`;

const NameText = styled.Text`
  font-size: ${(props) => props.theme.sizes.small};
  font-weight: 500;
  color: ${(props) => props.theme.colors.grey};
`;

const LastSeenText = styled.Text`
  font-size: 12px;
  color: ${(props) => props.theme.colors.primary};
`;

export const BackIcon = styled(Icon)<{
  color?: string;
}>`
  padding-left: 15px;
  padding-right: 20px;
  font-size: ${(props) => props.theme.sizes.large};
  color: ${(props) => props.color || props.theme.colors.grey};
`;

const SettingsIcon = styled(Icon)`
  padding: 0 20px;
  margin-left: auto;
  font-size: ${(props) => props.theme.sizes.medium};
  color: ${(props) => props.theme.colors.grey};
`;

export const ChatHeader = ({
  profile,
  onBack,
  showSettings,
}: {
  profile: Profile;
  onBack: () => void;
  showSettings: () => void;
}) => {
  const { avatarUri, avatar, name, lastSeen } = profile;
  return (
    <AnimatedHeader>
      <BackIcon name="chevron-left" onPress={onBack} />
      <Avatar
        size={43}
        source={
          avatar
            ? (avatar as ImageSourcePropType)
            : {
                uri: avatarUri as string,
              }
        }
      />
      <NameContainer>
        <NameText>{name}</NameText>
        {lastSeen && <LastSeenText>Viimeksi paikalla {lastSeen}</LastSeenText>}
      </NameContainer>
      <SettingsIcon name="gear" onPress={showSettings} />
    </AnimatedHeader>
  );
};

export const AnimatedHeader = styled(Animated.View)<{
  color?: string;
  left?: number;
  right?: number;
}>`
  align-items: center;
  left: ${(props) => props.left || 0};
  right: ${(props) => props.right || 0};
  padding-top: 10px;
  padding-bottom: 7px;
  background-color: ${(props) => props.color || props.theme.colors.white};
  flex-direction: row;
`;

export const MessageInformationContainerStyle = styled(View)`
  background-color: ${(props) => props.theme.colors.lightGreyTransparency};
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-end;
`;

export type ColorStyle = {
  color: string;
};

export const LargeImageContainerStyle = styled(View)<Partial<ColorStyle>>`
  padding-top: 15px;
  background-color: ${(props) => (props.color ? props.color : "black")};
  width: 100%;
  height: 100%;
  display: flex;
`;

export const ImageHeader = styled(Animated.View)<{
  color?: string;
  left?: number;
  right?: number;
}>`
  align-items: center;
  left: ${(props) => props.left || 0};
  right: ${(props) => props.right || 0};
  padding-top: 19px;
  padding-bottom: 7px;
  margin: 5px;
  background-color: ${(props) => props.color || props.theme.colors.white};
  flex-direction: row;
`;

export const MessageInformation = styled(View)<{
  outgoing: boolean | undefined;
}>`
  background-color: ${(props) => props.theme.colors.white};
  padding-bottom: 18px;
  width: 100%;
`;

// todo red has to be according to the theme
export const DeleteIconStyle = styled(ChatIcon)`
  color: ${(props) => props.theme.colors.red};
  margin-right: 2px;
`;

export const DeleteIcon = ({
  onPress,
}: {
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
}) => {
  return <DeleteIconStyle name="trash" onPress={onPress} />;
};

type InfoTextProps = {
  black?: boolean;
};

export const MessageInfoText = styled(Text)<InfoTextProps>`
  font-size: ${(props) => props.theme.sizes.smaller};
  color: ${(props) =>
    props.black ? props.theme.colors.black : props.theme.colors.darkGrey};
  margin: auto;
  margin-right: 4px;
  margin-left: 4px;
  padding-left: 2px;
  padding-right: 2px;
  width: 100%;
`;

export const InfoContainer = styled(View)`
  margin: 4px;
  padding-right: 9px;
  margin-left: 3px;
  padding-left: 3px;
  width: 100%;
  flex-direction: row;
`;
