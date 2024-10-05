#!/bin/bash

# Usage: ./pip_install.sh <package>
# e.g. ./pip_install.sh fastapi

if [ $# -eq 0 ]; then
    echo "Please provide a package name"
    exit 1
fi

pip install "$@"

if [ $? -eq 0 ]; then
    pip freeze | grep -i "^$1==" >> requirements.in
    echo "Package added to requirements.in"
    
    if command -v pip-compile &> /dev/null; then
        pip-compile requirements.in
        echo "requirements.in compiled to requirements.txt"
    else
        echo "pip-compile not found. Please install pip-tools to compile requirements.txt"
    fi
else
    echo "Failed to install package"
fi
