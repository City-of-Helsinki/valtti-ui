import * as Application from "expo-application";
import styled from "styled-components/native";

const VersionText = styled.Text`
  margin-top: 15px;
  text-align: center;
  color: ${(props) => props.theme.colors.lightGrey};
`;

const AppVersion = () => {
  const environment =
    process.env.NODE_ENV === "production" ? "tuotanto" : "kehitys";

  return (
    <VersionText>
      Versio {Application.nativeApplicationVersion} ({environment})
    </VersionText>
  );
};

export default AppVersion;
