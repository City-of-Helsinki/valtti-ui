import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// TODO: Send token to server and store it in the database when registering user
export async function registerForPushNotificationsAsync() {
  // let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // if (Device.isDevice) {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    alert("Failed to get push token for push notification!");
    return;
  }
  const token = (
    await Notifications.getExpoPushTokenAsync({
      experienceId: "@onerva/lasu-app",
    })
  ).data;
  // } else {
  //   alert("Must use physical device for Push Notifications");
  // }

  return { tokenType: "expo", tokenPayload: token };
}

/**
 * clears the notifications from notification tray if the given chat has received notifications
 * if there is no more notifications in the tray set badge count to zero
 * @param chatID 
 * @returns 
 */
export async function dismissSeenNotification(chatID: string): Promise<void[]> {
  const notifications = await Notifications.getPresentedNotificationsAsync();
  // get notifications regarding this chat
  const chatNotifications = notifications.filter((n) => n.request.content.data["chatID"] === chatID);
  // dismiss all the notifications regarding this chat 
  const promises = chatNotifications.map(noti => {
    return Notifications.dismissNotificationAsync(noti.request.identifier);
  });

  // if there is no other notifications in the notification tray set the app icon badge count to zero
  if (notifications.filter(noti => noti.request.content.data["chatID"] !== chatID).length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    promises.push(Notifications.setBadgeCountAsync(0).then(() => { }));
  }

  return await Promise.all(promises);
}