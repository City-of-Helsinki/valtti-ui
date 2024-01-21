import { useIsFocused } from "@react-navigation/core";
import { AnyAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useDispatch } from "react-redux";
import { client } from "../../api";
import { MultiPhone } from "../../components/MultiUsePhone/MultiUsePhone";
import {
  UserDelete,
  UserItem,
  UserItemContainer
} from "../../components/MultiUsePhone/Useritem";
import { useNavigation } from "../../navigation";
import { useEmailLogin } from "../../queries";
import {
  fetchUserById,
  updateProfileData,
  updateUserData
} from "../../redux/slices/userSlice";
import { parseJwt } from "../../utils";

export default function MultiUsePhone() {
  // https://tanstack.com/query/v4/docs/quick-start
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const { isLoading, mutate } = useEmailLogin();
  const [users, setUsers] = useState<SavedPinLogin[]>([]);
  const [getNewPin, setGetNewPin] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<SavedPinLogin | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showPin, setShowPin] = useState<boolean>(false);
  const isFocused = useIsFocused();
  const firstTimeRef = useRef(true);
  const mutationUsed = useRef(false);
  
  const changeEmail = (text: string) => {
    const noSpace = text.replace(/\s+/g, "");
    setEmail(noSpace);
  };

  const changePassword = (text: string) => {
    const noSpace = text.replace(/\s+/g, "");
    setPassword(noSpace);
  };

  const changePin = (text: string) => {
    const noSpace = text.replace(/\s+/g, "");
    if (noSpace.length <= 4) {
      setPin(noSpace);
    }
  };

  const mountData = async () => {
    const idList = await SecureStore.getItemAsync("savedIDs");
    if (!idList) return;
    const ids = JSON.parse(idList.toString());
    const maybeUsers: SavedPinLogin[] = [];
    if (ids && ids.length > 0) {
      setSavedIds(ids);
      for (const id of ids) {
        const user = await SecureStore.getItemAsync(id);

        if (user) {
          maybeUsers.push(JSON.parse(user));
        }
      }
    }
    setUsers(maybeUsers);
  };

  const clearPinState = () => {
    setShowPin(false);
    setGetNewPin(false);
    setPin("");
  };

  useEffect(() => {
    if (isFocused) {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
      } else {
        clearPinState();
      }

      mountData();
    }
  }, [isFocused]);

  useEffect(() => {
    mountData();
  }, []);

  const onBack = () => {
    if (getNewPin || showPin) {
      clearPinState();
    } else {
      navigation.navigate("RegisterTab");
    }
  };

  const sendAlert = () => {
    Alert.alert(
      "Voi rähmä!",
      "Voi harmi! Taisit syöttää tunnuksesi tai salasanan väärin. Tarkista ja yritä uudelleen.",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
  };

  const getPin = async (user: SavedPinLogin) => {
    setSelectedUser(user);
    setGetNewPin(true);
  };

  const OnClickSavedUser = async (pin: string) => {
    const user = selectedUser;
    // if there is no selected user there is a bug in the code
    if (!user) throw new Error("selectedUser has not been defined");
    try {
      const Pin = {
        PIN: pin,
        userToken: user.userToken,
        // cookie: user.cookie,
      };

      const Pinlogin = JSON.stringify(Pin);
      const jwtCredentials = await client.pinLogin(Pin);
      client.setJwtCredentials(jwtCredentials);
      try {
        const content = parseJwt<JwtPayload>(jwtCredentials.jwt);
        SecureStore.setItemAsync("pinLogin", Pinlogin);
        SecureStore.setItemAsync("roleType", "caregiver");
        dispatch(
          updateUserData({
            id: content.senderID,
            jwt: jwtCredentials.jwt,
            pinLogin: Pin,
            roleType: "caregiver",
          })
        );
        dispatch(
          fetchUserById({
            userID: content.senderID,
            roleType: "caregiver",
            // the type is actually correct but for somereason this won't work
          }) as unknown as AnyAction
        );
        // set state to the inital position so that the next user to login will see the login screen.
        clearPinState();

        navigation.navigate("ChatStack", {
          screen: "ChatListTab",
          params: { fetchChats: true },
        });
      } catch (exception) {
        console.log(exception);
        setShowPin(false);
        sendAlert();
      }
    } catch (exception) {
      console.log(exception);
      sendAlert();
      setShowPin(false);
    }
  };

  const HandleLogin = async () => {
    // we dont want to spam the server

    // we can't use status because this components state persists. Aka it will never be unmounted until closing the application.
    // which means that the react query useMutation state will stay the same as long as the application is not closed.
    // Switching the screen does not trigger remount if the screen has been mounted in the life span of the application usage.
    if (isLoading || mutationUsed.current) return;
    if (pin.length !== 4) {
      Alert.alert("Pin on liian lyhyt");
      return;
    }
    mutationUsed.current = true;
    try {
      await SecureStore.setItemAsync("multiUsePhone", "true");
      mutate(
        {
          email: email,
          password: password,
          pin: pin,
        },
        {
          onSuccess: async (data) => {
            if (!data) {
              sendAlert();
              return;
            }
            // TODO set user role type to state
            client.setJwtCredentials(data.jwt);
            try {
              // try to parse the jwt token, if this throws a error it means that the jwt is incorrectly formed
              const content = parseJwt<JwtPayload>(data.jwt.jwt);
              const userProfile = await client.fetchUser(content.senderID, "");
              // Save the pin to secure store
              const Pin: SavedPinLogin = {
                email: email,
                PIN: "",
                userToken: data.pinCred.userToken,
                // cookie: data.pinCred.cookie,
                name: userProfile.name,
                ID: content.senderID,
                // TODO fetch profile info and set name
              };

              const savedPin = JSON.stringify(Pin);
              const Pinlogin = JSON.stringify(data.pinCred);
              if (!savedIds.includes(content.senderID)) {
                setSavedIds((savedIds: string[]) => [
                  ...savedIds,
                  content.senderID,
                ]);
                SecureStore.setItemAsync(
                  "savedIDs",
                  JSON.stringify([...savedIds, content.senderID])
                );
              }

              SecureStore.setItemAsync(content.senderID, savedPin);
              SecureStore.setItemAsync("pinLogin", Pinlogin);
              SecureStore.setItemAsync("roleType", "caregiver");
              navigation.navigate("ChatStack", {
                screen: "ChatListTab",
                params: { fetchChats: true },
              });
              // navigation.navigate("ChatListTab", { fetchChats: true });
              dispatch(
                updateUserData({
                  id: content.senderID,
                  jwt: data.jwt.jwt,
                  pinLogin: data.pinCred,
                  roleType: "caregiver",
                })
              );
              dispatch(
                updateProfileData({
                  name: userProfile.name,
                  descriptionURI: userProfile.descriptionURI,
                  pictureURI: userProfile.pictureURI,
                })
              );
              dispatch(
                fetchUserById({
                  userID: content.senderID,
                  roleType: "caregiver",
                  // the type is actually correct but for somereason this won't work
                }) as unknown as AnyAction
              );
              setEmail("");
              setPassword("");
            } catch (exception) {
              sendAlert();
            } finally {
              mutationUsed.current = false;
            }
          },
          onError: async () => {
            sendAlert();
            mutationUsed.current = false;
            // TODO: this should be done automatically
          },
        }
      );
    } catch (error) {
      sendAlert();
    }
  };

  const OnDeleteSavedUser = async (user: SavedPinLogin) => {
    const newIds = savedIds.filter((id) => id !== user.ID);
    await SecureStore.deleteItemAsync(user.ID);
    await SecureStore.setItemAsync("savedIDs", JSON.stringify(newIds));
    // FIXME: we have to get permissions to remove notifications. so we have to use some jwt for that but which jwt? 
    // await removeNotification(user.ID);
    users.filter((u) => user.ID !== u.ID).map((u) => console.log(u.email));
    setUsers(users.filter((u) => user.ID !== u.ID));
    return null;
  };

  const renderItem = ({ item }: { item: SavedPinLogin }) => {
    return (
      <UserItemContainer>
        <UserItem key={item.userToken} user={item} onClick={getPin} />
        <UserDelete
          onPress={() => {
            Alert.alert(
              "Deaktivoi käyttäjä",
              "Oletko varma, että haluat deaktivoida käyttäjän tästä puhelimesta.",
              [
                { text: "Kyllä", onPress: () => OnDeleteSavedUser(item) },
                { text: "Ei", onPress: () => null },
              ]
            );
          }}
        />
      </UserItemContainer>
    );
  };

  return (
    <MultiPhone
      email={email}
      password={password}
      setEmail={changeEmail}
      setPassword={changePassword}
      onLogin={HandleLogin}
      onBack={onBack}
      isLoading={isLoading}
      pin={pin}
      setPin={changePin}
      users={users}
      renderItem={renderItem}
      getPin={getNewPin}
      OnClickSavedUser={OnClickSavedUser}
      setShowPin={setShowPin}
      showPin={showPin}
    />
  );
}
