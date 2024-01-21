import { useFocusEffect, useIsFocused } from "@react-navigation/core";
import {
  FetchNextPageOptions,
  FetchPreviousPageOptions,
  InfiniteData,
  InfiniteQueryObserverResult,
  QueryClient,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Buffer } from "buffer";
import { ImagePickerAsset } from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import bcrypt from "react-native-bcrypt";
import {
  MessageEntry,
  SoundMessage,
  client,
  fetchMessageEntries,
  postImageMessage,
  postSoundMessage,
  postTextMessage,
} from "./api";
import { useProfile, useUser, usecurrentChatID } from "./redux/hooks";
import { store } from "./redux/store"; // <-- This is the only import from redux
import { User } from "./redux/types";

// types imported from internal lib
type IChatEntry = any;
type IDataItem = any;
type IUserAsset = any;
type IProfile = any;
type Participant = any;
type ParticipantList = any;

export type MessageItem = {
  sender: string;
  date: Date;
  message?: string; // if type === "text" this has to be configured
  outgoing?: boolean;
  type: "text" | "image" | "audio";
  // TODO IDataItem is a unholy data strcutre and i would prefer that we would rewrite this data type.For example its hard to understand which imageDataItem contains thumbnail and which large | small or something
  imageDataItems?: IDataItem[]; // if you check the IDataItems.itemType you'll findout what kind of data it may hold. "imageDataItem.itemType.includes("large") === true" means that it holds a large image dataItem.
  audioDataItem?: IDataItem;
  encryptionKey?: Buffer;
  entryID: string;
  senderID: string;
  dayHasChanged?: boolean;
  isHidden?: boolean;
};

export const useServerInfo = () => {
  // https://tanstack.com/query/v4/docs/quick-start
  return useQuery(["server_info"], () => client.fetchServerInfo());
};

