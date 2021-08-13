#!/usr/bin/bash

i=0
while [ $i -le 1000000000000 ]; do
  url="https://api.opensea.io/asset/0xD224B0eAf5B5799ca46D9FdB89a2C10941E66109/${i}/?force_update=true"
  curl ${url}
  sleep 1
done