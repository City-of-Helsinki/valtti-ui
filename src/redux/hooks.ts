import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, store } from "./store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
// causes rerender when the user value changes and this hook is used
export const useUser = () => useAppSelector((state) => state.user.user);
export const useUserId = () => useAppSelector((state) => state.user.user.id);
export const useProfile = () => useAppSelector((state) => state.user.profile);
// TODO: Fix casing
export const usecurrentChatID = () =>
  useAppSelector((state) => state.chat.currentChatID);

// does not rerender if the user value changes. use this function inside functions where you need the current user without waiting for a rerender.
export const getUser = () => store.getState().user.user;
export const getProfile = () => store.getState().user.profile;

export const getTheme = () => useAppSelector((state) => state.theme.theme);
