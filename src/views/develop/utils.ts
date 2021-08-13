export const sleep = async (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};


export const STFormat = function(fmt = 'yyyy年MM月dd日 hh时mm分ss秒') {
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
