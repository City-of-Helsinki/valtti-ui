import { Component, createRef, RefObject } from "react";
import { EmitterSubscription, Keyboard, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, ScrollViewProps } from "react-native";
import styled from "styled-components/native";

export class AutoScroll extends Component {
  contentHeight?: number;
  scrollHeight?: number;
  scrollY?: number;
  keyboardDidShowListener?: EmitterSubscription;
  keyboardDidHideListener?: EmitterSubscription;
  scroller: RefObject<ScrollView>;
  constructor(props: ScrollViewProps) {
    super(props);

    // self binding
    this.handleKeyboardShow = this.handleKeyboardShow.bind(this);
    this.handleKeyboardHide = this.handleKeyboardHide.bind(this);
    this.handleLayout = this.handleLayout.bind(this);
    this.handleContentChange = this.handleContentChange.bind(this);
    this.handleScroll = this.handleScroll.bind(this);

    this.scroller = createRef<ScrollView>();
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this.handleKeyboardShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      this.handleKeyboardHide
    );
  }
  componentWillUnmount() {
    this.keyboardDidShowListener?.remove();
    this.keyboardDidHideListener?.remove();
  }

  // todo: handle layout instead of keyboard
  handleKeyboardShow() {
    this.scrollToBottom();
  }
  handleKeyboardHide() {
    const { scrollY, scrollHeight, contentHeight } = this;

    // fix iOS bouncing scroll effect
    if (Platform.OS === "ios") {
      // fix top blank if exsits
      // detection also has trouble on Android
      if (
        (scrollY as number) >
        (contentHeight as number) - (scrollHeight as number)
      ) {
        this.scroller.current?.scrollTo({ y: 0 });
      }
      // fix bottom blank if exsits
      // else {
      //   this.scrollToBottom()
      // }
      else {
        this.scroller.current?.scrollTo({ y: scrollY });
      }
    }
  }

  handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    this.scrollY = e.nativeEvent.contentOffset.y;
  }
  handleLayout(e: LayoutChangeEvent) {
    this.scrollHeight = e.nativeEvent.layout.height;
  }

  handleContentChange(_: unknown, h: number) {
    // repeated called on Android
    // should do diff
    if (h === this.contentHeight) return;
    this.contentHeight = h;

    if (this.scrollHeight == null) {
      setTimeout(() => {
        //FIXME we could need scrollToBottomIfNecessary? Look through old commits to find the implementation logic.
        this.scrollToBottom();
      }, 500);
    } else {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    const { scrollHeight, contentHeight } = this;
    if (scrollHeight == null) {
      return;
    }
    if ((contentHeight as number) > scrollHeight) {
      this.scroller.current?.scrollTo({
        y: (contentHeight as number) - scrollHeight,
      });
    }
  }

  render() {
    return (
      <ScrollView
        ref={this.scroller}
        scrollEventThrottle={16}
        onScroll={this.handleScroll}
        onLayout={this.handleLayout}
        onContentSizeChange={this.handleContentChange}
        {...this.props}
      ></ScrollView>
    );
  }
}

export const RegisterAutoScroll = styled(AutoScroll)`
  text-align: center;
  width: 100%;
  padding-bottom: 7px;
  ${Platform.OS === "ios" && 'margin-top: 35px;' }
  background-color: ${(props) => props.theme.colors.secondary};
  min-height: 100%;
`;