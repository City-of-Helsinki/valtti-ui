import { Avatar } from "@rneui/base";
import { Alert, ImageSourcePropType, Platform } from "react-native";
import styled from "styled-components/native";
import AppVersion from "../Common/AppVersion";
import Button from "../Common/Button";
import { Container, InputField } from "../Common/CommonStyledComponents";
import { Title } from "../Common/Title";
import { blueTheme, pinkTheme } from "../themes/default";

const ProfileContainer = styled.View`
  flex-direction: column;
  padding-right: 8px;
  padding-left: 8px;
  width: 100%;
  padding-bottom: 7px;
  margin-bottom: 30px;
  bottom: 20px;
`;

const ProfileText = styled.Text`
  font-size: ${(props) => props.theme.sizes.medium};
`;

const AvatarContainer = styled.View`
  flex-direction: column;
  padding-right: 8px;
  padding-left: 8px;
  width: 100%;
  padding-top: 10px;
  padding-bottom: 7px;
  margin-bottom: 10px;
  margin-left: 10%;
`;

const DescriptionView = styled.View`
  align-items: center;
  justify-content: center;
`;

const ProfileTextView = styled.View`
  justify-content: center;
  width: 100%;
  margin-left: 10%;
`;

const EditDescription = styled(InputField)`
  margin-top: 10px;
`;

export const OwnProfile = ({
  onBack,
  name,
  phoneNumber,
  description,
  setDescription,
  avatar,
  saveProfile,
  HandleLogout,
  setTheme,
  avatarOnPress,
}: {
  onBack: () => void;
  name: string;
  phoneNumber: string;
  description: string;
  setDescription: (description: string) => void;
  avatar: ImageSourcePropType;
  saveProfile: () => void;
  HandleLogout: () => void;
  setTheme: (theme: typeof blueTheme | typeof pinkTheme) => void;
  avatarOnPress: () => void;
}) => {
  // Show an alert with contact information
  // since user removal cannot be automated
  const requestAccountRemoval = () =>
    Alert.alert(
      "Poista käyttäjä",
      "Jos haluat poistaa käyttäjätilisi, olethan yhteydessä asiakaspalveluun sähköpostitse tuki@onervahoiva.fi"
    );

  return (
    <Container>
      <Title text="Profiili" onBack={onBack} />
      <ProfileContainer>
        <AvatarContainer>
          <Avatar size={130} source={avatar} onPress={avatarOnPress} />
        </AvatarContainer>
        <ProfileTextView>
          <ProfileText>Nimi: {name}</ProfileText>
          {phoneNumber ? (
            <ProfileText>Puhelinnumero: {phoneNumber}</ProfileText>
          ) : (
            <></>
          )}
          <ProfileText>Tietoa minusta:</ProfileText>
        </ProfileTextView>
        <DescriptionView>
          <EditDescription
            placeholder={"Kuvaile itseäsi"}
            value={description}
            onChangeText={setDescription}
            returnKeyType={Platform.OS === "ios" ? "default" : "none"}
            multiline={true}
          />
          <Button label="Tallenna" onPress={saveProfile} />
          <Button label="Kirjaudu ulos" onPress={HandleLogout} />
        </DescriptionView>
        <DescriptionView>
          <Button
            label="Vaihda teema punaiseksi"
            onPress={() => setTheme(pinkTheme)}
          />
          <Button
            label="Vaihda teema siniseksi"
            onPress={() => setTheme(blueTheme)}
          />
        </DescriptionView>
        <Button label="Poista käyttäjätili" onPress={requestAccountRemoval} />
        <AppVersion />
      </ProfileContainer>
    </Container>
  );
};
