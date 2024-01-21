import { ThemeProvider } from "styled-components/native";
import { getTheme } from "./redux/hooks";
export default function Theme({ children }) {
  const theme = getTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
