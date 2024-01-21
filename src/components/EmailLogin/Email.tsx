import Button from "../Common/Button";
import {
  Container,
  InfoText,
  InputField,
  Spinner,
} from "../Common/CommonStyledComponents";
import { Title } from "../Common/Title";

export const Email = ({
  email,
  setEmail,
  password,
  setPassword,
  onLogin,
  onBack,
  isLoading,
}: {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onLogin: () => void;
  onBack: () => void;
  isLoading: boolean;
}) => {
  return (
    <Container>
      <Title text="Ammattilaisen kirjautuminen" onBack={onBack} />
      <InfoText>
        Kirjaudu sisään ammattilaisen sähköpostilla ja salasanalla.
      </InfoText>
      <InputField
        value={email}
        onChangeText={setEmail}
        placeholder={"Sähköposti"}
        autoCapitalize={"none"}
      />
      <InputField
        value={password}
        onChangeText={setPassword}
        placeholder={"Salasana"}
        autoCapitalize={"none"}
      />
      {isLoading ? (
        <Spinner />
      ) : (
        <Button onPress={onLogin} label={"Kirjaudu"} />
      )}
    </Container>
  );
};
