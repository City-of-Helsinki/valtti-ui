import { ActivityIndicatorProps, Platform } from "react-native";
import styled, { useTheme } from "styled-components/native";

export const Container = styled.View`
  text-align: center,
  width: 100%;
  align-items: center;
  padding-bottom: 7px;
  ${Platform.OS === "ios" && "margin-top: 35px;"}
  background-color: ${(props) => props.theme.colors.secondary};
  height: 100%;
`;

export const TextContainer = styled.View`
  height: auto;
  text-align: center,
  width: 100%;
  align-items: center;
`;

export const InputField = styled.TextInput`
  margin: ${(props) => props.theme.sizes.margin};
  border-bottom: none;
  background-color: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.sizes.borderRadius};
  padding-top: ${(props) => props.theme.sizes.padding};
  padding-bottom: ${(props) => props.theme.sizes.padding};
  padding-horizontal: ${(props) => props.theme.sizes.padding};
  width: 80%;
`;

export const InfoText = styled.Text`
  font-size: ${(props) => props.theme.sizes.smallest};
  margin-vertical: 10px;
  width: 100%;
  color: ${(props) => props.theme.colors.darkGrey}
  text-align: left;
  padding: 10px;
  width: 80%;
`;

export const LogoText = styled.Text`
  font-size: 50px;
  marginvertical: 10px;
  width: 100%;
  text-align: center;
  color: #12cdd4;
  font-weight: 900;
`;

export const TitleContainer = styled.View`
  flex-direction: row;
  padding-right: 10px;
  padding-left: 20px;
  background-color: ${(props) => props.theme.colors.white};
  width: 100%;
  align-items: center;
  padding-top: 10px;
  padding-bottom: 7px;
  margin-bottom: 30px;
`;

export const Text = styled.Text`
  font-size: 21px;
`;

export const Divider = styled.View`
  background-color: ${(props) => props.theme.colors.lightGreyTransparency};
  height: 0.5px;
  margin-top: 5px;
  margin-bottom: 5px;
  border-radius: 38px;
`;

export const Avatar = styled.Image<{ size: number }>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  margin-top: auto;
  margin-bottom: auto;
`;

export const SpinnerComponent = styled.ActivityIndicator`
  font-size: 50px;
  size: 500px;
  color: ${(props) => props.theme.colors.primary};
  font-color: ${(props) => props.theme.colors.primary};
`;

export const Spinner = (props: ActivityIndicatorProps) => {
  const theme = useTheme();
  return (
    <SpinnerComponent
      size={props.size || "large"}
      color={theme.colors.primary}
    />
  );
};
