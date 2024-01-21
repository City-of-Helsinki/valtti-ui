import { FlatList } from "react-native-gesture-handler";
import Button from "../Common/Button";
import {
  Container,
  InfoText,
  InputField,
  Spinner,
} from "../Common/CommonStyledComponents";
import { Title } from "../Common/Title";
import { UserContainer } from "./Useritem";

export const MultiPhone = ({
  email,
  setEmail,
  password,
  setPassword,
  onLogin,
  onBack,
  isLoading,
  pin,
  setPin,
  users,
  renderItem,
  getPin,
  OnClickSavedUser,
  showPin,
  setShowPin,
}: {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onLogin: () => void;
  onBack: () => void;
  isLoading: boolean;
  pin: string;
  setPin: (pin: string) => void;
  users: SavedPinLogin[];
  renderItem: ({ item }: { item: SavedPinLogin }) => JSX.Element;
  getPin: boolean; // if the user is a saved user this will be true if not false. So the first time the user logs in to a multiusephone this will be false.
  OnClickSavedUser: (pin: string) => void;
  showPin: boolean;
  setShowPin: (showPin: boolean) => void;
}) => {
  return (
    <Container>
      <Title text="Ammattilaisen kirjautuminen" onBack={onBack} />
      {showPin || getPin ? (
        <InfoText>
          {showPin
            ? "Valitse nelinumeroinen PIN-koodi käyttäjälle"
            : "Anna PIN"}
        </InfoText>
      ) : (
        <InfoText>
          Kirjaudu sisään ammattilaisen sähköpostilla ja salasanalla.
        </InfoText>
      )}

      {showPin || getPin ? (
        <InputField
          keyboardType="numeric"
          value={pin}
          onChangeText={setPin}
          autoCapitalize={"none"}
          maxLength={4}
        />
      ) : (
        <>
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
        </>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        <Button
          onPress={() => {
            getPin
              ? OnClickSavedUser(pin)
              : showPin
                ? onLogin()
                : setShowPin(!showPin);
          }}
          label={showPin || getPin ? "Kirjaudu" : "Lisää käyttäjä"}
        />
      )}
      <UserContainer>
        {showPin || getPin ? (
          <></>
        ) : (
          <>
            {users.length > 0 && (
              <InfoText>Kirjaudu sisään tallennetuilla käyttäjillä.</InfoText>
            )}
            <FlatList data={users} renderItem={renderItem} />
          </>
        )}
      </UserContainer>
    </Container>
  );
};
