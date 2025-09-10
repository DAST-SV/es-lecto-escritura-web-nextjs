// layouts/index.ts
import { SplitLayout } from "./SplitLayout";
import { InteractiveLayout } from "./InteractiveLayout";
import { FullPageLayout } from "./FullPageLayout";
import { CoverLayout } from "./CoverLayout";
import { TextLeftImageRightLayout } from "./TextLeftImageRightLayout";
import { ImageLeftTextRightLayout } from "./ImageLeftTextRightLayout";
import { SplitTopBottomLayout } from "./SplitTopBottomLayout";
import { ImageFullLayout } from "./ImageFullLayout";
import { TextCenterLayout } from "./TextCenterLayout";

// Ahora sí podemos usar shorthand
export const layouts = {
  SplitLayout,
  InteractiveLayout,
  FullPageLayout,
  CoverLayout,
  TextLeftImageRightLayout,
  ImageLeftTextRightLayout,
  SplitTopBottomLayout,
  ImageFullLayout,
  TextCenterLayout
}as const;

