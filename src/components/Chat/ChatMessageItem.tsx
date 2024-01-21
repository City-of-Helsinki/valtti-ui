import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from "expo-av";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FoundationIcon from "react-native-vector-icons/Foundation";
import Icon from "react-native-vector-icons/Octicons";
import { DefaultTheme, StyledComponentProps } from "styled-components";
import styled from "styled-components/native";
import { MessageItem } from "../../queries";
// FIXME: nää pitää open sourcaa

import {
  formatTimestamp,
  ImageRepresentation,
  useAudio,
  useImage
} from "../../utils";

interface Outgoing {
  outgoing?: boolean;
}

//align-items: ${(props) => (props.outgoing ? "flex-end" : "flex-start")};
const RanOutOfNames = styled(View)<Outgoing>`
  width: ${(props) => (props.outgoing ? "100%" : "auto")};
  align-items: ${(props) => (props.outgoing ? "flex-end" : "flex-start")};
`;

const ChatMessageStyles = styled(Text)<Outgoing>`
  font-size: ${(props) => props.theme.sizes.smaller};
  color: ${(props) =>
    props.outgoing ? props.theme.colors.white : props.theme.colors.grey};
  padding-horizontal: ${(props) => props.theme.sizes.padding};
  flex-wrap: wrap;
  margin-right: 5px;
  margin-left: 5px;
`;

const ExtraInfo = styled.Text<Outgoing>`
  font-size: 12px;
  padding: 1px;
  ${(props) => props.outgoing && "padding-right: 11px;"}
  ${(props) => (props.outgoing ? "margin-left: auto" : "margin-left: auto")}
  color: ${(props) => props.theme.colors.grey};
`;

const ChatMessageContainer = styled.View<Outgoing>`
  background-color: ${(props) =>
    props.outgoing ? props.theme.colors.primary : props.theme.colors.white};
  border-radius: 20px;
  /* flex-shrink: 1; */
  flex-basis: auto;
  margin: 3px;
  padding-top: 5.8px;
  padding-bottom: 5.8px;
  margin-left: 8px;
  margin-right: 8px;
`;

const Sender = styled.Text<Outgoing>`
  color: ${(props) =>
    props.outgoing ? props.theme.colors.outgoing : props.theme.colors.third};
  font-weight: bold;
  font-size: ${(props) => props.theme.sizes.smallest};
  padding-horizontal: ${(props) => props.theme.sizes.padding};
  flex-wrap: wrap;
  margin-right: 5px;
  margin-left: 5px;
  margin-vertical: 2px;
  margin-left: 5px;
`;


export const ImageStyle = styled.Image<
  Pick<ImageRepresentation, "height" | "width">
>`
  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  border-radius: 15px;
  padding-top: 5.8px;
  padding-bottom: 5.8px;
  margin: 3px;
  margin-left: 8px;
`;

const MessageRemoved = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  margin-top: 5px;
  ${Platform.OS === "ios" ? "padding-top: 5px" : ""}
  ${Platform.OS === "ios" ? "padding-left: 15px" : ""}
`;

const RemovedIcon = styled(Icon)`
  margin-right: 5px;
  color: ${(props) => props.theme.colors.lightGrey};
`;

const ItalicText = styled.Text`
  font-style: italic;
  color: ${(props) => props.theme.colors.lightGrey};
`;

const ChatImage = ({ content, ...rest }: ImageRepresentation) => {
  return <ImageStyle source={{ uri: content }} {...rest} />;
};

const SoundMessage = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  padding: 0px 5px;
  padding: 0 20px;
  height: 40px;
  flex-grow: 0;
  ${Platform.OS === "ios" ? "padding-bottom: 0px" : ""};
`;

const SoundMessageProgressIndicator = ({
  percentage,
}: {
  percentage: number;
}) => {
  const Background = styled.View`
    flex-direction: row;
    height: 5px;
    max-height: 6px;
    border-radius: 5px;
    margin-left: 10px;
    width: 150px;
    background: ${(props) => props.theme.colors.lightGrey};
  `;

  const Indicator = styled.View<{ p: number }>`
    border-radius: 5px;
    height: 5px;
    width: ${(props) => (props.p ? props.p : 0)}%;
    background: #2e2c78;
  `;

  return (
    <Background>
      <Indicator p={percentage} />
    </Background>
  );
};

