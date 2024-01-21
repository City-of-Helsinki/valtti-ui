// @ts-nocheck TODO: figure out why this is throwing a error
import { useIsFocused } from "@react-navigation/core";
import { AnyAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DefaultTheme } from "styled-components/native";
import { client } from "../../api";
import { Introduction } from "../../components/LoadingScreen/Introduction";
import { useNavigation } from "../../navigation";
import { setCurrentTheme } from "../../redux/slices/themeSlice";
import { fetchUserById, updateUserData } from "../../redux/slices/userSlice";
import { RoleType } from "../../redux/types";
import { parseJwt } from "../../utils";

type IPinCredentials = any; // from internal lib

export default function LoadingScreen() {
  // https://tanstack.com/query/v4/docs/quick-start
  const [showButton, setShowButton] = useState<boolean>(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  //TODO: add this to queries.ts
  const PinLoginSecureStore = async () => {
    try {
      const tempTheme = await SecureStore.getItemAsync("theme");
      if (tempTheme) {
        const theme = JSON.parse(tempTheme);
        if (theme) dispatch(setCurrentTheme(theme as DefaultTheme));
      }
    } catch (error) {
      console.log(error);
    }
    try {
      // Secure store is always a string, so we need to parse it to a boolean
      const isMultiUser =
        (await SecureStore.getItemAsync("isMultiUser")) === "true";
      if (isMultiUser) {
        navigation.navigate("MultiUsePhone");
      } else {
        const temp = await SecureStore.getItemAsync("pinLogin");
        if (temp) {
          const Pinlogin: IPinCredentials = JSON.parse(temp);
          try {
            const jwtCred = await client.pinLogin(Pinlogin);
            client.setJwtCredentials(jwtCred);
            try {
              // try to parse the jwt token, if this throws a error it means that the jwt is incorrectly formed
              const content = parseJwt<JwtPayload>(jwtCred.jwt);
              const roleType: string | null = await SecureStore.getItemAsync(
                "roleType"
              );
              navigation.navigate("ChatStack", {
                screen: "ChatListTab",
                params: { fetchChats: true },
              });
              dispatch(
                updateUserData({
                  id: content.senderID,
                  jwt: jwtCred.jwt,
                  pinLogin: Pinlogin,
                  roleType:
                    roleType === null ? "relative" : (roleType as RoleType),
                })
              );
              dispatch(
                fetchUserById({
                  userID: content.senderID,
                  roleType: "caregiver",
                  // the type is actually correct but for somereason this won't work
                }) as unknown as AnyAction
              );
            } catch (exception) {
              navigation.navigate("RegisterTab");
              console.log(exception);
              await SecureStore.deleteItemAsync("pinLogin");
              await SecureStore.deleteItemAsync("roleType");
            }
          } catch (error) {
            navigation.navigate("RegisterTab");
            console.log(error);
            await SecureStore.deleteItemAsync("pinLogin");
            await SecureStore.deleteItemAsync("roleType");
          }
        } else {
          setTimeout(() => {
            navigation.navigate("RegisterTab");
            //TODO: add animation
          }, 1000);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const navigate = () => {
    navigation.navigate("RegisterTab");
  };

  useEffect(() => {
    PinLoginSecureStore();
    setTimeout(() => {
      setShowButton(true);
    }, 5000);
  }, [isFocused]);

  return <Introduction showButton={showButton} navigate={navigate} />;
}
