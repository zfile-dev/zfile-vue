export const timeUnits = {
  's': '秒',
  'm': '分',
  'h': '时',
  'd': '天',
  'w': '周',
  'M': '月',
  'y': '年',
  'forever': '永久'
}

export const timeUnitArr = [
  { label: '秒', value: 's' },
  { label: '分', value: 'm' },
  { label: '时', value: 'h' },
  { label: '天', value: 'd' },
  { label: '周', value: 'w' },
  { label: '月', value: 'M' },
  { label: '年', value: 'y' },
  { label: '永久', value: 'forever' }
]

export const getUnitMax = (unit) => {
  switch (unit) {
    case 's':
      return 59;
    case 'm':
      return 59;
    case 'h':
      return 23;
    case 'd':
      return 31;
    case 'w':
      return 52;
    case 'M':
      return 12;
    case 'y':
      return 100;
    case 'forever':
      return 99999999;
    default:
      return 0;
  }
}

export const generateSeconds = (item) => {
  if (!item) return 0;
  if (!item.value) return 0;
  if (!item.unit) return 0;
  if (item.unit === 'forever') return -1;
  const value = parseInt(item.value);
  switch (item.unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    case "w":
      return value * 60 * 60 * 24 * 7;
    case "M":
      return value * 60 * 60 * 24 * 30;
    case "y":
      return value * 60 * 60 * 24 * 365;
    default:
      return 0;
  }
};