const ImageRemoved = styled.View`
  flex-direction: row;
  align-items: center;
  border: 1px solid ${(props) => props.theme.colors.lightGrey};
  padding: 60px 20px;
  border-radius: 15px;
  margin: 3px;
  margin-left: 8px;
`;

type ChatMessageItemProps = {
  messageItem: MessageItem;
  onLongPress: (msg: MessageItem) => void;
  onPress?: (msg: MessageItem) => void;
  index: number;
  messagesLength: number;
  outgoing?: boolean;
  sender: string | undefined;
};

interface AudioState {
  playing: boolean;
  progress: number;
  duration: number;
}

export const ChatMessageItem = ({
  sender,
  messageItem,
  onLongPress,
  onPress,
  index,
  messagesLength,
  outgoing = true,
}: ChatMessageItemProps) => {
  const [sound, setSound] = useState<Audio.Sound>();
  const [audio, setAudio] = useState<AudioState>({
    playing: false,
    progress: 0,
    duration: 10000,
  });
  const { message, date, type, isHidden } = messageItem;
  // TODO: this should be done in redux but for a quick test ill do it here
  const image = useImage(messageItem);
  const audioData = useAudio(messageItem);

  // Update handler for expo-av's Audio.Sound()
  const onPlaybackUpdate = (status: AVPlaybackStatus) => {
    const successStatus = status as AVPlaybackStatusSuccess;

    // if this isn't defined we have AVPlaybackStatusError as params
    if (!successStatus.positionMillis || !successStatus.durationMillis) return;
    const { positionMillis, durationMillis, didJustFinish } = successStatus;

    setAudio((state) => ({
      ...state,
      progress: positionMillis,
      duration: durationMillis,
    }));

    // if sound just finished playing, set playing to false
    if (didJustFinish) {
      setAudio((state) => ({ ...state, playing: false }));
    }
  };

  // Play / Pause audio from message
  const playPauseAudio = async () => {
    if (!audioData)
      return Alert.alert(
        "Hups!",
        "Viesti ei ole vielä ladannut kokonaan, kokeile uudestaan hetken kuluttua."
      );

    // if sound is played the first time
    if (!sound) {
      try {
        // iOS Only executes .m4a files
        // https://github.com/expo/expo/issues/10120#issuecomment-899559991
        const extension = Platform.OS === "ios" ? "m4a" : "mp3";
        const uri = `${FileSystem.cacheDirectory}/sound_msg_${messageItem.entryID}.${extension}`;
        const options = { encoding: FileSystem.EncodingType.Base64 };

        // write temp file to app's cache dir. as of now expo
        // has no other way of playing audio in base64 format
        await FileSystem.writeAsStringAsync(uri, audioData, options);

        const newSound = new Audio.Sound();
        newSound.setOnPlaybackStatusUpdate(onPlaybackUpdate);
        
        await newSound.loadAsync({ uri });

        setSound(newSound);
        setAudio((state) => ({ ...state, playing: true }));

        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
        });

        await newSound.playAsync();
        await FileSystem.deleteAsync(uri)
      } catch (error) {
        console.log("Error while initializing sound:", error);
        Alert.alert(
          "Hups!",
          "Ääniviestin toistamisessa tapahtui virhe, kokeile hetken päästä uudestaan."
        );
      }
    } else {
      // if playing, pause audio, otherwise reset or continue audio
      if (audio.playing) {
        await sound.pauseAsync();
      } else if (audio.progress === audio.duration) {
        await sound.playFromPositionAsync(0);
      } else {
        await sound.playAsync();
      }

      setAudio((state) => ({ ...state, playing: !state.playing }));
    }
  };

  // Unload sound memory spot when not defined
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : () => undefined;
  }, [sound]);

  return (
    <RanOutOfNames>
      <TouchableOpacity
        delayLongPress={300}
        // if the message is a image this press will open the large image modal
        onPress={()=>{
          if(onPress){
            onPress(messageItem);
          }
        }}
        // long press will open a message information modal
        onLongPress={() => {
          onLongPress(messageItem);
        }}
      >
        {type === "audio" && (
          <ChatMessageContainer outgoing={outgoing}>
            {!outgoing && index === 0 && (
              <Sender outgoing={outgoing}>{sender || "..."}</Sender>
            )}
            <SoundMessage>
              {isHidden ? (
                <>
                  <RemovedIcon name="circle-slash" />
                  <ItalicText>Tämä viesti on poistettu</ItalicText>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={playPauseAudio}
                    style={{ alignItems: "center", width: 25 }}
                  >
                    <FoundationIcon
                      size={25}
                      color={outgoing ? "white" : "#a1a5a8"}
                      name={audio.playing ? "pause" : "play"}
                    />
                  </TouchableOpacity>
                  <SoundMessageProgressIndicator
                    percentage={
                      audio.duration > 0
                        ? (audio.progress / audio.duration) * 100
                        : 0
                    }
                  />
                </>
              )}
            </SoundMessage>
          </ChatMessageContainer>
        )}

        {type === "image" && (
          <>
            {!outgoing && index === 0 && (
              <Sender outgoing={outgoing}>{sender || "..."}</Sender>
            )}
            {isHidden ? (
              <ImageRemoved>
                <RemovedIcon name="circle-slash" />
                <ItalicText>Tämä kuva on poistettu</ItalicText>
              </ImageRemoved>
            ) : (
              image !== undefined && <ChatImage {...image} />
            )}
          </>
        )}

        {type === "text" && (
          <ChatMessageContainer outgoing={outgoing}>
            {!outgoing && index === 0 && (
              <Sender outgoing={outgoing}>{sender || "..."}</Sender>
            )}
            <ChatMessageStyles outgoing={outgoing}>
              {isHidden ? (
                <MessageRemoved>
                  <RemovedIcon name="circle-slash" />
                  <ItalicText>Tämä viesti on poistettu</ItalicText>
                </MessageRemoved>
              ) : (
                message
              )}
            </ChatMessageStyles>
          </ChatMessageContainer>
        )}
      </TouchableOpacity>

      {index === messagesLength - 1 && (
        <ExtraInfo outgoing={outgoing}> {formatTimestamp(date)}</ExtraInfo>
      )}
    </RanOutOfNames>
  );
};

