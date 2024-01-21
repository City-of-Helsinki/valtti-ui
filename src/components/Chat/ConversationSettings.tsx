import { Alert } from "react-native";
import Icon from "react-native-vector-icons/Octicons";
import styled from "styled-components/native";

import { removeConversation } from "../../api";
import { useUser } from "../../redux/hooks";

const StyledView = styled.SafeAreaView`
  background: ${(props) => props.theme.colors.white};
  height: 100%;
  display: flex;
`;

const Header = styled.View`
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 30px;
`;

const CloseButton = styled.TouchableOpacity`
  padding: 0 30px;
  margin-left: auto;
`;

const CloseIcon = styled(Icon)`
  font-size: ${(props) => props.theme.sizes.large};
  color: ${(props) => props.theme.colors.grey};
`;

const DeleteButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin: 30px;
`;

const DeleteText = styled.Text`
  color: ${(props) => props.theme.colors.red};
  margin-left: 10px;
  color: ${(props) => props.theme.colors.red};
`;

const DeleteIcon = styled(Icon)`
  font-size: ${(props) => props.theme.sizes.large};
  color: ${(props) => props.theme.colors.red};
`;

const Title = styled.Text`
  font-size: ${(props) => props.theme.sizes.small};
`;

const Subtitle = styled.Text`
  margin: 15px 0 0 30px;
`;

// Types
export interface Conversation {
  type: "one-to-one" | "external" | string;
  id: string;
}

type ComponentProps = {
  conversation: Conversation;
  onClose: () => void;
  onConversationDeleted: () => void;
};

const ConversationSettings = (props: ComponentProps) => {
  const { conversation, onClose, onConversationDeleted } = props;
  const user = useUser();

  // Remove conversation from API
  const onPress = async () => {
    try {
      await removeConversation(conversation.id);

      // Trigger conversations refetch
      onConversationDeleted();
    } catch (error: any) {
      // if error is due insufficient permissions
      // (in most cases this is intentional)
      if (error.name === "NotAuthorizedError")
        return Alert.alert(
          "Virhe!",
          "Vain keskustelun luoja voi poistaa keskustelun."
        );

      // log other errors
      console.error(error);
    }
  };

  // Prompt user about removing a conversation
  const promptConversationRemoval = () =>
    Alert.alert(
      "Vahvista keskustelun poisto",
      "Haluatko poistaa keskustelun pysyvästi? Tätä toimintoa ei voi perua.",
      [
        {
          text: "Peruuta",
          style: "cancel",
        },
        {
          text: "Poista",
          onPress,
          style: "destructive",
        },
      ]
    );

  return (
    <StyledView>
      <Header>
        <Title>Keskustelun asetukset</Title>
        <CloseButton onPress={onClose}>
          <CloseIcon name="x" />
        </CloseButton>
      </Header>
      {user.roleType === "caregiver" && (
        <>
          <Subtitle>Ammattilaisen työkalut</Subtitle>
          <DeleteButton onPress={promptConversationRemoval}>
            <DeleteIcon name="trash" />
            <DeleteText>Poista keskustelu</DeleteText>
          </DeleteButton>
        </>
      )}
    </StyledView>
  );
};
export default ConversationSettings;
