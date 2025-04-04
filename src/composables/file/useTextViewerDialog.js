import useDialog from "~/components/common/dialog/useDialog";

const { visible, openDialog} = useDialog();

const name = ref("");
const url = ref("");

export default function useTextViewerDialog() {

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