import { Avatar } from "@rneui/base";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import Modal from "react-native-modal";
import styled from "styled-components/native";
import { Container } from "../Common/CommonStyledComponents";
import { Title } from "../Common/Title";

export const AvatarListContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  background-color: ${(props) => props.theme.colors.white};
  width: 100%;
`;
const BigContainer = styled(Container)`
  padding-top: 0px;
  padding-bottom: 0px;
  margin-bottom: 0px;
  background-color: ${(props) => props.theme.colors.white};
  align-items: center;
`;

const AvatarContainer = styled.View`
  flex-direction: column;
  padding: 30px;
`;

const ModalView = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.colors.white};
`;

const ModalViewInside = styled.View`
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.colors.white};
`;

const ModalText = styled.Text`
  font-size: 20px;
  text-align: center;
  margin-bottom: 0px;
  padding: 0px;
  margin-top: 15px;
`;

const ButtonView = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 0px 15px;
  margin: 0px;
  margin-bottom: 15px;
`;

const StyledButton = styled.Button`
  /* padding-right: 7px; */
`;

export const ChangeAvatar = ({
  avatars,
  confirmAvatar,
  onBack,
}: {
  avatars: Avatar[];
  onBack: () => void;
  confirmAvatar: (picture: string) => void;
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedAvatarURI, setSelectedAvatarURI] = useState<string>("");
  const [avatarPicture, setAvatarPicture] = useState<number>();

  const toggleModal = (picture: string) => {
    if (!isModalVisible) {
      const findAvatar = avatars.find(
        (avatar) => avatar.picture === picture
      )?.avatar;
      setAvatarPicture(findAvatar ? findAvatar : avatars[0].avatar);
      setSelectedAvatarURI(picture);
    }
    setModalVisible(!isModalVisible);
  };

  return (
    <BigContainer>
      <Title onBack={onBack} text={"Valitse avatari"} />
      <ModalView>
        <Modal isVisible={isModalVisible}>
          <ModalViewInside>
            <ModalText>Haluatko tämän avatarin?</ModalText>
            <AvatarContainer>
              <Avatar size={130} source={avatarPicture} />
            </AvatarContainer>
            <ButtonView>
              <StyledButton
                title="Ei sittenkään"
                onPress={() => toggleModal("")}
              />
              <StyledButton
                title="Valitse"
                onPress={() => {
                  confirmAvatar(selectedAvatarURI);
                  toggleModal("");
                }}
              />
            </ButtonView>
          </ModalViewInside>
        </Modal>
      </ModalView>
      <ScrollView>
        <AvatarListContainer>
          {avatars.map(({ avatar, picture }) => {
            return (
              <AvatarContainer key={picture}>
                <Avatar
                  size={130}
                  source={avatar}
                  onPress={() => {
                    toggleModal(picture);
                  }}
                />
              </AvatarContainer>
            );
          })}
        </AvatarListContainer>
      </ScrollView>
    </BigContainer>
  );
};
