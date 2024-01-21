import { useFocusEffect } from "@react-navigation/core";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FaIcon from "react-native-vector-icons/FontAwesome5";
import FoundationIcon from "react-native-vector-icons/Foundation";
import styled, { useTheme } from "styled-components/native";
import { SendMessageItem } from "../../screens/chat";
import { formatMillis } from "../../utils";

import { RecordingStatus } from "expo-av/build/Audio";
import { InputField, Spinner } from "../Common/CommonStyledComponents";
import {
  BackIcon,
  ColorStyle,
  ImageHeader,
  InfoContainer,
  LargeImageContainerStyle,
  MessageInfoText,
} from "./Chat";
import {
  ChatIcon,
  LargeIcon,
  LargeImage,
  LargeImageContainer,
} from "./ChatMessageItem";

type ChatInputProps = {
  onSend: (data: SendMessageItem) => void;
  notDoneYet: () => void;
  isSendingMsg: boolean;
};

interface RecordingInfo {
  active: boolean;
  paused: boolean;
  duration: number;
}

const ChatInput = (props: ChatInputProps) => {
  const theme = useTheme();
  const [imageAsset, setImageAsset] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const [msg, setMsg] = useState<string>("");
  const [shown, setKeyboardShown] = useState(false);
  const [height, setHeight] = useState();
  const [showSend, setShowSend] = useState(false);
  const [chooseImageVisible, setChooseImageVisible] = useState(false);
  const [recordingInfo, setRecordingInfo] = useState<RecordingInfo>({
    active: false,
    paused: false,
    duration: 0,
  });
  const [recording, setRecording] = useState<Audio.Recording>();

  const onSend = () => {
    if (imageAsset) {
      props.onSend({
        type: "image",
        media: imageAsset,
      });
      setImageAsset(null);
    } else if (msg) {
      props.onSend({
        message: msg,
        type: "text",
      });
      setMsg("");
    }
    setShowSend(false);
  };

  const takePhoto = async () => {
    // ask for camera permissions
    const { granted } = await ImagePicker.getCameraPermissionsAsync();

    // If user denied access to device camera
    if (!granted) {
      return Alert.alert(
        "Et voi ottaa kuvaa koska olet evännyt kameraoikeudet"
      );
    }

    try {
      // needs Permissions.CAMERA
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
        base64: true,
      });

      // If user didn't cancel taking a photo
      if (!result.canceled) {
        setChooseImageVisible(false);
        setImageAsset(result.assets[0]);
      }
    } catch (error) {
      console.log("error while taking a pic", error);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      // allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setChooseImageVisible(false);
      setImageAsset(result.assets[0]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // reset the state if the focus changes from this screen/"tab" to another.
      // this is the correct way to reset a state in the case of focus change
      setMsg("");
      setImageAsset(null);
      setKeyboardShown(false);

      const showSubscription = Keyboard.addListener("keyboardWillShow", () => {
        // this will trigger the show keyboard avoiding view "padding popup"
        setKeyboardShown(true);
      });
      return () => {
        showSubscription.remove();
      };
    }, [])
  );

  const autoGrow = (event: any) => {
    if (Platform.OS !== "ios") {
      const { height } = event.nativeEvent.contentSize;
      if (height > 120) {
        return;
      }
      setHeight(height);
    }
  };

  const onCloseImage = () => {
    setImageAsset(null);
  };

  const onRecordingUpdate = ({ durationMillis }: RecordingStatus) =>
    setRecordingInfo((state) => ({ ...state, duration: durationMillis }));

  // Start recording a sound message
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const HIGH_QUALITY = Audio.RecordingOptionsPresets.HIGH_QUALITY;
      const { recording } = await Audio.Recording.createAsync(
        HIGH_QUALITY,
        onRecordingUpdate
      );

      setRecording(recording);
      setRecordingInfo((state) => ({ ...state, active: true }));
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Tapahtui virhe tallennettaessa ääniviestiä.");
    }
  };

  // Stop recording and discard record
  const stopAndDiscardRecording = async () => {
    // if existing audio
    if (recording) {
      await recording.stopAndUnloadAsync();
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    setRecording(undefined);
    setRecordingInfo({ active: false, paused: false, duration: 0 });
  };

  // Stop and send recording
  const stopAndSendRecording = async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    setRecordingInfo({ active: false, paused: false, duration: 0 });

    // if no existing audio
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const localUri = recording.getURI() || "";

    // Read the audio resource from it's local Uri
    const options = { encoding: FileSystem.EncodingType.Base64 };
    const data = await FileSystem.readAsStringAsync(localUri, options);

    props.onSend({ type: "sound", soundBase64: data });
    setRecording(undefined);
  };

  // Pause recording temporarily
  const pauseRecording = async () => {
    // if no recording
    if (!recording) return;

    // if currently paused, continue
    // otherwise pause recording
    if (recordingInfo.paused) {
      await recording.startAsync();
    } else {
      await recording.pauseAsync();
    }

    setRecordingInfo((state) => ({ ...state, paused: !state.paused }));
  };

  return (
    <>
      {!!imageAsset && (
        <Modal
          presentationStyle="overFullScreen"
          animationType="slide"
          transparent={true}
          visible={!!imageAsset}
        >
          <StatusBar animated={true} backgroundColor={theme.colors.secondary} />
          <LargeImageContainerStyle color={theme.colors.secondary}>
            <TouchableOpacity onPress={onCloseImage}>
              <ImageHeader color="transparent">
                <BackIcon name="chevron-left" onPress={onCloseImage} />
                <TouchableOpacity onPress={onCloseImage}>
                  <SmallerText>Takaisin</SmallerText>
                </TouchableOpacity>
              </ImageHeader>
            </TouchableOpacity>
            <LargeImageContainer>
              <LargeImage
                image={{
                  width: imageAsset?.width,
                  height: imageAsset?.height,
                  content: imageAsset?.uri as string,
                }}
              />
            </LargeImageContainer>
            <SendButtonContainer>
              <SendButton
                onPress={() => {
                  onSend();
                  setImageAsset(null);
                }}
              >
                <ChatFaIcon
                  name="paper-plane"
                  color={theme.colors.white}
                  style={{
                    textAlign: "center",
                  }}
                />
              </SendButton>
            </SendButtonContainer>
          </LargeImageContainerStyle>
        </Modal>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={chooseImageVisible}
        onRequestClose={() => setChooseImageVisible(false)}
      >
        <AddPhotoModal>
          <AddPhotoModalContent>
            <InfoContainer
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
                width: "90%",
              }}
            >
              <MessageInfoText black={true}>
                Ota kuva tai valitse galleriasta
              </MessageInfoText>
              <TouchableOpacity onPress={() => setChooseImageVisible(false)}>
                <LargeIcon size={45} name="x" />
              </TouchableOpacity>
            </InfoContainer>
            <MenuButton onPress={() => takePhoto()}>
              <InfoContainer>
                <ChatIcon name="device-camera" />
                <MessageInfoText>Ota Kuva</MessageInfoText>
              </InfoContainer>
            </MenuButton>
            <MenuButton onPress={() => pickImage()}>
              <InfoContainer>
                <ChatIcon name="image" />
                <MessageInfoText>Valitse Galleriasta</MessageInfoText>
              </InfoContainer>
            </MenuButton>
          </AddPhotoModalContent>
        </AddPhotoModal>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={recordingInfo.active}
        onRequestClose={stopAndDiscardRecording}
      >
        <AddPhotoModal>
          <AddPhotoModalContent>
            <InfoContainer
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
              }}
            >
              <SoundMessageInfo>
                <ChatMicIcon
                  color="red"
                  key={"mic-icon"}
                  style={{ marginLeft: 0 }}
                  name="microphone"
                />
                <Text style={{ color: "red", paddingLeft: 10 }}>
                  {formatMillis(recordingInfo.duration)} Äänitetään...
                </Text>
              </SoundMessageInfo>
              {/* <TouchableOpacity onPress={stopAndDiscardRecording}>
                <LargeIcon size={45} name="x" />
              </TouchableOpacity> */}
            </InfoContainer>
            <RecordingControls>
              <TouchableOpacity onPress={stopAndDiscardRecording}>
                <LargeIcon size={45} name="trash" />
              </TouchableOpacity>
              <TouchableOpacity onPress={pauseRecording}>
                <PauseIcon
                  size={45}
                  name={recordingInfo.paused ? "play" : "pause"}
                />
              </TouchableOpacity>
              <ChatFaIcon name="paper-plane" onPress={stopAndSendRecording} />
            </RecordingControls>
          </AddPhotoModalContent>
        </AddPhotoModal>
      </Modal>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled={shown}
      >
        <ChatInputContainer>
          {props.isSendingMsg ? (
            <ChatInputElementContainer>
              <SendingMessageSpinnerContainer>
                <Spinner size="small" />
              </SendingMessageSpinnerContainer>
            </ChatInputElementContainer>
          ) : (
            <ChatInputElementContainer>
              <IconContainer>
                <FileButton
                  onPress={() => setChooseImageVisible((state) => !state)}
                />
              </IconContainer>
              <ChatInputElement
                placeholder="Kirjoita tähän viestisi..."
                value={msg}
                onContentSizeChange={autoGrow}
                style={Platform.OS === "ios" ? null : { height: height }}
                onChangeText={(text) => {
                  setMsg(text);
                  if (text.length > 0) {
                    setShowSend(true);
                  } else {
                    setShowSend(false);
                  }
                }}
                returnKeyType={Platform.OS === "ios" ? "default" : "none"}
                multiline={true}
                onFocus={() => {
                  if (msg.length > 0) {
                    setShowSend(true);
                  } else {
                    setShowSend(false);
                  }
                }}
                onEndEditing={() => {
                  setShowSend(false);
                }}
              />
              <IconContainer>
                {showSend ? (
                  <ChatFaIcon name="paper-plane" onPress={() => onSend()} />
                ) : (
                  <ChatMicIcon
                    key={"mic-icon"}
                    name="microphone"
                    onPress={startRecording}
                  />
                )}
              </IconContainer>
            </ChatInputElementContainer>
          )}
        </ChatInputContainer>
      </KeyboardAvoidingView>
    </>
  );
};