export const useUserData = (
  userID: string
): UseQueryResult<IUserAsset, unknown> => {
  return useQuery(
    ["user", userID],
    () => {
      return client.fetchUser(userID, "");
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
};

export const postToken = async ({ notificationToken, chatID }: postToken) => {
  const user = store.getState().user.user;
  const userID = user.id;
  const language = "FI_fi";
  return await client.createNewChatEntryNotifier({
    userID,
    chatID,
    notificationToken,
    language,
  });
};

export const sendInvitation = async (
  text: SendInvitation
): Promise<InvitationResponse> => {
  const { name, phoneNumber } = text;
  const phoneHash = bcrypt.hashSync(phoneNumber, 10);
  // const phoneHash = phoneNumber;
  return client.sendInvitation({
    name,
    phoneNumber,
    phoneHash,
  }) as Promise<InvitationResponse>;
};

export const sendGroupInvitation = async (
  text: SendInvitation
): Promise<{ data: { chat: unknown } }> => {
  const { name, phoneNumber, groupName } = text;
  const phoneHash = bcrypt.hashSync(phoneNumber, 10);
  // const phoneHash = phoneNumber;
  return client.sendGroupInvitation({
    name,
    phoneNumber,
    phoneHash,
    groupName: groupName as string,
  }) as Promise<InvitationResponse>;
};

export const singup = (phoneNumber: string) => {
  const phoneHash = bcrypt.hashSync(phoneNumber, 10);

  return client.getConfirmationCode({
    phoneNumber: phoneNumber,
    phoneHash: phoneHash,
  });
};

export const setDescription = async (descriptionURI: descriptionURI) => {
  const user = store.getState().user.user;
  const userID = user.id;
  const desc = descriptionURI.description;
  await client.updateUserProfile({
    userID,
    profile: { descriptionURI: desc },
  });
};

export const setPictureURI = async (pictureURI: string) => {
  const user = store.getState().user.user;
  const userID = user.id;
  await client.updateUserProfile({
    userID,
    profile: { pictureURI: pictureURI },
  });
};

export const updateLastSeen = async () => {
  const user = store.getState().user.user;
  const userID = user.id;
  const lastSeen = new Date();
  await client.updateUserProfile({
    userID,
    profile: { lastSeen: lastSeen.toISOString() },
  });
};

export const updateJWT = async () => {
  const user = store.getState().user.user;
  const pinLogin = user.pinLogin;
  const jwt = await client.pinLogin(pinLogin);
  return jwt;
};

export const getParticipants = async (chatID: string) => {
  const participants: { data: Participant[] } =
    (await client.fetchChatParticipants(chatID)) as { data: Participant[] };
  return participants.data;
};

export const getParticipantsList = async (chatIDs: string[]) => {
  const participantsList: ParticipantList[] = [];
  for (const chatID of chatIDs) {
    const participants: { data: Participant[] } =
      (await client.fetchChatParticipants(chatID)) as {
        data: Participant[];
      };
    const users: Participant[] = participants.data as Participant[];
    participantsList.push({
      participants: users,
      chatID: chatID,
    });
  }

  return participantsList;
};

export const verify = async (confirmationNumber: string) => {
  // https://tanstack.com/query/v4/docs/quick-start
  const user = store.getState().user.user;

  const phoneNumber = user.phoneNumber;
  const pinCred = await client.verify({
    verificationCode: confirmationNumber,
    phoneNumber: phoneNumber,
    password: phoneNumber,
    PIN: "PIN-1234",
  });
  const jwt = await client.pinLogin(pinCred);
  return { pinCred, jwt };
};

type InfiniteChatQuery = {
  entries: MessageEntry[];
  after?: Date;
  before?: Before;
};

type MessagesDataState = {
  updatedAt: string;
  isLoading: boolean;
  messages: MessageGroup[];
};

interface CurrrentChatMessages extends MessagesDataState {
  fetchPerviousMessages: (
    options?: FetchPreviousPageOptions | undefined
  ) => Promise<InfiniteQueryObserverResult<InfiniteChatQuery, unknown>>;
  fetchIncomingMessages: (
    options?: FetchNextPageOptions | undefined
  ) => Promise<InfiniteQueryObserverResult<InfiniteChatQuery, unknown>>;
  isError: boolean;
  fetchError: null | Error;
}

/**
 *
 * @param before
 * @param after
 * @returns
 */

export const getChats = async () => {
  const chats = await client.fetchChatList("chat_viewer");
  return chats;
};

export const entrySeen = async (entryID: string, chatID: string) => {
  await client.markEntrySeen(chatID, entryID);
};

export const fetchChatEntryState = async (entryID: string, chatID: string) => {
  const entryState = await client.fetchChatEntryState(
    chatID,
    entryID,
    "seen_by"
  );
  return entryState;
};

// custom type for react query errors
type ErrorType = null | Error;

export const useCurrentChatMessages = (
  before: Before = "LATEST",
  after: Date = new Date(2000, 0, 1)
): CurrrentChatMessages => {
  // Triggers rerender even if the data does not change
  // potentially because of lack of memoization

  // this should be unit tested but there is currently no time to write a unit test for this
  const [messages, setMessages] = useState<MessagesDataState>({
    updatedAt: new Date().toISOString(),
    isLoading: true,
    messages: [],
  });
  const screenFocus = useIsFocused();
  const firstTimeRef = useRef(true);
  const chatId = usecurrentChatID();
  const user = useUser();
  const profile = useProfile();
  const queryClient = useQueryClient();
  const {
    data: entryPages, // current data in the query state
    // status,
    // isLoading,
    fetchNextPage, // fetches new messages
    fetchPreviousPage, //fetches old messages
    refetch,
    isError,
    error: fetchError,
  } = useInfiniteQuery<InfiniteChatQuery>(
    ["chatEntries", chatId],
    async ({ pageParam = { after, before } }) => {
      const entries = await fetchMessageEntries(
        chatId,
        pageParam.before,
        pageParam.after
      );
      return {
        entries,
        before: pageParam.before,
        after: pageParam.after,
      };
    },
    {
      keepPreviousData: true,
      getNextPageParam: (_, allEntries): { before: Before; after: Date } => {
        // find the last time entries were found in a refetch and fetch with variable 'after: lastResultFound.before'

        // TODO optimize sort filter map mess
        const sorted = allEntries
          .filter(
            (item) =>
              item.entries.length > 0 &&
              !!item.before &&
              item.before !== "LATEST"
          )
          .sort(
            (entry: InfiniteChatQuery, compare: InfiniteChatQuery) =>
              (compare.before as Date)?.getTime() -
              (entry.before as Date)?.getTime()
          );

        if (
          sorted.length > 0 &&
          !!sorted[0] &&
          !!sorted[0].before &&
          typeof sorted[0].before !== "string"
        ) {
          // add one millisecond because otherwise the backend does not return duplicate result
          return {
            after: new Date(sorted[0].before.getTime() + 1),
            before: "LATEST",
          };
        } else {
          return {
            after,
            before,
          };
        }
      },
      getPreviousPageParam: (_, allEntries) => {
        // TODO if there  is no previous item do not fetch
        const entries: IChatEntry[] = allEntries.flatMap(
          (item) => item.entries
        );
        const sorted = entries
          // sort by oldest entries
          .sort(
            (entry: IChatEntry, compare: IChatEntry) =>
              new Date(entry.timestamp).getTime() -
              new Date(compare.timestamp).getTime()
          );
        if (sorted.length > 0 && !!sorted[0]) {
          return {
            before: new Date(new Date(sorted[0].timestamp).getTime() - 1),
            after,
          };
        }
      },
      retry: 2,
      retryDelay: 150,
    }
  );
  // fetch new messages if the user comes back to the chat after unfocusing this chat
  useEffect(() => {
    // if (profile.name?.includes("Joonas")) {
    //   console.log(`fetch new chat entries\n
    //     - chatId: ${chatId}\n
    //     - now: ${new Date()}\n
    //     - before: ${"LATEST"}
    //     - profile: ${profile.name}
    //   `);
    // }
    fetchNextPage();
  }, [screenFocus]);

  // fetch new messages with the given interval
  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => {
        fetchNextPage();
      }, 2000);
      return () => {
        clearInterval(interval);
      };
    }, [screenFocus])
  );

  // this hook will never unmount because react-navigation does not remount components.
  // it just switches focus. So this is the correct way to handle focus switching.
  // The reason this useEffect hook was implemented is that when user switches
  // conversation screen it clears the messages from the current screen so that the user
  // will see the correct messsages in the correct chat
  useEffect(() => {
    if (!screenFocus) {
      setMessages({
        updatedAt: new Date().toISOString(),
        isLoading: true,
        messages: [],
      });
      firstTimeRef.current = true;
    }
  }, [screenFocus]);

  useEffect(() => {
    const entries: { [entryId: string]: IChatEntry } = {};
    entryPages?.pages.map((ent) => {
      ent.entries.map((entry) => {
        entries[entry.entryID] = entry;
      });
    });
    if (screenFocus && Object.keys(entries).length > 0) {
      formMessages(queryClient, chatId, user, profile).then((messages) => {
        if (messages) {
          setMessages({
            isLoading: false,
            updatedAt: new Date().toISOString(),
            messages: messages,
          });
        }
      });
    } else {
      setMessages({
        isLoading: false,
        updatedAt: new Date().toISOString(),
        messages: [],
      });
    }
  }, [
    JSON.stringify(
      entryPages?.pages.flatMap((item) => item.entries.map((k) => k.entryID))
    ),
  ]);

  return {
    ...messages,
    fetchPerviousMessages: fetchPreviousPage,
    fetchIncomingMessages: fetchNextPage,
    isError,
    fetchError: fetchError as ErrorType,
  };
};

