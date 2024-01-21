import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import Theme from "./src/Theme";
// import { pinkTheme } from "./src/components/themes/default";
import Navigation from "./src/navigation";
// import { useTheme } from "./src/redux/hooks";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { store } from "./src/redux/store";

const client = new QueryClient();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

// request camera permissions on app init
// TODO: convert to a hook
ImagePicker.requestCameraPermissionsAsync();

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <Theme>
          <SafeAreaProvider>
            <Navigation />
            <StatusBar
              translucent={false}
              backgroundColor={"#ffff"}
              style={"dark"}
            />
          </SafeAreaProvider>
        </Theme>
      </QueryClientProvider>
    </Provider>
  );
}
