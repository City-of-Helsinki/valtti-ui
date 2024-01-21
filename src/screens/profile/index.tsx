import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { OwnProfile } from "../../components/Profile/OwnProfile";
import { useNavigation } from "../../navigation";
import { updateProfileDescription } from "../../queries";
import { setCurrentTheme } from "../../redux/slices/themeSlice";
import { fetchUserById, setToInitialState } from "../../redux/slices/userSlice";
import { store } from "../../redux/store";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore because estlint is weird
import { AnyAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { Alert, Keyboard } from "react-native";
import { DefaultTheme } from "styled-components/native";
import { avatars } from "../../icons/icons";
import { useRemoveNotification } from "../../queries";

export default function Profile() {
  const [description, setDescription] = useState<string>("");
  const [name, setName] = useState<string>("Nimi");
  const [, setRoleType] = useState<string>("relative");
  const mutation = updateProfileDescription();
  // const [modalVisible, setModalVisible] = useState<boolean>(false);
  const logoutMutation = useRemoveNotification();
  const navigation = useNavigation();
  let user = store.getState().user;
  const [avatarUri, setAvatarUri] = useState<number | undefined>();
  const [, setAvatarIndex] = useState(0);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  useEffect(() => {
    user = store.getState().user;
    if (user.profile.descriptionURI)
      setDescription(user.profile.descriptionURI);
    if (user.profile.name) setName(user.profile.name);
    if (
      user.profile.pictureURI !== "DefaultUriHere" &&
      user.profile.pictureURI
    ) {
      const avatar = avatars.find(
        (avatar) => avatar.picture === user.profile.pictureURI
      );
      if (avatar) setAvatarUri(avatar.avatar);
      if (avatar) setAvatarIndex(avatar.picture_index);
    }
    if (user.user.roleType) setRoleType(user.user.roleType);
  }, [isFocused]);

  const phoneNumber = user.user.phoneNumber;

  const onBack = () => {
    navigation.navigate("ChatListTab");
  };

  const saveProfile = () => {
    try {
      mutation.mutate(
        { description: description },
        {
          onSuccess: () => {
            Alert.alert("Profiiili päivitetty");
            dispatch(
              fetchUserById({
                userID: user.user.id,
                roleType: user.user.roleType,
                // the type is actually correct but for somereason this won't work
              }) as unknown as AnyAction
            );
          },
        }
      );
    } catch (error) {
      Alert.alert("Virhe profiilin päivittämisessä");
      console.log("error: " + error);
    } finally {
      Keyboard.dismiss();
    }
  };

  const HandleLogout = async () => {
    // navigation.navigate("");
    const userID = user.user.id;
    const multiUsePhone = await SecureStore.getItemAsync("multiUsePhone");
    //SecureStore returns a string
    if (multiUsePhone !== "true") {
      await logoutMutation.mutate(userID);
      navigation.navigate("LoginStack", { screen: "RegisterTab" });
    } else {
      navigation.navigate("LoginStack", { screen: "MultiUsePhone" });
    }
    await dispatch(setToInitialState());
    await SecureStore.deleteItemAsync("pinLogin");
    await SecureStore.deleteItemAsync("roleType");
  };

  const HandleChangeTheme = (theme: DefaultTheme) => {
    SecureStore.setItemAsync("theme", JSON.stringify(theme));
    dispatch(setCurrentTheme(theme));
  };

  const avatarOnPress = () => {
    navigation.navigate("AvatarChanger");
  };

  return (
    <OwnProfile
      name={name}
      phoneNumber={phoneNumber}
      description={description}
      setDescription={setDescription}
      onBack={onBack}
      avatar={avatarUri ? avatarUri : avatars[0].avatar}
      saveProfile={saveProfile}
      HandleLogout={HandleLogout}
      setTheme={HandleChangeTheme}
      avatarOnPress={avatarOnPress}
    />
  );
}