// array map helper to check day changes
// (requires the array to be sorted by date first)
const groupByDate = (
  message: MessageItem,
  index: number,
  array: MessageItem[]
) => {
  const previous = index > 0 ? array[index - 1] : null;

  // If there is previous message
  if (previous) {
    // initially set flag to false
    message.dayHasChanged = false;

    // if d-o-t-m has changed
    if (previous.date.getDate() > message.date.getDate()) {
      message.dayHasChanged = true;
    }

    // if month has changed
    if (previous.date.getMonth() !== message.date.getMonth()) {
      message.dayHasChanged = true;
    }

    // if year has changed
    if (previous.date.getFullYear() !== message.date.getFullYear()) {
      message.dayHasChanged = true;
    }
  } else {
    // show date on first message regardless
    // message.dayHasChanged = true;
    message.dayHasChanged = false;
  }

  return message;
};

// TODO: some parts of this function must be memoized to get improved user experience
const formMessages = async (
  queryClient: QueryClient,
  chatId: string,
  user: User,
  profile: IProfile
): Promise<MessageGroup[] | undefined> => {
  const queryData = queryClient.getQueryData<InfiniteData<InfiniteChatQuery>>([
    "chatEntries",
    chatId,
  ]);

  // if query data or pages wasn't found
  if (!queryData || !queryData.pages) return;

  // map over pages or smt idk...
  const localEntries: { [entryId: string]: MessageEntry } = {};
  queryData.pages.map((ent) => {
    ent.entries.map((entry) => {
      localEntries[entry.entryID] = entry;
    });
  });

  // check that localEntries exists
  const localEntryValues = Object.values(localEntries);
  if (!localEntries && localEntryValues.length === 0)
    throw new Error("Invalid localEntries object!");

  // merge blocks and data to entries to form a complete set of messages
  const messagePromises = localEntryValues.map<
    Promise<(MessageItem | undefined)[]>
  >(async (entry: MessageEntry) => {
    // Hidden messages have no encryption secret
    // so only use this on everything other
    let encKey = Buffer.from([]);
    if (entry.encryptionSecret !== "") {
      // derive encryption key using secret
      encKey = new Buffer("this value comes from the internal lib");
    }

    //
    const entryPromises = entry.dataItems.map(
      async (dataEntry): Promise<MessageItem | undefined> => {
        // Check if dataEntry has no items
        if (!dataEntry || !dataEntry.items || dataEntry.items.length < 0)
          throw new Error("Trying to process empty dataEntry");

        let imageMessageItem: undefined | MessageItem;
        for (const dataEntryItem of dataEntry.items) {
          // idk why this needs to be checked...
          if (dataEntryItem.blockURIs.length < 0)
            throw new Error("Unexpected error occured");

          // double check that the first block uri contains also text.
          // In the case of text there usually is just one blockURI which
          // contains the text message
          if (dataEntryItem.itemType === "text") {
            for (const blockUri of dataEntryItem.blockURIs) {
              // check if no encryption key were provided
              if (entry.encryptionSecret.length === 0) {
                return {
                  sender: user.id === entry.senderID ? profile.name : "...",
                  date: new Date(entry.timestamp),
                  message: "MESSAGE_REMOVED",
                  isHidden: true,
                  outgoing: user.id === entry.senderID,
                  senderID: entry.senderID,
                  entryID: entry.entryID,
                  type: "text",
                } as MessageItem;
              }

              // double check that the data entry item contains text
              if (
                blockUri.startsWith("data:") &&
                dataEntryItem.itemType === "text"
              ) {
                // decrypt text message
                const decrypted = new Buffer(
                  "this value comes from the internal lib"
                ).toString();
                if (
                  !decrypted &&
                  !decrypted.startsWith("data:text/plain;charset=UTF-8;base64,")
                ) {
                  throw new Error("unuspported data type in decrypted message");
                }
                let text = decrypted.substring(
                  "data:text/plain;charset=UTF-8;base64,".length
                );
                text = Buffer.from(text, "base64").toString("utf-8");
                // in the case of text there is only on blockURI which holds all the important information
                // return the full MessageItem
                return {
                  sender: user.id === entry.senderID ? profile.name : "...",
                  date: new Date(entry.timestamp),
                  message: text,
                  outgoing: user.id === entry.senderID,
                  senderID: entry.senderID,
                  entryID: entry.entryID,
                  type: "text",
                } as MessageItem;
              }
            }
          } else if (dataEntryItem.itemType.includes("image")) {
            // check if no encryption key were provided
            if (entry.encryptionSecret.length === 0) {
              return {
                sender:
                  user.id === entry.senderID ? (profile.name as string) : "...",
                date: new Date(entry.timestamp),
                outgoing: user.id === entry.senderID,
                senderID: entry.senderID,
                entryID: entry.entryID,
                type: "image",
                isHidden: true,
                imageDataItems: [],
                encryptionKey: encKey,
              };
            }

            // handle the image message.
            // image message contains three different dataEntryItems: large,small and thumbnail.
            // we have to group all of these different dataEntryItems to form a one complete MessageItem.
            if (!imageMessageItem) {
              imageMessageItem = {
                sender:
                  user.id === entry.senderID ? (profile.name as string) : "...",
                date: new Date(entry.timestamp),
                outgoing: user.id === entry.senderID,
                senderID: entry.senderID,
                entryID: entry.entryID,
                type: "image",
                imageDataItems: [dataEntryItem],
                encryptionKey: encKey,
              };
            } else if (
              imageMessageItem.imageDataItems &&
              imageMessageItem.imageDataItems?.length > 0
            ) {
              imageMessageItem.imageDataItems.push(dataEntryItem);
            } else {
              throw new Error(
                "This should never happen. There should always be a imageMessageItem.imageDataItems if there is a imageMessageItem defined."
              );
            }
          } else if (dataEntryItem.itemType === "audio") {
            // check if no encryption key were provided
            if (entry.encryptionSecret.length === 0) {
              return {
                sender:
                  user.id === entry.senderID ? (profile.name as string) : "...",
                date: new Date(entry.timestamp),
                outgoing: user.id === entry.senderID,
                senderID: entry.senderID,
                entryID: entry.entryID,
                type: "audio",
                audioDataItem: dataEntryItem,
                encryptionKey: encKey,
                isHidden: true,
              };
            }

            // handle sound message
            return {
              sender:
                user.id === entry.senderID ? (profile.name as string) : "...",
              date: new Date(entry.timestamp),
              outgoing: user.id === entry.senderID,
              senderID: entry.senderID,
              entryID: entry.entryID,
              type: "audio",
              audioDataItem: dataEntryItem,
              encryptionKey: encKey,
            };
          }
        }
        if (imageMessageItem !== undefined) {
          return imageMessageItem;
        }
        return undefined;

        // throw new Error("dataEntryItem should not be null");
      }
    );

    return await Promise.all(entryPromises);
  });

  const results = await Promise.all(messagePromises);
  const messages = results
    .flat()
    .filter((item): item is MessageItem => item !== undefined)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map(groupByDate);

  // if there are messages, group them by sender
  let groupByUser: MessageGroup[] = [];
  if (messages.length !== 0) {
    // if there is only one message, the reduce function wont work
    if (messages.length === 1) {
      groupByUser.push({
        [messages[0].senderID]: [messages[0]],
      });
    } else {
      // TODO: clean reduce function its a mess
      messages.reduce((prev: MessageItem, cur: MessageItem) => {
        if (groupByUser.length === 0) {
          if (prev.senderID === cur.senderID) {
            groupByUser.push({ [cur.senderID]: [prev, cur] });
          } else {
            groupByUser.push(
              { [prev.senderID]: [prev] },
              { [cur.senderID]: [cur] }
            );
          }
        } else {
          // if sender is same between two messages
          if (prev.senderID === cur.senderID) {
            // append to the group
            groupByUser[groupByUser.length - 1][cur.senderID] = [
              ...groupByUser[groupByUser.length - 1][cur.senderID],
              cur,
            ];
          } else {
            // push the group to array
            groupByUser.push({ [cur.senderID]: [cur] });
          }
        }

        return cur;
      });
    }

    groupByUser = groupByUser.map((item) => {
      const objs: MessageGroup = {};
      Object.keys(item).map((key) => {
        objs[key] = item[key].sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        );
      });
      return objs;
    });

    return groupByUser;
  }
};

