let util = {
    getServerBaseUrl() {
        return globalConfig.baseUrl;
    },
    isEmpty(obj) {
        return typeof obj == "undefined" || obj == null || obj == "";
    },
    isNotEmpty(obj) {
        return !this.isEmpty(obj);
    }
}

export default util;
