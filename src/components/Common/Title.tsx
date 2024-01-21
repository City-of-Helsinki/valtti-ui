import Icon from "react-native-vector-icons/Octicons";
import styled from "styled-components/native";

export const TitleContainer = styled.View`
  flex-direction: row;
  padding-right: 10px;
  padding-left: 10px;
  background-color: ${(props) => props.theme.colors.white};
  width: 100%;
  padding-top: 15px;
  padding-bottom: 7px;
  margin-bottom: 30px;
`;

export const TitleText = styled.Text`
  font-size: ${(props) => props.theme.sizes.medium};
`;

const BackIcon = styled(Icon)`
  padding-left: 6px;
  padding-right: 10px;
  font-size: ${(props) => props.theme.sizes.large};
  color: ${(props) => props.theme.colors.grey};
`;

export const Title = ({
  onBack,
  text,
}: {
  onBack: () => void;
  text: string;
}) => {
  return (
    <TitleContainer>
      <BackIcon name="chevron-left" onPress={onBack} />
      <TitleText>{text}</TitleText>
    </TitleContainer>
  );
};
