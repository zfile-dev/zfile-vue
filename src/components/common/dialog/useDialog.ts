import { ref } from "vue";

export default function useDialog() {
  const visible = ref(false);
  const loading = ref(false);
  const openDialog = () => (visible.value = true);
  const closeDialog = () => (visible.value = false);
  const openLoading = () => (loading.value = true);
  const closeLoading = () => (loading.value = false);
  return {
    visible,
    loading,
    openDialog,
    closeDialog,
    openLoading,
    closeLoading,
  };
}