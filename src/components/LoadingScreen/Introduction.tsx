// @ts-nocheck TODO: figure out why this is throwing a error
import styled from "styled-components/native";
import logo from "../../icons/Rounded.png";
import Button from "../Common/Button";

const ValttiLogo = styled.Image`
  margin-top: 50px;
  padding: 0;
  width: 80%;
`;

const LogoContainer = styled.View`
  align-items: center;
`;

interface IntroductionProps {
  showButton: boolean;
  navigate: () => void;
}

export const Introduction = ({ showButton, navigate }: IntroductionProps) => {
  return (
    <LogoContainer>
      <ValttiLogo source={logo} resizeMode="contain" />
      {showButton && <Button label="Aloita" onPress={() => navigate()} />}
    </LogoContainer>
  ) as React.ReactNode;
};
