import { useNavigation as reactNavigationUseNavigation } from "@react-navigation/core";
import { StackNavigationProp } from "@react-navigation/stack";

import { NavigationProps } from "./types";

export const useNavigation = () => {
  const navigation =
    reactNavigationUseNavigation<StackNavigationProp<NavigationProps>>();

  return navigation;
};
