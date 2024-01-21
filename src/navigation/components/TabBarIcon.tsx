import { FontAwesome } from "@expo/vector-icons";
import * as React from "react";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  icon: {
    marginBottom: -3,
  },
});

const TabBarIcon = (props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) => <FontAwesome size={30} style={styles.icon} {...props} />;

export default TabBarIcon;
