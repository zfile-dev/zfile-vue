import useDialog from "~/components/common/dialog/useDialog";

const { visible, openDialog } = useDialog();

const name = ref("");

export default function useVideoPlayerDialog() {

  const openDialogWithData = (_name) => {
    name.value = _name;
    openDialog();
  }

  return {
    openDialogWithData,
    visible,
    name
  };
}