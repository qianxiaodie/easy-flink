/**
 * @description: 根据关键词过滤指标树
 * @param {type}
 * @return:
 */
function indexTreeFilter(data, keyWord) {
  // 树过滤
  const nodes = JSON.parse(JSON.stringify(data));
  // 如果已经没有节点了，结束递归
  if (!(nodes && nodes.length)) {
    return;
  }
  const newChildren = [];
  nodes.forEach((node) => {
    const nodeTemp = JSON.parse(JSON.stringify(node));
    // 获取子节点是否含有符合条件的node
    const subs = indexTreeFilter(node.children, keyWord);
    // 以下两个条件任何一个成立，当前节点都应该加入到新子节点集中
    // 1. 子孙节点中存在符合条件的，即 subs 数组中有值
    // 2. 自己本身没有子节点且符合条件
    if ((subs && subs.length) || (!node.children && node.title.indexOf(keyWord) !== -1)) {
      nodeTemp.children = subs;
      newChildren.push(nodeTemp);
    }
  });
  return newChildren;
}

export { indexTreeFilter };
