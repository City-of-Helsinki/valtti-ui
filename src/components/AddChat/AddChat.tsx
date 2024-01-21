import Button from "../Common/Button";
import { Container, InfoText } from "../Common/CommonStyledComponents";
import { Title } from "../Common/Title";

export const AddChat = ({
  HandleOnetoOne,
  HandleGroupChat,
  onBack,
}: {
  HandleOnetoOne: () => void;
  HandleGroupChat: () => void;
  onBack: () => void;
}) => {
  return (
    <Container>
      <Title text="Lisää uusi keskustelu" onBack={onBack} />
      <InfoText>
        Voit lisätä uuden yksityisen keskustelun tai ryhmäkeskustelun.
      </InfoText>
      <Button onPress={HandleOnetoOne} label={"Lisää yksityiskeskustelu"} />
      <Button onPress={HandleGroupChat} label={"Lisää ryhmäkeskustelu"} />
    </Container>
  );
};
