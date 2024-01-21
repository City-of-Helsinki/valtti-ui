import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AddChatScreen from "../screens/addChat";
import AddGroup from "../screens/addGroup";
import AddOneToOneChat from "../screens/addOneToOne";
import AvatarChanger from "../screens/avatar";
import OneToOneChat from "../screens/chat";
import ChatListScreen from "../screens/chatList";
import ConfiramtionCodeScreen from "../screens/confirmationCode";
import LoadingScreen from "../screens/loadingScreen";
import MultiUsePhone from "../screens/multiusephone";
import PhoneNumber from "../screens/phonenumber";
import Profile from "../screens/profile";
import { ChatStackParamList, LoginStackParamList } from "./types";
import { useNavigation } from "./useNavigation";
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#FFF",
  },
};

const Navigation = () => {
  return (
    <NavigationContainer theme={MyTheme}>
      <Tab.Navigator
        initialRouteName={"LoginStack"}
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: "white", display: "none" },
        }}
      >
        <Tab.Screen name="LoginStack" component={LoginStackNavigator} />
        <Tab.Screen name="ChatStack" component={ChatStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const Tab = createBottomTabNavigator();
const LoginStack = createStackNavigator<LoginStackParamList>();
const ChatStack = createStackNavigator<ChatStackParamList>();

const LoginStackNavigator = () => (
  <LoginStack.Navigator
    initialRouteName={"LoadingScreen"}
    screenOptions={{
      headerShown: false,
      animationEnabled: false,
    }}
  >
    <LoginStack.Screen name={"LoadingScreen"} component={LoadingScreen} />
    <LoginStack.Screen name={"RegisterTab"} component={PhoneNumber} />
    <LoginStack.Screen name={"MultiUsePhone"} component={MultiUsePhone} />

    <LoginStack.Screen
      name={"ConfirmationNumber"}
      component={ConfiramtionCodeScreen}
    />
  </LoginStack.Navigator>
);

const ChatStackNavigator = () => (
  <ChatStack.Navigator
    initialRouteName={"ChatListTab"}
    screenOptions={{
      headerShown: false,
      animationEnabled: false,
    }}
  >
    <ChatStack.Screen name={"ChatListTab"} component={ChatListScreen} />
    <ChatStack.Screen name={"AvatarChanger"} component={AvatarChanger} />
    <ChatStack.Screen name={"ChatTab"} component={OneToOneChat} />
    <ChatStack.Screen name={"AddChatTab"} component={AddChatScreen} />
    <ChatStack.Screen name={"AddOneToOneChat"} component={AddOneToOneChat} />
    <ChatStack.Screen name={"AddGroup"} component={AddGroup} />
    <ChatStack.Screen name={"ProfileTab"} component={Profile} />
  </ChatStack.Navigator>
);

export { useNavigation };

export default Navigation;
