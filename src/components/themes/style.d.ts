// import original module declarations
import "styled-components/native";
// and extend them!
declare module "styled-components/native" {
  export interface DefaultTheme {
    colors: import("./default").Colors;
    sizes: import("./default").Sizes;
  }
}
