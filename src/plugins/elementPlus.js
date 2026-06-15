import { ElButton } from "element-plus/es/components/button/index.mjs";
import { ElDialog } from "element-plus/es/components/dialog/index.mjs";
import { ElIcon } from "element-plus/es/components/icon/index.mjs";
import { ElInput } from "element-plus/es/components/input/index.mjs";
import { ElOption } from "element-plus/es/components/select/index.mjs";
import { ElScrollbar } from "element-plus/es/components/scrollbar/index.mjs";
import { ElSelect } from "element-plus/es/components/select/index.mjs";
import { ElTree } from "element-plus/es/components/tree/index.mjs";
import "element-plus/theme-chalk/base.css";
import "element-plus/theme-chalk/el-button.css";
import "element-plus/theme-chalk/el-dialog.css";
import "element-plus/theme-chalk/el-icon.css";
import "element-plus/theme-chalk/el-input.css";
import "element-plus/theme-chalk/el-option.css";
import "element-plus/theme-chalk/el-overlay.css";
import "element-plus/theme-chalk/el-popper.css";
import "element-plus/theme-chalk/el-scrollbar.css";
import "element-plus/theme-chalk/el-select.css";
import "element-plus/theme-chalk/el-select-dropdown.css";
import "element-plus/theme-chalk/el-tree.css";

const ELEMENT_COMPONENTS = [
  ElButton,
  ElDialog,
  ElIcon,
  ElInput,
  ElOption,
  ElScrollbar,
  ElSelect,
  ElTree,
];

// 注册当前项目实际使用到的 Element Plus 组件。
export function installElementPlus(app) {
  ELEMENT_COMPONENTS.forEach((component) => {
    app.use(component);
  });
}