export const ChatInputImageContainer = styled(View)`
  padding-left: 13px;
  padding-right: 12px;

  margin-bottom: ${Platform.OS === "ios" ? "45px" : "15px"};
`;

// some octicons have more bottom padding than fa icons thats why the difference in chaticon and chatfaicon
export const ChatIcon = styled(Icon)<{ color?: string }>`
  padding-left: 2px;
  padding-right: 2px;
  padding-top: 12px;
  padding-bottom: 8px;
  font-size: 23px;
  font-weight: 400;
  color: ${(props) =>
    props.color ? props.color : props.theme.colors.lightGrey};
`;

export const TrashButton = (
  props: Omit<
    StyledComponentProps<
      typeof Icon,
      DefaultTheme,
      {
        color?: string | undefined;
      },
      never
    >,
    "name"
  >
) => <ChatIcon name="trash" {...props} />;

export const LargeIcon = styled(ChatIcon)`
  padding-right: 5px;
  font-size: 23px;
  padding-top: 6px;
  margin: auto;
`;

export const SpinnerContainer = styled.View`
  height: 100%;
  padding-top: 30px;
  padding-bottom: 30px;
`;

export const WhiteText = styled.Text`
  font-size: ${(props) => props.theme.sizes.smaller};
  font-weight: 500;
  color: ${(props) => props.theme.colors.white};
`;

const window = Dimensions.get("window");

export const LargeImage = ({ image }: { image: ImageRepresentation }) => {
  if (image) {
    const widthMin = Math.min(window.width, image.width);
    const widthMax = Math.max(window.width, image.width);
    const ratio = image.height / image.width;
    const height = ((widthMin * widthMax) / widthMax) * ratio;
    return (
      <Image
        source={{ uri: image.content }}
        style={{ width: widthMin, height }}
      />
    );
  } else {
    return null;
  }
};

export const LargeImageContainer = styled.View`
  height: 80%;
  display: flex;
  justify-content: center;
`;

export const ImageLoader = styled.View`
  height: 200px;
  width: 70%;
  background: ${(props) => props.theme.colors.lightGreyTransparency};
  border-radius: 15px;
  margin-top: 5.8px;
  margin-bottom: 5.8px;
  margin-left: auto;
  margin-right: 50px;
  display: flex;
  justify-content: center;
`;

export const ImageLoaderContainer = styled.View`
  height: 100%;
  width: 100%;
  display: flex;
  background-color: red;
`;