export const removeNotification = async (userID: string) => {
  return await client.removeNotifications(userID);
};

export const getJWT = async () => {
  const user = store.getState().user.user;
  const userToken = user.pinLogin;
  return await client.pinLogin(userToken);
};

const emailLogin = async (obj: emailLogin) => {
  const { email, password, pin } = obj;
  const contactURI = "mailto:" + email;
  // TODO: Implement PIN
  const pinCred = await client.passwordLogin({
    contactURI: contactURI,
    password: password,
    PIN: pin ? pin : "PIN-1234",
  });
  //Store cookie here
  const jwt = await client.pinLogin(pinCred);
  return { pinCred, jwt };
};

export const usePostTextMessage = () => {
  // post a chat message to the server and if the post responds with success add the message to the entries.
  const chatId = usecurrentChatID();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: TextMessagePost) =>
      postTextMessage(chatId, message),
    onSuccess: (newItem) => {
      // set the newly created message to the message entires so that it will appear in the chat
      queryClient.setQueryData<InfiniteData<InfiniteChatQuery>>(
        ["chatEntries", newItem.chatID],
        (data) =>
          // if this is the first message in the chat
          data
            ? {
                pages: [...data.pages, { entries: [newItem] }],
                pageParams: data.pageParams,
              }
            : {
                pages: [{ entries: [newItem] }],
                pageParams: [],
              }
      );
    },
  });
};

