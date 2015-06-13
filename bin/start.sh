#!/bin/bash
if type nodemon >/dev/null 2>&1  ; then
    nodemon src/index.js
else
    node src/index.js
fi
