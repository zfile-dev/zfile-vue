const fileTypeMap = {
    image: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp', 'ico'],
    video: ['mp4', 'webm', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'],
    audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac', 'm4a'],
    text: ['css', 'js', 'md', 'xml', 'txt', 'py', 'go', 'html', 'less', 'php', 'rb', 'rust', 'script', 'java', 'sh'],
    executable: ['exe', 'dll', 'com', 'vbs'],
    archive: ['7z', 'zip', 'rar', 'tar', 'gz'],
    document: ['doc', 'txt', 'docx', 'pages', 'epub', 'pdf', 'numbers', 'csv', 'xls', 'xlsx', 'keynote', 'ppt', 'pptx']
};

import config from '../package.json'

const iconFileType = ['css', 'go', 'html', 'js', 'less', 'php', 'py', 'rb', 'rust', 'script', 'md', 'apk', 'deb', 'rpm', 'java'];

let common = {
    responseCode: {
        SUCCESS: 0,
        FAIL: -1,
        REQUIRED_PASSWORD: -2,
        INVALID_PASSWORD: -3
    },
    version: config.version,
    constant: {
        fileTypeMap,
        iconFileType
    },
    fileSizeFormat: (bytes) => {
        if (bytes === 0) return '0 B';
        let k = 1024;
        let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        let i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    },
    fileSizeFilter: (row, column, bytes) => {
        if (row.type === "BACK") return '';
        if (row.type === "FOLDER") return '-';
        if (bytes === 0) return '0 B';
        let k = 1024;
        let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        let i = Math.floor(Math.log(bytes) / Math.log(k));
        return common.fileSizeFormat(bytes);
    },
    getFileIconName(file) {
        let ICON_PREFIX = 'el-icon-my-';
        let iconName;
        if (file.type === 'BACK' || file.type === 'FOLDER') {
            return ICON_PREFIX + file.type.toLowerCase();
        } else {
            let fileSuffix = this.getFileSuffix(file.name);
            let fileType = this.getFileType(file.name);

            if (iconFileType.indexOf(fileSuffix) !== -1) {
                iconName = ICON_PREFIX + fileSuffix;
            } else if (fileType) {
                iconName = ICON_PREFIX + fileType;
            } else {
                iconName = ICON_PREFIX + 'file';
            }
        }
        return iconName;
    },
    getFileSuffix(name) {
        let lastIndex = name.lastIndexOf('.');
        if (lastIndex === -1) {
            return 'other';
        }
        return name.substr(lastIndex + 1).toLowerCase();
    },
    getFileType(name) {
        let fileType;
        for (let key in fileTypeMap) {
            let suffix = this.getFileSuffix(name);
            if (fileTypeMap[key].indexOf(suffix) !== -1) {
                fileType = key;
                break;
            }
        }
        return fileType;
    },
    removeDuplicateSeparator(path) {
        let result = '';

        if (path.indexOf("http://") === 0) {
            result = "http://";
        } else if (path.indexOf("https://") === 0) {
            result = "https://";
        }

        for (let i = result.length; i < path.length - 1; i++) {
            let current = path.charAt(i);
            let next = path.charAt(i + 1);
            if (!(current === '/' && next === '/')) {
                result += current;
            }
        }
        result += path.charAt(path.length - 1);
        return result;
    },
    isMobile() {
        let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
        return flag || window.innerWidth < 768;
    },
    dateFormat:function(time) {
        let date = new Date(time);
        let year = date.getFullYear();
        let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    }
};

export default common;
