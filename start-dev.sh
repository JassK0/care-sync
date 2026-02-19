#!/bin/bash
# Start development server using Vercel
# This script avoids the recursive invocation issue

cd "$(dirname "$0")"
vercel dev
