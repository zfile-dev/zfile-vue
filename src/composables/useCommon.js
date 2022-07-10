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

    return {
        isMobile, isNotMobile, height
    }

}