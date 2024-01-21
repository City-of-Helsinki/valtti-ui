import { DefaultTheme } from "styled-components/native";

export type Colors = {
  third: string;
  secondary: string;
  primary: string;
  darkPrimary: string;
  // TODO maybe we can delete dark if its not in use, because it probably doesn't fit the color palette.
  dark: string;
  white: string;
  darkGrey: string;
  grey: string;
  lightGrey: string;
  lightGreyTransparency: string;
  black: string;
  red: string;
  background: string;
  outgoing: string;
};

export const sizes = {
  smallest: "14px",
  smaller: "18px",
  small: "21px",
  medium: "23px",
  large: "25px",
  borderRadius: "12px",
  padding: "10px",
  margin: "6px",
};

export type Sizes = {
  [key in keyof typeof sizes]: string;
};

// default pink theme.
export const pinkColors: Colors = {
  // figure out which color is best for this scenario
  third: "#E62393",
  secondary: "#FBE4FE",
  primary: "#e24588",
  darkPrimary: "#852950",
  dark: "#C73265",
  white: "#ffffff",
  darkGrey: "#53535D",
  grey: "#5d5d63",
  lightGrey: "#a1a5a8",
  lightGreyTransparency: "rgba(167,165,168,0.35)",
  black: "#000000",
  red: "#FF5168",
  background: "#ffffff",
  // figure out which color is best for this scenario
  outgoing: "#E5B4E4",
};

export const pinkTheme: DefaultTheme = {
  colors: pinkColors,
  sizes,
};

export const blueColors: Colors = {
  third: "#9A98C8",
  secondary: "#EAEBFF",
  primary: "#524FDA",
  darkPrimary: "#2e2c78",
  dark: "#251EBD",
  white: "#ffffff",
  darkGrey: "#53535D",
  grey: "#5d5d63",
  lightGrey: "#a1a5a8",
  lightGreyTransparency: "rgba(167,165,168,0.35)",
  black: "#000000",
  red: "#FF6168",
  background: "#ffffff",
  outgoing: "#9A98C7",
};

export const blueTheme: DefaultTheme = {
  colors: blueColors,
  sizes,
};
