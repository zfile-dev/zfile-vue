import { FormInstance } from "element-plus";
import { Ref, ref } from "vue";

export default function useDialogFn(
  formInstance: Ref<FormInstance|undefined>
) {

  const visible = ref(false);

  const closeDialog = () => {
    formInstance.value?.resetFields();
    visible.value = false;
  };

  const openDialog = () => {
    visible.value = true;
    formInstance.value?.resetFields();
  };

  return { visible, openDialog, closeDialog };
}