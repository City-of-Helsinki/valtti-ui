import { Alert } from "react-native";

import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
// import CameraRoll from '@react-native-community/cameraroll';

import { SaveFormat } from "expo-image-manipulator";

// first part of the image uri, this should be always used when we are using a image uri
export const IMAGE_URI_TYPE = "data:image/jpeg;base64,";

//----------------------------------------------------------------
export class ImageUtils {
  //----------------------------------------------------------------
  static async createResizedImageDataURI(
    dataURI: string,
    newWidth: number,
    newHeight: number,
    type: SaveFormat,
    quality: number
  ) {
    const image = await ImageManipulator.manipulateAsync(
      dataURI,
      [{ resize: { width: newWidth, height: newHeight } }],
      {
        compress: quality,
        format: type,
      }
    );

    const base64 = await FileSystem.readAsStringAsync(image.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return IMAGE_URI_TYPE + base64;
  }

  //----------------------------------------------------------------
  static async createResizedImage(
    dataURI: string,
    newWidth: number,
    newHeight: number,
    type: SaveFormat,
    quality: number,
    rotation?: number
  ) {
    const deg = rotation ? rotation : 0;
    const image = await ImageManipulator.manipulateAsync(
      dataURI,
      [{ resize: { width: newWidth, height: newHeight } }],
      {
        compress: quality,
        format: type,
      }
    );

    const base64 = await FileSystem.readAsStringAsync(image.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return { image, base64: IMAGE_URI_TYPE + base64 };
  }

  //----------------------------------------------------------------
  static async saveImageToCameraRoll(
    entryID: string,
    dataURI: string
  ): Promise<void> {
    // make sure that the application has permissions to save images to camera roll
    const mediaLibraryPermissions =
      await MediaLibrary.requestPermissionsAsync();
    if (!mediaLibraryPermissions.granted) {
      Alert.alert(
        "Epäonnistui!",
        "Myönnä sovellukselle lupa käyttää kamera rullaa jos haluat tallentaa kuvan puhelimellesi"
      );
      return;
    }
    // try to save the image to the camera roll
    try {
      const tempImageName = `${FileSystem.cacheDirectory}/${entryID}.jpg`;
      // we'll have to create a temporary file that holds the image
      await FileSystem.writeAsStringAsync(
        tempImageName,
        // remove first part of the uri so we can process the image properly
        dataURI.replace(IMAGE_URI_TYPE, ""),
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );
      // "move" the temorary image to the camera roll
      await MediaLibrary.saveToLibraryAsync(tempImageName);

      // cleanup the temporary image
      await FileSystem.deleteAsync(tempImageName);
      Alert.alert("Onnistui!", "Viesti ladattu galleriaan");
    } catch (err) {
      console.error(err);
      Alert.alert("Epäonnistui!", "Tapahtui virhe, yritä myöhemmin uudelleen");
    }
  }

  static parseEXIFOrientation(data: Buffer) {
    function readUInt16(data: Buffer, offset: number, msb: boolean) {
      return msb
        ? data.readUInt8(offset) * 0x100 + data.readUInt8(offset + 1)
        : data.readUInt8(offset) + 0x100 * data.readUInt8(offset + 1);
    }
    function readUInt32(data: Buffer, offset: number, msb: boolean) {
      const a = data.readUInt8(offset);
      const b = data.readUInt8(offset + 1);
      const c = data.readUInt8(offset + 2);
      const d = data.readUInt8(offset + 3);

      return msb
        ? ((a * 0x100 + b) * 0x100 + c) * 0x100 + d
        : a + 0x100 * (b + 0x100 * (c + 0x100 * d));
    }

    if (data.readUInt8(0) != 0xff || data.readUInt8(1) != 0xd8) return 9;

    // EXIF
    let offset = data.indexOf(
      Buffer.from([0x45, 0x78, 0x69, 0x66, 0x00, 0x00])
    );

    while (offset >= 0) {
      const lsb =
        data.readUInt8(offset + 6 + 0) == 0x49 &&
        data.readUInt8(offset + 6 + 1) == 0x49;
      const msb =
        data.readUInt8(offset + 6 + 0) == 0x4d &&
        data.readUInt8(offset + 6 + 1) == 0x4d;
      const magic = readUInt16(data, offset + 8, msb) == 0x2a;

      // EXIF
      if (
        data.readUInt8(offset - 4) == 0xff &&
        data.readUInt8(offset - 4 + 1) == 0xe1 &&
        (msb || lsb) &&
        magic
      ) {
        //console.log('EXIF', msb);

        offset = offset + 10;

        const entries = readUInt16(data, offset + 4, msb);
        //console.log('entries', entries);

        for (let i = 0; i < entries; i += 1) {
          const tagNumber = readUInt16(data, offset + 6 + i * 12, msb);
          //console.log('tagNumber', tagNumber);
          const dataFormat = readUInt16(data, offset + 6 + 2 + i * 12, msb);
          //console.log('dataFormat', dataFormat);
          const numComponents = readUInt32(
            data,
            offset + 6 + 2 + 2 + i * 12,
            msb
          );
          //console.log('numComponents', numComponents);

          // orientation
          // unsigned short int, one component
          // The orientation of the camera relative to the scene, when the image was captured. The start point of stored data is, '1' means upper left, '3' lower right, '6' upper right, '8' lower left, '9' undefined.
          if (tagNumber === 0x0112) {
            if (dataFormat !== 0x03 || numComponents !== 0x01) continue; //throw new Error('Invalid orientation');

            const orientation = readUInt16(
              data,
              offset + 6 + 2 + 2 + 4 + i * 12,
              msb
            );
            //console.log('---> orientation', orientation);
            return orientation;
          }
        }
      }

      offset = data.indexOf("EXIF", offset + 4);
    }

    return 9;
  }
}
