import { Buffer } from "buffer";
import { SaveFormat } from "expo-image-manipulator";
import { useEffect, useState } from "react";
import { fetchDataBlockQuery } from "./api";
import { ImageUtils } from "./imageUtils";

// functions below act as stubs for the real
// methods using an internal lib
const EntryCipher: any = {};
const compress = (_: any) => new Buffer("");
const uncompress = (_: any) => new Buffer("");

// Types (from internal lib)
import { MessageItem } from "./queries";
type EntryItem = any;
type IDataItem = any;
type OnervaIMClient = any;

export function parseKeyValue(dataURI: string, key: string) {
  const n = (";" + key + "=").length;
  const beg = dataURI.indexOf(";" + key + "=");
  if (beg < 0) return null;
  const end = dataURI.indexOf(";", beg + n);
  if (end < 0) return null;
  return dataURI.substring(beg + n, end);
}
type ThumbnailItem = {
  itemID: string;
  itemType: string;
  blockURIs: string[];
};

type ImageTypes = "thumbnail" | "small" | "large";
/**
 * Create a thumbnail item of a image to the database.
 * 1. Resize
 * 2. Encrypt
 * 3. Return
 *
 * @param orig
 * @param encKey
 * @param maxSize
 * @param imageType
 * @returns
 */
export async function createThumbnailItem(
  orig: {
    itemID: string;
    itemType: string;
    dataURI: string; // base64 representation of the image
  },
  encKey: Buffer,
  maxSize: number,
  imageType: ImageTypes = "thumbnail"
): Promise<ThumbnailItem> {
  const origWidth = parseInt("" + parseKeyValue(orig.itemType, "width"));
  const origHeight = parseInt("" + parseKeyValue(orig.itemType, "height"));
  if (isNaN(origWidth) || isNaN(origHeight)) {
    return {
      itemID: orig.itemID + "/image/" + imageType,
      itemType: "invalid",
      blockURIs: [],
    };
  }
  const maxDim = Math.max(origWidth, origHeight);
  const newWidth = (origWidth * maxSize) / maxDim;
  const newHeight = (origHeight * maxSize) / maxDim;
  const dataURI = await ImageUtils.createResizedImageDataURI(
    orig.dataURI,
    newWidth,
    newHeight,
    SaveFormat.PNG,
    1
  );
  const encData = await EntryCipher.encrypt(
    encKey,
    Buffer.from(dataURI, "utf-8"),
    "secure"
  );
  return {
    itemID: orig.itemID + "/image/" + imageType,
    itemType:
      "image:" +
      imageType +
      ";width=" +
      newWidth +
      ";height=" +
      newHeight +
      ";",
    blockURIs: [encData],
  };
}

interface DecompressedDataItem extends Omit<IDataItem, "blockURIs"> {
  base64Content: string;
}

//----------------------------------------------------------------
export async function createImageItem(
  orig: {
    itemID: string;
    itemType: string;
    dataURI: string;
  },
  encKey: Buffer,
  imageType: string,
  maxSize: number,
  client: OnervaIMClient,
  quality: number = 0.8
): Promise<ThumbnailItem> {
  // disabled because of jimp
  const origWidth = parseInt("" + parseKeyValue(orig.itemType, "width"));
  const origHeight = parseInt("" + parseKeyValue(orig.itemType, "height"));

  // if no origin dimensions are provided
  // mark the item as invalid
  if (isNaN(origWidth) || isNaN(origHeight)) {
    return {
      itemID: orig.itemID + "/image/" + imageType,
      itemType: "invalid",
      blockURIs: [],
    };
  }

  const maxDim = Math.max(origWidth, origHeight);
  const newWidth = (origWidth * maxSize) / maxDim;
  const newHeight = (origHeight * maxSize) / maxDim;

  const dataURI = await ImageUtils.createResizedImageDataURI(
    orig.dataURI,
    newWidth,
    newHeight,
    SaveFormat.JPEG,
    quality
  );

  const data = Buffer.from(dataURI, "utf-8");
  const dataBlocks: Buffer[] = [];
  let offset = 0;
  const blockSize = 64 * 1024; // 64kB
  for (; offset < data.length; offset += blockSize) {
    const origData = data.slice(
      offset,
      Math.min(offset + blockSize, data.length)
    );
    const encData: string = await EntryCipher.encrypt(
      encKey,
      origData,
      "secure"
    );
    dataBlocks.push(Buffer.from(encData, "utf-8"));
  }

  const blockURIs: string[] = [];
  for (const dataBlock of dataBlocks) {
    const compressed: Buffer = await compress(dataBlock);
    const block = await client.createNewDataBlock(compressed);

    blockURIs.push("/blocks/" + block.blockID);
  }

  const returnedItem = {
    itemID: orig.itemID + "/image/" + imageType,
    itemType:
      "image:" +
      imageType +
      ";width=" +
      newWidth +
      ";height=" +
      newHeight +
      ";",
    blockURIs: blockURIs,
  };

  return returnedItem;
}

