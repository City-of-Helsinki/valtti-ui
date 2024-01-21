import { KeyboardAvoidingView, Platform } from "react-native";
import styled from "styled-components/native";
import { RegisterAutoScroll } from "../Common/AutoScroll";
import Button from "../Common/Button";
import {
  InfoText,
  InputField,
  Spinner,
  Text,
  TextContainer,
  TitleContainer
} from "../Common/CommonStyledComponents";

const AdminLoginButtonContainer = styled.View`
  padding-right: 8px;
  padding-bottom: 7px;
  align-items: center;
  width: 100%;
  text-align: center;
`;

const InputFieldView = styled.View`
  width: 100%;
  align-items: center;
  margin-top: 10px;
`;

const ButtonView = styled.View`
  width: 100%;
  align-items: center;
  margin-top: 10px;
`;

const MarginView = styled.View`
  margin-top: 50px;
`;

const ProRegisterText = styled(InfoText)`
  color: ${(props) => props.theme.colors.primary};
  text-decoration: underline;
  font-weight: bold;
  margin: auto;
  text-align: center;
`;

export const Register = ({
  phoneNumber,
  setPhoneNumber,
  onLogin,
  navigation,
  isLoading,
}: {
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
  onLogin: () => void;
  navigation: () => void;
  isLoading: boolean;
}) => {
  return (
    <RegisterAutoScroll>
      <TitleContainer>
        <Text>Rekisteröidy</Text>
      </TitleContainer>
      <TextContainer>
        <InfoText>
          Tervetuloa Helsingin kaupungin lastensuojelun ja perhesosiaalityön
          viestisovellukseen.
        </InfoText>
        <MarginView />
        <InfoText>
          Rekisteröidy sovellukseen syöttämällä puhelinnumerosi.
        </InfoText>
      </TextContainer>

      {!isLoading ? (
        <>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
            style={{
              width: "100%",
              flex: 1,
              minHeight: 200,
            }}
          >
            <InputFieldView>
              <InputField
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder={"Puhelinnumero"}
                autoCapitalize={"none"}
                keyboardType={"phone-pad"}
              />
            </InputFieldView>
            <ButtonView>
              <Button onPress={onLogin} label={"Rekisteröidy"} />
            </ButtonView>
            <AdminLoginButtonContainer>
              <ProRegisterText onPress={navigation}>
                Ammattilainen kirjaudu tästä
              </ProRegisterText>
            </AdminLoginButtonContainer>
          </KeyboardAvoidingView>
        </>
      ) : (
        <>
          <Spinner />
        </>
      )}
    </RegisterAutoScroll>
  );
};
