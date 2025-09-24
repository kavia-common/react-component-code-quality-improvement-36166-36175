#!/bin/bash
cd /home/kavia/workspace/code-generation/react-component-code-quality-improvement-36166-36175/frontend_react_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

