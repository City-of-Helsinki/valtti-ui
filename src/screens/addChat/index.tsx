import { AddChat } from "../../components/AddChat/AddChat";
import { useNavigation } from "../../navigation";

export default function AddChatScreen() {
  const navigation = useNavigation();

  const HandleOnetoOne = () => {
    navigation.navigate("AddOneToOneChat");
  };

  const HandleGroupChat = () => {
    navigation.navigate("AddGroup");
  };

  const onBack = () => {
    navigation.navigate("ChatListTab");
  };

  return (
    <AddChat
      HandleOnetoOne={HandleOnetoOne}
      HandleGroupChat={HandleGroupChat}
      onBack={onBack}
    />
  );
}
