type ChatItem = {
  chatID: string;
  chatType: string;
  name?: string;
  pictureURI?: string;
  participants?: Participant[];
  hasunread?: boolean;
};

type Participant = {
  descriptionURI?: string;
  lastSeen?: string;
  name?: string;
  pictureURI?: string;
  profileID?: string;
};
type ParticipantList = {
  chatID: string;
  participants: Participant[];
};

type TextMessagePost = {
  senderId: string;
  date: Date;
  message: string;
};

type SavedPinLogin = {
  PIN: string;
  email: string;
  userToken: string;
  cookie?: string;
  name?: string;
  ID: string;
};

type Profile = {
  avatarUri?: string;
  avatar?: string;
  name?: string;
  lastSeen?: string;
};

type emailLogin = {
  email: string;
  password: string;
  pin?: string;
};

type SendInvitation = {
  name: string;
  phoneNumber: string;
  groupName?: string;
};

type InvitationResponse = {
  data: { chat: unknown };
};

type descriptionURI = {
  description: string;
};

type postToken = {
  notificationToken: NotificationsToken;
  chatID: string;
};

type NotificationsToken = {
  tokenType: string;
  tokenPayload: string;
};

type JwtPayload = {
  senderID: string;
  iat: number;
  exp: number;
};

type MessageGroup = {
  [senderID: string]: MessageItem[];
};

type Before = "LATEST" | Date;
// TODO Varmista laurilta, että näm on DataItemTypes
type DataItemTypes =
  | "system"
  | "text"
  | "image:thumbnail"
  | "image:small"
  | "image:large";

type EntryItem = {
  itemID: string;
  itemType: string;
  dataURI: string;
};

type SeenBy = {
  name: string;
  seenAt: string;
  userID: string;
};

type Avatar = {
  avatar: number;
  picture_index: number;
  picture: string;
};
