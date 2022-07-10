import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();


// 搜索相关
let timer;
let search = ref();
let initialized = false;
export default function useSearch() {

    if (!initialized) {
        watch(() => search.value, (newVal) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                fileDataStore.updateSearchParam(newVal);
            }, 150);
        })
    }

    return { search }
}