export type ImageMessagePost = {
  senderId: string;
  date: Date;
  media: ImagePickerAsset;
};

export const usePostImageMessage = () => {
  // post a chat message to the server and if the post responds with success add the message to the entries.
  const chatId = usecurrentChatID();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: ImageMessagePost) =>
      postImageMessage(chatId, message),
    onSuccess: (newItem) => {
      // set the newly created message to the message entires so that it will appear in the chat
      queryClient.setQueryData<InfiniteData<InfiniteChatQuery>>(
        ["chatEntries", newItem.chatID],
        (data) =>
          // if this is the first message in the chat
          data
            ? {
                pages: [...data.pages, { entries: [newItem] }],
                pageParams: data.pageParams,
              }
            : {
                pages: [{ entries: [newItem] }],
                pageParams: [],
              }
      );
    },
  });
};

// Hook for posting an sound message
export const usePostSoundMessage = () => {
  // post a chat message to the server and if the post
  // responds with success, add the message to the entries.
  const chatId = usecurrentChatID();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: SoundMessage) => postSoundMessage(chatId, message),
    onSuccess: (newItem: any) => {
      // set the newly created message to the message entires so that it will appear in the chat
      queryClient.setQueryData<InfiniteData<InfiniteChatQuery>>(
        ["chatEntries", newItem.chatID],
        (data) =>
          // if this is the first message in the chat
          data
            ? {
                pages: [...data.pages, { entries: [newItem] }],
                pageParams: data.pageParams,
              }
            : {
                pages: [{ entries: [newItem] }],
                pageParams: [],
              }
      );
    },
  });
};

export const useEmailLogin = () => {
  return useMutation({
    mutationFn: async (text: emailLogin) => emailLogin(text),
  });
};

export const useSendInvitation = () => {
  return useMutation({
    mutationFn: async (text: SendInvitation) => sendInvitation(text),
  });
};

export const useSendGroupInvitation = () => {
  return useMutation({
    mutationFn: async (text: SendInvitation) => sendGroupInvitation(text),
  });
};

export const updateProfileDescription = () => {
  return useMutation({
    mutationFn: async (text: descriptionURI) => setDescription(text),
  });
};
export const updateProfileAvatar = () => {
  return useMutation({
    mutationFn: async (text: string) => setPictureURI(text),
  });
};
export const usePostToken = () => {
  return useMutation({
    mutationFn: async (text: postToken) => postToken(text),
  });
};

export const useGetParticipants = () => {
  return useMutation({
    mutationFn: async (text: string) => getParticipants(text),
  });
};

export const useGetParticipantsList = () => {
  return useMutation({
    mutationFn: async (text: string[]) => getParticipantsList(text),
  });
};

export const useRemoveNotification = () => {
  return useMutation({
    mutationFn: async (text: string) => removeNotification(text),
  });
};
