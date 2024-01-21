import Button from "../Common/Button";

export const AddChat = ({ onClick }: { onClick: () => void }) => {
  return <Button onPress={onClick} label={"Lisää keskustelu"}></Button>;
};
