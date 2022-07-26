#!/bin/bash

tsc --build &&
sed -i "/use strict/d" ./dist/**.js &&
sed -i "/Object.defineProperty/d" ./dist/**.js

exit 0
