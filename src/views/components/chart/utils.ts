const THOUSAND = 1000;
const MILLION = THOUSAND * 1000;
const BILLION = MILLION * 1000;

/**
 * 计算小数点位数
 * @param args
 */
export const calcDecimalLength = (args: number) => {
  const arr = ('' + args).split('.');
  return arr.length > 1 ? arr[1].length : 0;
};

/**
 * 格式化 y 轴的值
 * @param args 需要格式化的值
 * @param unit 格式化单位，支持 K, M, B
 * @param decimal 保留的小数位数
 * @return string
 */
export const formatNumericalValue = (args: any, unit: string, decimal: number = 1) => {
  if (!unit) {
    return parseFloat(args);
  }
  const num = Number(args);
  if (isNaN(num)) {
    return args;
  }
  let val: any;
  if (unit === 'K') {
    val = num / THOUSAND;
  } else if (unit === 'M') {
    val = num / MILLION;
  } else {
    val = num / BILLION;
  }
  const dl = calcDecimalLength(val);
  return parseFloat((dl > decimal ? val.toFixed(decimal) : val)) + unit;
};

/**
 * 计算一组数据的单位，目前只根据最大数判断
 * @param args
 */
export const calcNumberUnit = (args: any[] = []) => {
  const arr = args.map(a => Number(a)).filter(a => !isNaN(a));
  const num = Math.max(...arr);
  if (num > BILLION) {
    return 'B';
  }
  if (num > MILLION) {
    return 'M';
  }
  if (num > THOUSAND) {
    return 'K';
  }
  return '';
};

/**
 * 计算多组数据的单位
 * @param args
 */
export const calcNumberArrayUnit = (args: any[] = []) => {
  let arrs = args.map(a => calcNumberUnit(a));
  arrs = Array.from(new Set(arrs));
  if (arrs.includes('B')) {
    return 'B';
  }
  if (arrs.includes('M')) {
    return 'M';
  }
  if (arrs.includes('K')) {
    return 'K';
  }
  return '';
};
