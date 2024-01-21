import { Buffer } from "buffer";
import { Image } from "react-native";
import { ImageMessagePost } from "./queries";

// types imported from internal lib
type IChatEntry = any;
type IDataItem = any;

export interface MessageEntry extends IChatEntry {
  dataItems: DataItems[];
}

type DataItems = {
  dataID: string;
  timestamp: string;
  items: IDataItem[];
};

// functions below act as stubs for the real api calls
// using an internal lib
export const client: any = {};

export const fetchMessageEntries = async (
  chatId: string,
  before: Before = "LATEST",
  after: Date = new Date(2000, 0, 1)
): Promise<MessageEntry[]> => {
  return new Promise((resolve) => resolve([]));
};

export const fetchChatLastSeen = (
  chatId: string,
  after: Date = new Date(2000, 0, 1)
) => {
  return {};
};

export const fetchChatEntry = (
  chatID: string,
  entryID: string
): Promise<IChatEntry[]> => {
  return new Promise((resolve) => resolve([]));
};

export const fetchDataEntryQuery = (dataURI: string): Promise<DataItems> => {
  return new Promise((resolve) => resolve({} as DataItems));
};

export const fetchDataBlockQuery = (blockUri: string): Promise<Buffer> => {
  return new Promise((resolve) => resolve(new Buffer("")));
};

export const postTextMessage = async (
  chatId: string,
  message: TextMessagePost
): Promise<MessageEntry> => {
  return new Promise((resolve) => resolve({} as MessageEntry));
};

// get dimensions using react native's image class
// https://stackoverflow.com/a/71815855
const getDimensions = async (
  uri: string
): Promise<{ height: number; width: number }> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => {
        return resolve({ height, width });
      },
      reject
    );
  });
};

export const postImageMessage = async (
  chatId: string,
  { date, media }: ImageMessagePost
): Promise<MessageEntry> => {
  return new Promise((resolve) => resolve({} as MessageEntry));
};

export interface SoundMessage {
  senderId: string;
  date: Date;
  base64: string;
}

// Post a new sound message
export const postSoundMessage = async (
  chatID: string,
  message: SoundMessage
) => {
  return {};
};

export interface RemoveConversationResponse {
  removedChatId: string;
}

export const removeConversation = async (
  chatId: string
): Promise<RemoveConversationResponse | Error> => {
  return { removedChatId: chatId };
};

export interface RemoveMessageResponse {
  chatId: string;
  removedEntryId: string;
}

export const removeMessage = async (
  chatId: string,
  entryId: string
): Promise<RemoveMessageResponse | Error> => {
  return { chatId, removedEntryId: entryId };
};
