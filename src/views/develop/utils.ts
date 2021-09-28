export const sleep = async (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export function dateFormat(time, format = 'YY-MM-DD hh:mm:ss') {
  var date = new Date(time);

  var year = date.getFullYear(),
    month = date.getMonth() + 1, //月份是从0开始的
    day = date.getDate(),
    hour = date.getHours(),
    min = date.getMinutes(),
    sec = date.getSeconds();
  var preArr: any = Array.apply(null, Array(10)).map(function (elem, index) {
    return '0' + index;
  }); //开个长度为10的数组 格式为 ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09"]

  var newTime = format.replace(/YY/g, year)
    .replace(/MM/g, preArr[month] || month)
    .replace(/DD/g, preArr[day] || day)
    .replace(/hh/g, preArr[hour] || hour)
    .replace(/mm/g, preArr[min] || min)
    .replace(/ss/g, preArr[sec] || sec);

  return newTime;
}


export const STFormat = function (fmt = 'yyyy年MM月dd日 hh时mm分ss秒') {
  const thisa = new Date()
  const o = {
    'M+': thisa.getMonth() + 1,
    'd+': thisa.getDate(),
    'h+': thisa.getHours(),
    'm+': thisa.getMinutes(),
    's+': thisa.getSeconds(),
    'q+': Math.floor((thisa.getMonth() + 3) / 3),
    S: thisa.getMilliseconds(),
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, `${thisa.getFullYear()}`.substr(4 - RegExp.$1.length));
  for (const k in o)
    if (new RegExp(`(${k})`).test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length)
      );
  return fmt;
};
