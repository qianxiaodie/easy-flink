#! /bin/bash

for file in `ls ./public/static/gitbook`
do
  if [ -f "./public/static/gitbook/"$file ]
  then
    if [[ $file =~ \.html|\.json$ ]]
    then
      sed -i ".bak" "s/\.\//\.\/index\.html/g" "./public/static/gitbook/"$file
    fi
  fi
done