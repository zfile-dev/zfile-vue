const visible = ref(false);
const operatorResultList = ref([]);
export default function useBatchOperatorResult() {

  const open = (list) => {
    if (list && list.length > 0) {
      operatorResultList.value = list;
      visible.value = true;
    }
  }

  return {
    open,
    visible,
    operatorResultList
  }

}