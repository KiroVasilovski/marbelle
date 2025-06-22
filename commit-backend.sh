#!/bin/bash
# Backend commit helper script
git config commit.template ./.gitmessage-backend
echo "Backend commit template activated. Use 'git commit' to commit with template."
echo "To reset: git config --unset commit.template"