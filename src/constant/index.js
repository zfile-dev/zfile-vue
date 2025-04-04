import ids from 'virtual:svg-icons-names'
import { version } from '../../package.json'

// 自动对 /src/assets/icons 目录下的文件图标进行显示
const iconFileType = [];
ids.forEach(id => {
  iconFileType.push(id.replace(/^icon-file-type-/, ''));
});

// 文件分类
const fileTypeMap = {
  image: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp', 'ico'],
  video: ['mp4', 'webm', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'],
  audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac', 'm4a'],
  text: ['scss', 'sass', 'kt', 'gitignore', 'bat', 'properties', 'yml', 'css', 'js', 'md', 'xml', 'txt', 'py', 'go', 'html', 'less', 'php', 'rb', 'rust', 'script', 'java', 'sh', 'sql'],
  executable: ['exe', 'dll', 'com', 'vbs'],
  archive: ['7z', 'zip', 'rar', 'tar', 'gz'],
  pdf: ['pdf'],
  office: ['doc', 'docx', 'csv', 'xls', 'xlsx', 'ppt', 'pptx', 'xlsm'],
  three3d: ['dae', 'fbx', 'gltf', 'glb', 'obj', 'ply', 'stl'],
  document: ['pages', 'epub', 'numbers', 'keynote']
};

// 可预览的文件类型
const previewFileType = ['image', 'video', 'audio', 'text', 'office', 'pdf', 'three3d'];

// 响应码
const responseCode = {
  REQUIRED_PASSWORD: '41020',
    INVALID_PASSWORD: '41021',
    UNAUTHORIZED: '42000',
    FORBIDDEN: '30000',
    BAD_REQUEST: '41000',
    SUCCESS: '0',
    PRO_CHECK_PREFIX: '2000',
    ERROR: '-1',
}

// 存储源类型
const storageType = {
  s3Type: ['s3', 'tencent', 'aliyun', 'qiniu', 'minio', 'huawei', 'doge-cloud']
}

const timeUnits = {
  's': '秒',
  'm': '分',
  'h': '时',
  'd': '天',
  'w': '周',
  'M': '月',
  'y': '年',
  'forever': '永久'
}

const timeUnitArr = [
  { label: '秒', value: 's' },
  { label: '分', value: 'm' },
  { label: '时', value: 'h' },
  { label: '天', value: 'd' },
  { label: '周', value: 'w' },
  { label: '月', value: 'M' },
  { label: '年', value: 'y' },
  { label: '永久', value: 'forever' }
]

let region = {
  aliyun: [
    {name: '华东 1（杭州）', val: 'oss-cn-hangzhou.aliyuncs.com'},
    {name: '华东 2（上海）', val: 'oss-cn-shanghai.aliyuncs.com'},
    {name: '华东5（南京-本地地域）', val: 'oss-cn-nanjing.aliyuncs.com'},
    {name: '华东6（福州-本地地域）', val: 'oss-cn-fuzhou.aliyuncs.com'},
    {name: '华中1（武汉-本地地域）', val: 'oss-cn-wuhan-lr.aliyuncs.com'},
    {name: '华北 1（青岛）', val: 'oss-cn-qingdao.aliyuncs.com'},
    {name: '华北 2（北京）', val: 'oss-cn-beijing.aliyuncs.com'},
    {name: '华北 3（张家口）', val: 'oss-cn-zhangjiakou.aliyuncs.com'},
    {name: '华北 5（呼和浩特）', val: 'oss-cn-huhehaote.aliyuncs.com'},
    {name: '华北 6（乌兰察布）', val: 'oss-cn-wulanchabu.aliyuncs.com'},
    {name: '华南 1（深圳）', val: 'oss-cn-shenzhen.aliyuncs.com'},
    {name: '华南 2（河源）', val: 'oss-cn-heyuan.aliyuncs.com'},
    {name: '华南 3（广州）', val: 'oss-cn-guangzhou.aliyuncs.com'},
    {name: '西南 1（成都）', val: 'oss-cn-chengdu.aliyuncs.com'},
    {name: '中国香港', val: 'oss-cn-hongkong.aliyuncs.com'},
    {name: '美国（硅谷）', val: 'oss-us-west-1.aliyuncs.com'},
    {name: '美国（弗吉尼亚）', val: 'oss-us-east-1.aliyuncs.com'},
    {name: '日本（东京）', val: 'oss-ap-northeast-1.aliyuncs.com'},
    {name: '韩国（首尔）', val: 'oss-ap-northeast-2.aliyuncs.com'},
    {name: '新加坡', val: 'oss-ap-southeast-1.aliyuncs.com'},
    {name: '澳大利亚 （悉尼）', val: 'oss-ap-southeast-2.aliyuncs.com'},
    {name: '马来西亚 （吉隆坡）', val: 'oss-ap-southeast-3.aliyuncs.com'},
    {name: '印度尼西亚 （雅加达）', val: 'oss-ap-southeast-5.aliyuncs.com'},
    {name: '菲律宾（马尼拉）', val: 'oss-ap-southeast-6.aliyuncs.com'},
    {name: '泰国（曼谷）', val: 'oss-ap-southeast-7.aliyuncs.com'},
    {name: '印度（孟买）', val: 'oss-ap-south-1.aliyuncs.com'},
    {name: '德国（法兰克福）', val: 'oss-eu-central-1.aliyuncs.com'},
    {name: '英国（伦敦）', val: 'oss-eu-west-1.aliyuncs.com'},
    {name: '阿联酋（迪拜）', val: 'oss-me-east-1.aliyuncs.com'},
    {name: '无地域属性（中国内地）', val: 'oss-rg-china-mainland.aliyuncs.com'},

    {name: '杭州金融云公网', val: 'oss-cn-hzfinance.aliyuncs.com'},
    {name: '上海金融云公网', val: 'oss-cn-shanghai-finance-1-pub.aliyuncs.com'},
    {name: '深圳金融云公网', val: 'oss-cn-szfinance.aliyuncs.com'},
    {name: '北京金融云公网', val: 'oss-cn-beijing-finance-1-pub.aliyuncs.com'}
  ],
  tencent: [
    {name: '北京一区', val: 'cos.ap-beijing-1.myqcloud.com'},
    {name: '北京', val: 'cos.ap-beijing.myqcloud.com'},
    {name: '南京', val: 'cos.ap-nanjing.myqcloud.com'},
    {name: '上海', val: 'cos.ap-shanghai.myqcloud.com'},
    {name: '广州', val: 'cos.ap-guangzhou.myqcloud.com'},
    {name: '成都', val: 'cos.ap-chengdu.myqcloud.com'},
    {name: '重庆', val: 'cos.ap-chongqing.myqcloud.com'},
    {name: '深圳金融', val: 'cos.ap-shenzhen-fsi.myqcloud.com'},
    {name: '上海金融', val: 'cos.ap-shanghai-fsi.myqcloud.com'},
    {name: '北京金融', val: 'cos.ap-beijing-fsi.myqcloud.com'},
    {name: '中国香港', val: 'cos.ap-hongkong.myqcloud.com'},
    {name: '新加坡', val: 'cos.ap-singapore.myqcloud.com'},
    {name: '孟买', val: 'cos.ap-mumbai.myqcloud.com'},
    {name: '雅达加', val: 'cos.ap-jakarta.myqcloud.com'},
    {name: '首尔', val: 'cos.ap-seoul.myqcloud.com'},
    {name: '曼谷', val: 'cos.ap-bangkok.myqcloud.com'},
    {name: '东京', val: 'cos.ap-tokyo.myqcloud.com'},
    {name: '硅谷（美西）', val: 'cos.na-siliconvalley.myqcloud.com'},
    {name: '弗吉尼亚（美东）', val: 'cos.na-ashburn.myqcloud.com'},
    {name: '多伦多', val: 'cos.na-toronto.myqcloud.com'},
    {name: '圣保罗', val: 'cos.sa-saopaulo.myqcloud.com'},
    {name: '法兰克福', val: 'cos.eu-frankfurt.myqcloud.com'}
  ],
  huawei: [
    {name: '非洲-约翰内斯堡', val: 'obs.af-south-1.myhuaweicloud.com'},
    {name: '华北-北京四', val: 'obs.cn-north-4.myhuaweicloud.com'},
    {name: '华北-北京一', val: 'obs.cn-north-1.myhuaweicloud.com'},
    {name: '华北-乌兰察布一', val: 'obs.cn-north-9.myhuaweicloud.com'},
    {name: '华东-上海二', val: 'obs.cn-east-2.myhuaweicloud.com'},
    {name: '华东-上海一', val: 'obs.cn-east-3.myhuaweicloud.com'},
    {name: '华南-广州', val: 'obs.cn-south-1.myhuaweicloud.com'},
    {name: '华南-广州-友好用户环境', val: 'obs.cn-south-4.myhuaweicloud.com'},

    {name: '拉美-墨西哥城一', val: 'obs.la-north-2.myhuaweicloud.com'},
    {name: '拉美-墨西哥城一', val: 'obs.na-mexico-1.myhuaweicloud.com'},
    {name: '拉美-圣保罗一', val: 'obs.sa-brazil-1.myhuaweicloud.com'},
    {name: '拉美-圣地亚哥', val: 'obs.la-south-2.myhuaweicloud.com'},
    {name: '土耳其-伊斯坦布尔', val: 'obs.tr-west-1.myhuaweicloud.com'},

    {name: '西南-贵阳一', val: 'obs.cn-southwest-2.myhuaweicloud.com'},
    {name: '亚太-曼谷', val: 'obs.ap-southeast-2.myhuaweicloud.com'},
    {name: '亚太-新加坡', val: 'obs.ap-southeast-3.myhuaweicloud.com'},
    {name: '中东-利雅得', val: 'obs.me-east-1.myhuaweicloud.com'},
    {name: '中国-香港', val: 'obs.ap-southeast-1.myhuaweicloud.com'},
  ],
  qiniu: [
    {name: '华东-浙江', val: 's3-cn-east-1.qiniucs.com'},
    {name: '华东-浙江2', val: 's3-cn-east-2.qiniucs.com'},
    {name: '华北-河北', val: 's3-cn-north-1.qiniucs.com'},
    {name: '华南-广东', val: 's3-cn-south-1.qiniucs.com'},
    {name: '北美-洛杉矶', val: 's3-us-north-1.qiniucs.com'},
    {name: '亚太-新加坡(东南亚)', val: 's3-ap-southeast-1.qiniucs.com'},
  ]
}

const systemNames = ['admin', 'user', 'file', 'login', 'install', 's', 'onedrive', 'api', 'sharepoint', 's3', 'webdav', 'pd', 'gd', 'onlyOffice', '401', '403', '404', '500', 'guest'];
const disableUrlChars = ['+', ' ', '/', '?', '%', '=', '&', '#']

export const constant = {
  iconFileType, fileTypeMap, previewFileType,
  version, responseCode, storageType,
  timeUnits, timeUnitArr,
  region, systemNames, disableUrlChars
}