const SoundMessageInfo = styled(View)`
  flex-direction: row;
  align-items: center;
  text-align: center;
  justify-content: flex-start;
  font-size: ${(props) => props.theme.sizes.smaller};
  color: ${(props) => props.theme.colors.black};
  /* margin: auto; */
  margin-right: 4px;
  margin-left: 4px;
  padding-left: 2px;
  padding-right: 2px;
  width: 100%;
`;

const PauseIcon = styled(FoundationIcon)`
  font-size: 27px;
  margin: auto;
  color: ${(props) => props.theme.colors.lightGrey};
`;

const RecordingControls = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 30px;
`;

const ChatInputElement = styled(InputField)`
  width: 76%;
  padding-horizontal: 0;
  margin: auto;
  min-height: 30px;
  max-height: 120px;
`;

const SendingMessageSpinnerContainer = styled.View`
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const ChatInputElementContainer = styled.View`
  flex-direction: row;
  background-color: ${(props) => props.theme.colors.white};
  border-radius: 12px;
  padding-left: 10px;
  padding-right: 10px;
`;

const ChatInputContainer = styled.View`
  padding-left: 13px;
  padding-right: 12px;
  margin-bottom: ${Platform.OS === "ios" ? "45px" : "15px"};
`;

const SendButtonContainer = styled.View`
  display: flex;
  align-items: center;
  border-radius: 50px;
  margin-left: 20px;
  margin-right: 20px;
  background-color: ${(props) => props.theme.colors.primary};
`;

