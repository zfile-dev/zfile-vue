import useDialog from "~/components/common/dialog/useDialog";
import { ref } from "vue";

const { visible, openDialog } = useDialog();

const name = ref("");
const url = ref(""); // kkfileview 需要文件的完整 URL

export default function useKkFileViewDialog() {

  // 接收文件名和文件URL
  const openDialogWithData = (_name, _url) => {
    name.value = _name;
    url.value = _url;
    openDialog();
  }

  return {
    openDialogWithData,
    visible,
    name,
    url
  };
}