import { StackScreenProps } from "@react-navigation/stack";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useDispatch } from "react-redux";
import { Register } from "../../components/PhoneLogin/Register";
import { useNavigation } from "../../navigation";
import { LoginStackParamList } from "../../navigation/types";
import { singup } from "../../queries";
import { setPhoneNumberState } from "../../redux/slices/userSlice";

export default function PhoneNumber(
  navigator: StackScreenProps<LoginStackParamList, "RegisterTab">
) {
  // https://tanstack.com/query/v4/docs/quick-start
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const dispatch = useDispatch();
  useEffect(() => {
    navigator.navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
    });
  }, [navigator]);
  const [isLoading, setLoading] = useState(false);
  const { mutate, status } = useMutation({
    mutationFn: singup,
    onSuccess: (data) => {
      if (data) {
        navigation.navigate("ConfirmationNumber");
        setPhoneNumber("");
      } else {
        Alert.alert(
          "Voi rähmä!",
          "Taisit laittaa väärän numeron. Tarkista ja yritä uudelleen.",
          [{ text: "OK", onPress: () => console.log("OK Pressed") }]
        );
      }
    },
    onError: (error) => {
      console.log(error);
      Alert.alert(
        "Voi rähmä!",
        "Taisit laittaa väärän numeron. Tarkista ja yritä uudelleen.",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
    },
  });
  const navigation = useNavigation();

  const changePhoneNumber = (text: string) => {
    // user = store.getState().user;
    // dispatch(setPhoneNumberState(text));
    setPhoneNumber(text);
  };

  const HandleOnPress = async () => {
    if (phoneNumber.length > 5) {
      setLoading(true);
      const noSpace = phoneNumber.replace(/\s/g, "");
      if (noSpace.startsWith("0")) {
        const number = noSpace.replace("0", "+358");
        mutate(number);
        dispatch(setPhoneNumberState(number));
      } else if (noSpace.startsWith("+358")) {
        mutate(noSpace);
        dispatch(setPhoneNumberState(noSpace));
      } else {
        Alert.alert("Puhelin numero ei ole oikeassa muodossa");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // react querys status changes happened too slow, so we decided to make our own.
    if (status !== "loading" && isLoading) {
      setLoading(false);
    }
  }, [status]);

  const HandleNavigation = async () => {    
    navigation.navigate("LoginStack", {
      screen: "MultiUsePhone",
    });
};

  return (
    <Register
      phoneNumber={phoneNumber}
      setPhoneNumber={changePhoneNumber}
      onLogin={HandleOnPress}
      // react-query isLoading was slow, so we decided to crate our own.
      isLoading={isLoading}
      navigation={HandleNavigation}
    />
  );
}
