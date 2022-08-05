import useFileDataStore from "~/stores/file-data";
let fileDataStore = useFileDataStore();

// 画廊模式
let imgModel = ref(false);
// 检测手动切换画廊模式
watch(() => imgModel.value, () => {
    fileDataStore.switchImgMode(imgModel.value);
})

// 检测后台设置为画廊模式
watch(() => fileDataStore.newImgMode, (newVal) => {
    imgModel.value = newVal;
})

export default function useHeaderImgMode() {
    return { imgModel }
}