const MenuButton = styled.TouchableOpacity`
  padding-left: 6px;
`;

const AddPhotoModal = styled.View`
  background-color: ${(props) => props.theme.colors.lightGreyTransparency};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
`;

const AddPhotoModalContent = styled.View`
  background-color: ${(props) => props.theme.colors.white};
  padding-bottom: 18px;
  width: 100%;
`;

const SmallerText = styled.Text`
  font-size: ${(props) => props.theme.sizes.smaller};
  font-weight: 500;
  color: ${(props) => props.theme.colors.grey};
`;

const SendButton = styled.Pressable`
  width: 100%;
`;

const ChatFaIcon = styled(FaIcon)<Partial<ColorStyle>>`
  padding-left: 2px;
  padding-right: 2px;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 23px;
  font-weight: 400;
  color: ${(props) =>
    props.color ? props.color : props.theme.colors.lightGrey};
`;

const ChatMicIcon = styled(FaIcon)<Partial<ColorStyle>>`
  padding-left: 6px;
  padding-right: 6px;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 23px;
  font-weight: 400;
  margin-left: auto;
  color: ${(props) =>
    props.color ? props.color : props.theme.colors.lightGrey};
`;

const IconContainer = styled.View`
  flex-direction: row;
  width: 12%;
`;

const EmojiButton = ({ onPress }: { onPress: () => void }) => (
  <ChatFaIcon key={"emoji-icon"} name="smile-beam" onPress={onPress} />
);

const FileButton = ({ onPress }: { onPress: () => void }) => (
  <ChatIcon key={"file-icon"} name="file" onPress={onPress} />
);

export default ChatInput;
