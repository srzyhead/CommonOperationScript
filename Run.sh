#!/usr/bin/env bash
npm config set registry https://registry.npm.taobao.org
npm install -g babel-cli
npm install
babel-node ./${1}.js