import { AnyAction } from "@reduxjs/toolkit";
import { useMutation } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { Alert } from "react-native";
import { useDispatch } from "react-redux";
import { client } from "../../api";
import { ConfiramtionCode } from "../../components/PhoneLogin/ConfirmantionCode";
import { useNavigation } from "../../navigation";
import { verify } from "../../queries";
import {
  fetchUserById,
  setPINLogin,
  setUserJwt,
  updateUserData,
} from "../../redux/slices/userSlice";
import { parseJwt } from "../../utils";

export default function ConfirmationCode() {
  // https://tanstack.com/query/v4/docs/quick-start
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [confirmationCode, setconfirmationCode] = useState<string>("");
  const { mutate, isLoading, status } = useMutation({
    mutationFn: verify,
    onSuccess: (data) => {
      if (data) {
        dispatch(setPINLogin(data.pinCred));
        dispatch(setUserJwt(data.jwt.jwt));
        client.setJwtCredentials(data.jwt);
        try {
          const content = parseJwt<JwtPayload>(data.jwt.jwt);
          const Pinlogin = JSON.stringify(data.pinCred);
          SecureStore.setItemAsync("pinLogin", Pinlogin);
          SecureStore.setItemAsync("roleType", "relative");
          navigation.navigate("ChatStack", {
            screen: "ChatListTab",
            params: { fetchChats: true },
          });
          dispatch(
            updateUserData({
              id: content.senderID,
              jwt: data.jwt.jwt,
              pinLogin: data.pinCred,
              roleType: "relative",
            })
          );
          dispatch(
            fetchUserById({
              userID: content.senderID,
              roleType: "relative",
            }) as unknown as AnyAction
          );
        } catch (err) {
          console.log(err);
        }
      } else {
        Alert.alert(
          "Voi rähmä!",
          "Taisit laittaa väärän numeron. Tarkista ja yritä uudelleen.",
          [{ text: "OK", onPress: () => console.log("OK Pressed") }]
        );
      }
    },
    onError: (error) => {
      Alert.alert(
        "Voi rähmä!",
        "Taisit laittaa väärän numeron. Tarkista ja yritä uudelleen.",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
    },
  });

  const changeconfirmationCode = (text: string) => {
    const len = text.length;
    if (len == 4 && confirmationCode.length == 3) {
      text = text + "-";
    }
    if (len > 9) {
      text = text.slice(0, 9);
    }
    const noSpace = text.replace(/\s+/g, "");
    setconfirmationCode(noSpace);
  };

  const goBack = () => {
    navigation.navigate("RegisterTab");
  };

  const HandleOnPress = async () => {
    try {
      if (!isLoading && status !== "success") {
        mutate(confirmationCode);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <ConfiramtionCode
      confirmationCode={confirmationCode}
      setconfirmationCode={changeconfirmationCode}
      onLogin={HandleOnPress}
      isLoading={isLoading}
      goBack={goBack}
    />
  );
}
