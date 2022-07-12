// 获取窗口宽高
import { useWindowSize } from '@vueuse/core'
const { width, height } = useWindowSize()


export default function useCommon() {

    const isMobile = computed(() => {
        return width.value < 768;
    })

    const isNotMobile = computed(() => {
        return width.value >= 768;
    })

    // encodeURIComponent 编码所有 url, 但忽略 / 字符
    const encodeAllIgnoreSlashes = (str) => {
        if (strIsEmpty(str)) {
            return '';
        }

        let result = '';
        let prevIndex = -1;

        for (let i = 0; i < str.length; i++) {
            const c = str.charAt(i);
            if (c === '/') {
                if (prevIndex < i) {
                    let subStr = str.substring(prevIndex + 1, i);
                    result += encodeURIComponent(subStr);
                    prevIndex = i;
                }
                result += c;
            }

            if (i === str.length - 1 && prevIndex < i) {
                let subStr = str.substring(prevIndex + 1, i + 1);
                result += encodeURIComponent(subStr);
            }
        }
        return result;
    }

    const strIsEmpty = (str) => {
        return str === null || str === undefined || str === '';
    }

    const strIsNotEmpty = (str) => {
        return !strIsEmpty(str);
    }

    return {
        isMobile, isNotMobile, height, encodeAllIgnoreSlashes, strIsEmpty, strIsNotEmpty
    }

}