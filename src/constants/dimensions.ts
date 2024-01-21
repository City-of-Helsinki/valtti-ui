import { Dimensions } from "react-native";

const { height, width } = Dimensions.get("window");

export default {
  screenWidth: width,
  screenHeight: height,
};
