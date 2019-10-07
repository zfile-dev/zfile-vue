<template>
    <swiper :options="swiperOption" ref="mySwiper" >
        <swiper-slide v-for="item in imageList" :key="item.url">
            <img :src="item.url"/>
        </swiper-slide>
    </swiper>
</template>

<script>
    export default {
        name: "ImagePlay",
        data() {
            return {
                swiperOption: {
                    touchAngle : 10,
                    autoHeight: true
                }
            }
        },
        props: {
            imageList: Array
        },
        methods: {
        },
        mounted () {
        }
    }
</script>

<style scoped>

</style>