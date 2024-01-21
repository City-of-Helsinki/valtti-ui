import Button from "../Common/Button";
import {
  Container,
  Divider,
  InfoText,
  InputField,
  Spinner
} from "../Common/CommonStyledComponents";
import { Title } from "../Common/Title";

export const AddGroupChat = ({
  name,
  setName,
  groupname,
  phoneNumber,
  setGroupName,
  setPhoneNumber,
  onAdd,
  onBack,
  isLoading,
}: {
  name: string;
  groupname: string;
  setName: (name: string) => void;
  setGroupName: (name: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
  onAdd: () => void;
  onBack: () => void;
  isLoading: boolean;
}) => {
  return (
    <Container>
      <Title text={"Lisää ryhmäkeskustelu"} onBack={onBack} />
      <InfoText>
        Lisää ryhmäkeskustelu syöttämällä vastaanottajan nimi ja puhelinnumero.
        Jos vastaanottaja ei ole vielä rekisteröitynyt sovellukseen, hänelle
        lähetetään tekstiviesti, jossa on linkki rekisteröitymiseen.
        Ryhmäkeskusteluun lisätään kaikki tiimisi jäsenet ja kutsuttu henkilö.
      </InfoText>
      {isLoading ? (
        <> 
          <InfoText>
            Asiakasta lisätään ja ryhmää luodaan, odota hetki.
          </InfoText>
          <Spinner />
        </>
      ) : (
        <>
          <InputField
            placeholder="Ryhmän nimi"
            value={groupname}
            onChangeText={setGroupName}
          />
          <Divider />
          <InputField
            placeholder="Asiakkaan nimi"
            value={name}
            onChangeText={setName}
          />
          <InputField
            placeholder="Puhelinnumero"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType={"phone-pad"}
          />
          <Button onPress={onAdd} label={"Lisää ryhmäkeskustelu"} />
        </>
      )}
    </Container>
  );
};
