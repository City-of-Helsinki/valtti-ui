import { PressableProps } from "react-native";
import styled from "styled-components/native";

type PressedProps = {
  pressed: boolean;
};

const ButtonContainer = styled.View<PressedProps>`
  background-color: ${(props) =>
    props.pressed ? props.theme.colors.dark : props.theme.colors.primary};
  border-radius: ${(props) => props.theme.sizes.borderRadius}
  border: 1px transparent;
  margin: ${(props) => props.theme.sizes.margin};
  width: 80%;
  padding: ${(props) => props.theme.sizes.padding};
  align-items: center;
  text-align:center;
`;

const ButtonLabel = styled.Text`
  color: ${(props) => props.theme.colors.white};
  margin: auto;
`;

const PressableStyle = styled.Pressable`
  width: 100%;
  align-items: center;
`;

interface ButtonProps extends PressableProps {
  label: string;
}

const Button = ({ label, ...props }: ButtonProps) => {
  return (
    <PressableStyle {...props}>
      {({ pressed }) => (
        <ButtonContainer pressed={pressed}>
          <ButtonLabel>{label}</ButtonLabel>
        </ButtonContainer>
      )}
    </PressableStyle>
  );
};

export default Button;