interface SoundMessageItem {
  itemID: string;
  itemType: string;
  blockURIs: string[];
}
// Create sound message item
export async function createSoundMessageItem(
  originalEntryItem: EntryItem,
  encryptionKey: Buffer,
  client: OnervaIMClient,
  base64: string
): Promise<SoundMessageItem> {
  // Declare useful variables for block slicing
  const data = Buffer.from(base64, "utf-8");
  const blockSize = 64 * 1024; // 64kB
  const dataBlockEntries: Buffer[] = [];

  // Slice data buffer to data block entries
  for (let offset = 0; offset < data.length; offset += blockSize) {
    const blockEnd = Math.min(offset + blockSize, data.length);
    const originalData = data.slice(offset, blockEnd);
    const newData = await EntryCipher.encrypt(
      encryptionKey,
      originalData,
      "secure"
    );
    const newBuffer = Buffer.from(newData, "utf-8");

    // Push to buffer array
    dataBlockEntries.push(newBuffer);
  }

  // Store final block URI's here
  const blockURIs: string[] = [];

  // Create data blocks from entries
  for (const blockEntry of dataBlockEntries) {
    const compressed = await compress(blockEntry);
    const block = await client.createNewDataBlock(compressed);

    blockURIs.push("/blocks/" + block.blockID);
  }

  const returnedItem = {
    itemID: `${originalEntryItem.itemID}/audio`,
    itemType: "audio",
    blockURIs,
  };

  return returnedItem;
}

// Decrypt sound message item
export async function decryptSoundMessageItem(
  dataItem: IDataItem,
  encryptionKey: Buffer
): Promise<DecompressedDataItem> {
  // map through block uri's
  const blocks = dataItem.blockURIs.map(async (blockUri: any) => {
    // decrypt sound message
    if (blockUri.startsWith("/blocks")) {
      // blockURIs are blockIDs which will be used to fetch the data-block data
      const compressedBlock = await fetchDataBlockQuery(blockUri);
      const cryptedBlock = await uncompress(compressedBlock);
      const decrypted = await EntryCipher.decrypt(
        encryptionKey,
        cryptedBlock.toString("utf-8")
      );

      return decrypted;
    } else {
      throw new Error("Unexpected block type while processing blockURIs");
    }
  });

  // await all promises
  const finishedBlocks = await Promise.all(blocks);

  return {
    itemID: dataItem.itemID,
    itemType: dataItem.itemType,
    base64Content: Buffer.concat(finishedBlocks).toString("utf-8"),
  };
}

/**
 * Kinda reverses the function createThumbnailItem and createImageItem
 *
 * Decodes and decrypts the contents of blockURIs and returns it as a base64 string
 *
 * blockURIs contain the encrypted pieces of a certain image OR a blocks/{ID} that has to be fetched with fetchDataBlocks
 *
 * @param dataItem
 * @param encryptionKey key that unlocks the data in blockURIs.
 */
export async function decryptImageItem(
  dataItem: IDataItem,
  encryptionKey: Buffer
): Promise<DecompressedDataItem> {
  // list of decrypted block data
  const blocks = dataItem.blockURIs.map(async (blockUri: any) => {
    if (blockUri.startsWith("/blocks")) {
      // decrypt standard image
      // blockURIs are blockIDs which will be used to fetch the datablock data
      const compressedBlock = await fetchDataBlockQuery(blockUri);
      const cryptedBlock = await uncompress(compressedBlock);
      return await EntryCipher.decrypt(
        encryptionKey,
        cryptedBlock.toString("utf-8")
      );
    } else if (dataItem.itemID.includes("thumbnail")) {
      // because id's will also show what type of data the current block is holding
      // decrypt thumbnail image.
      // thumbnail images are stored in the blockURI itelf
      return await EntryCipher.decrypt(encryptionKey, blockUri);
      // return the thumnbnail item
      // return
    } else {
      throw new Error("Unexpected block type while processing blockURIs");
    }
  });

  return {
    itemID: dataItem.itemID,
    itemType: dataItem.itemType,
    base64Content: Buffer.concat(await Promise.all(blocks)).toString("utf-8"),
  };
}
// weird name because image item was taken.
export type ImageRepresentation = {
  content: string; // URI base64 representation of the image. Example: data:image/png;base64,==BASE64content
  width: number;
  height: number;
};

