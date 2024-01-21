import Button from "../Common/Button";
import {
  Container,
  InfoText,
  InputField,
  Spinner,
} from "../Common/CommonStyledComponents";
import { Title } from "../Common/Title";

export const ConfiramtionCode = ({
  confirmationCode,
  setconfirmationCode,
  onLogin,
  isLoading,
  goBack,
}: {
  confirmationCode: string;
  setconfirmationCode: (confirmationCode: string) => void;
  onLogin: () => void;
  isLoading: boolean;
  goBack: () => void;
}) => {
  return (
    <Container>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <Title onBack={goBack} text={"Vahvistuskoodi"} />
          <InfoText>Syötä vahvistuskoodi jonka sait tekstiviestillä.</InfoText>
          <InputField
            value={confirmationCode}
            onChangeText={setconfirmationCode}
            placeholder={"Vahvistuskoodi"}
            autoCapitalize={"none"}
            keyboardType="numeric"
            maxLength={9}
          />
          <Button onPress={onLogin} label={"Rekisteröidy"} />
        </>
      )}
    </Container>
  );
};
