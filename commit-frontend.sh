#!/bin/bash
# Frontend commit helper script
git config commit.template ./.gitmessage-frontend
echo "Frontend commit template activated. Use 'git commit' to commit with template."
echo "To reset: git config --unset commit.template"