/**
 * returns the small image as base64 string
 *
 * if the msg is undefined this functions returns null.
 *
 * @param msg
 * @returns
 */
export const useImage = (
  msg: MessageItem | undefined,
  imageType: ImageTypes = "small"
): undefined | ImageRepresentation => {
  const [imageContent, setImage] = useState<undefined | ImageRepresentation>();
  const imageItem = msg?.imageDataItems?.find((val) =>
    val.itemType.startsWith(`image:${imageType}`)
  );

  // Lazy-load image
  useEffect(() => {
    // if data is already set or encryption key won't exist
    if (imageContent || !msg?.encryptionKey || imageItem === undefined) return;

    decryptImageItem(imageItem, msg.encryptionKey as Buffer).then((image) => {
      return setImage({
        width: parseInt(parseKeyValue(imageItem.itemType, "width") || "200"),
        height: parseInt(parseKeyValue(imageItem.itemType, "height") || "150"),
        content: image.base64Content,
      });
    });

    return () => {
      return;
    };
  }, [msg === undefined, msg?.type, msg?.isHidden, imageItem === undefined]);

  if (msg === undefined) return undefined;
  // if type doesn't match (so we can use this function always)
  if (msg.type !== "image") return undefined;
  // if message is deleted (does not have encKey)
  if (msg.isHidden) return undefined;
  // if image item was not found from data
  if (imageItem === undefined) return undefined;

  return imageContent;
};

// Returns the audio as a base64 string
export const useAudio = (message: MessageItem) => {
  const { audioDataItem, encryptionKey } = message;
  const [audioData, setAudioData] = useState<string>();

  // Lazy load audio
  useEffect(() => {
    // if data is already set or required values won't exist
    if (audioData || !audioDataItem || !encryptionKey) return;

    decryptSoundMessageItem(audioDataItem, encryptionKey).then((audio) =>
      setAudioData(audio.base64Content)
    );
  }, [audioDataItem, encryptionKey]);

  // if type doesn't match (so we can use this function always)
  if (message.type !== "audio") return undefined;
  // if message is deleted (does not have encKey)
  if (message.isHidden) return undefined;

  return audioData;
};

export function parseJwt<T>(token: string): T {
  const parts = token
    .split(".")
    .map((part) =>
      Buffer.from(
        part.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      ).toString()
    );
  return JSON.parse(parts[1]);
}

// Format date for date indicator between messages
export const formatDateIndicator = (date: Date) => {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

/**
 * Format the given date to dd.mm.yyyy
 */
export function formatDate(date: string | Date): string {
  if (date) {
    const d = typeof date === "string" ? new Date(date) : date;
    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear();

    if (day && month && year) {
      return `${day}.${month + 1}.${year}`;
    }
  }
  return "";
}

/**
 * Format the given date string to HH:MM
 */
export function formatTimestamp(date: string | Date): string {
  if (date) {
    const d = typeof date === "string" ? new Date(date) : date;
    // because newDate().getMinutes() 19:04 => 4 as a string
    const minutes: number = d.getMinutes();
    if (minutes < 10) {
      return `${d.getHours()}:0${d.getMinutes()}`;
    }
    return `${d.getHours()}:${d.getMinutes()}`;
  }
  return "";
}

/**
 * Format the given date string to dd.mm HH:MM
 */
export function formatTime(date: string | Date): string {
  if (date) {
    const d = typeof date === "string" ? new Date(date) : date;
    const day = d.getDate();
    const month = d.getMonth();
    const minutes: number = d.getMinutes();

    if (minutes < 10) {
      return `${day}.${month + 1} ${d.getHours()}:0${d.getMinutes()}`;
    }
    return `${day}.${month + 1} ${d.getHours()}:${d.getMinutes()}`;
  }
  return "";
}

export function validatePhoneNumber(phone: string): boolean {
  const reg = new RegExp(
    /\+\d\d?\d?\s?[0123456789]\s?[0123456789]\s?[0123456789]\s?[0123456789]\s?[0123456789]\s?[0123456789]\s?[0123456789]?\s?[0123456789]?\s?[0123456789]?\s?[0123456789]?\s?[0123456789]?\s?[0123456789]?$/,
    "gm"
  );
  return reg.test(phone);
}

// Format milliseconds to minutes and seconds
export const formatMillis = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);

  return minutes + ":" + (parseFloat(seconds) < 10 ? "0" : "") + seconds;
};
