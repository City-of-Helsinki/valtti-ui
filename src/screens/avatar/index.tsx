import { AnyAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { ChangeAvatar } from "../../components/Profile/ChangeAvatar";
import { avatars } from "../../icons/icons";
import { useNavigation } from "../../navigation";
import { updateProfileAvatar } from "../../queries";
import { fetchUserById } from "../../redux/slices/userSlice";
import { store } from "../../redux/store";

export default function AvatarChanger() {
  const user = store.getState().user;
  const mutation = updateProfileAvatar();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const confirmAvatar = (picture: string) => {
    dispatch(
      fetchUserById({
        userID: user.user.id,
        roleType: user.user.roleType,
        // the type is actually correct but for somereason this won't work
      }) as unknown as AnyAction
    );
    mutation.mutate(picture);
  };

  const onBack = () => {
    navigation.navigate("ProfileTab");
  };

  return (
    <ChangeAvatar
      avatars={avatars}
      confirmAvatar={confirmAvatar}
      onBack={onBack}
    ></ChangeAvatar>
  );
}
