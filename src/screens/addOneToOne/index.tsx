import { useState } from "react";
import { Alert } from "react-native";
import { AddOneToOneChat } from "../../components/AddChat/AddOneToOne";
import { useNavigation } from "../../navigation";
import { useSendInvitation } from "../../queries";

export default function AddOneToOne() {
  const mutation = useSendInvitation();
  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const navigation = useNavigation();

  const HandlePhoneNumber = (text: string) => {
    setPhoneNumber(text);
  };

  const HandleName = (text: string) => {
    setName(text);
  };

  const HandleOnPress = () => {
    if (!mutation.isIdle || mutation.isLoading) {
      Alert.alert(
        "Odota, että edellinen lisäys on käsitelty loppuun ennen seuraavan aloittamista."
      );
    }
    if (name.length < 2) {
      Alert.alert("Nimi on liian lyhyt");
      return;
    }
    if (phoneNumber.length < 5) {
      Alert.alert("Puhelinnumero on liian lyhyt");
      return;
    }
    breakme: if (phoneNumber.length > 5 && name.length > 2) {
      let noSpace = phoneNumber.replace(/\s/g, "");
      if (noSpace.startsWith("0")) {
        noSpace = noSpace.replace("0", "+358");
      } else if (noSpace.startsWith("+358")) {
        /* empty */
      } else {
        Alert.alert("Puhelin numero ei ole oikeassa muodossa");
        break breakme;
      }
      try {
        mutation.mutate(
          {
            name: name,
            phoneNumber: noSpace,
          },
          {
            onSuccess: async (data: InvitationResponse) => {
              if (data.data.chat) {
                Alert.alert("Sinulla on jo keskustelu tämän henkilön kanssa");
              }
              navigation.navigate("ChatListTab", { fetchChats: true });
              return;
            },
            onError: (error) => {
              Alert.alert("Jokin meni vikaan");
              console.log("error: " + error);
              navigation.navigate("ChatListTab", { fetchChats: true });
            },
          }
        );
      } catch (error) {
        console.log("error: " + error);
      }
    }
  };

  const HandleBack = () => {
    navigation.navigate("AddChatTab", { fetchChats: true });
  };

  return (
    <AddOneToOneChat
      name={name}
      setName={HandleName}
      phoneNumber={phoneNumber}
      setPhoneNumber={HandlePhoneNumber}
      onAdd={HandleOnPress}
      onBack={HandleBack}
      isLoading={!mutation.isIdle || mutation.isLoading}
    />
  );
}
