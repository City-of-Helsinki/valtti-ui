import {
  Dimensions,
  GestureResponderEvent,
  TouchableOpacity,
  View
} from "react-native";
import styled from "styled-components/native";
import { TrashButton } from "../Chat/ChatMessageItem";
import { Container, InfoText } from "../Common/CommonStyledComponents";

const ListItemStyle = styled(View)``;

const UserItemText = styled(InfoText)`
  padding: 0px;
  font-weight: bold;
  margin: 5px;
  font-size: ${(props) => props.theme.sizes.smaller};
  color: ${(props) => props.theme.colors.secondary};
`;

const UserItemTextSmall = styled(UserItemText)`
  width: 100%;
  font-weight: normal;
  font-size: ${(props) => props.theme.sizes.smallest};
`;

export const UserItem = ({
  user,
  onClick,
}: {
  user: SavedPinLogin;
  onClick: (user: SavedPinLogin) => void;
}) => {
  const { email, name } = user;
  return (
    <TouchableOpacity onPress={() => onClick(user)}>
      <ListItemStyle>
        <UserItemText>{name}</UserItemText>
        <UserItemTextSmall>{email}</UserItemTextSmall>
      </ListItemStyle>
    </TouchableOpacity>
  );
};

export const UserItemContainerWrapper = styled.View`  
  flex-direction: row;
  justify-content: space-between;
  padding-horizontal: ${(props) => props.theme.sizes.padding};
  padding-top: ${(props) => props.theme.sizes.padding};
  padding-bottom: ${(props) => props.theme.sizes.padding};
  padding-horizontal: ${(props) => props.theme.sizes.padding};
  width: ${
  Dimensions.get("window").width *
    0.8 /** 95% of the width, width procent bugging out on this one */
}px;
  border-radius: ${({ theme }) => theme.sizes.borderRadius}
  background-color: ${({ theme }) => theme.colors.primary}
`;
// width: ${
//   Dimensions.get("window").width *
//     0.95 /** 95% of the width, width procent bugging out on this one */
// };

export const UserInformationText = styled(InfoText)`
  font-size: ${(props) => props.theme.sizes.smaller};
  font-weight: bold;
`;

export const UserContainer = styled(Container)`
  margin-top: 4px;
  margin-bottom: 4px;
  height: auto;
`;

export const UserItemContainerRoot = styled(Container)`
  margin-top: 4px;
  margin-bottom: 4px;
  height: auto;
`;

export const UserItemContainer = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => (
  <UserItemContainerRoot>
    <UserItemContainerWrapper>{children}</UserItemContainerWrapper>
  </UserItemContainerRoot>
);

export const UserTrashButton = styled(TrashButton)`
  margin-top: auto;
  margin-bottom: auto;
  padding-top: 8px;
  padding-bottom: 8px;
  color: ${(p) => p.theme.colors.red};
`;

export const UserDelete = ({
  onPress,
}: {
  onPress: (event: GestureResponderEvent) => void;
}) => {
  return <UserTrashButton onPress={onPress} />;
};
