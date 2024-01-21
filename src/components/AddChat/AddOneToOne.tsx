import Button from "../Common/Button";
import {
  Container,
  InfoText,
  InputField,
  Spinner,
} from "../Common/CommonStyledComponents";
import { Title } from "../Common/Title";

export const AddOneToOneChat = ({
  name,
  setName,
  phoneNumber,
  setPhoneNumber,
  onAdd,
  onBack,
  isLoading,
}: {
  name: string;
  setName: (name: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
  onAdd: () => void;
  onBack: () => void;
  isLoading: boolean;
}) => {
  return (
    <Container>
      <Title text={"Lisää yksityiskeskustelu"} onBack={onBack} />
      <InfoText>
        Lisää yksityiskeskustelu syöttämällä vastaanottajan nimi ja
        puhelinnumero. Jos vastaanottaja ei ole vielä rekisteröitynyt
        sovellukseen, hänelle lähetetään tekstiviesti, jossa on linkki
        rekisteröitymiseen.
      </InfoText>
      {isLoading ? (
        <>
          <InfoText>Asiakasta lisätään, odota hetki.</InfoText>
          <Spinner />
        </>
      ) : (
        <>
          <InputField placeholder="Nimi" value={name} onChangeText={setName} />
          <InputField
            placeholder="Puhelinnumero"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType={"phone-pad"}
          />
          <Button onPress={onAdd} label={"Lisää yksityinen keskustelu"} />
        </>
      )}
    </Container>
  );
};
