#! /bin/bash

set -e

# 开发分支
curBranch=""

# 目标分支
targetBranch=""

#获取参数
while getopts 't:c:' OPT;
do
  case $OPT in
    t)
      targetBranch="$OPTARG";;
    c)
      curBranch="$OPTARG";;
  esac
done

echo -e "\033[34m[ 开始部署... ]\033[0m"

# 获取开发分支，默认为当前分支
if [ -z $curBranch]
then
  curBranch=`git symbolic-ref --short -q HEAD`
fi
echo -e "\033[34m[ 开发分支：$curBranch ]\033[0m"

# 指定目标分支，默认为 QA 分支
if [ -z $targetBranch ]
then
  targetBranch=qa
fi
echo -e "\033[34m[ 目标分支：$targetBranch ]\033[0m"

# 切换到目标分支，合并代码
if [ $targetBranch != $curBranch ]
then
  git checkout $targetBranch
  git merge $curBranch
fi

git push origin $targetBranch

# 打包
echo -e "\033[34m[ 开始打包... ]\033[0m"
npm run build

# 同步代码到 webserve 仓库
echo -e "\033[34m[ 同步代码... ]\033[0m"
npm run sync

# develop 分支一键发布
if [ $targetBranch == 'develop' ]
then
  echo -e "\033[34m[ 一键发布... ]\033[0m"
  npm run buildAndDeploy
fi

# 切回原分支
git checkout $curBranch

echo -e "\033[32m[ 部署成功！ ]\033[0m"
