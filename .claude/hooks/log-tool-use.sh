#!/usr/bin/env bash
# Log tool usage for metalearning analysis.
# Called by PostToolUse hook on Edit|Write|Bash|Task events.
# Environment variables provided by Claude Code:
#   TOOL_NAME, TOOL_INPUT (JSON), SESSION_ID

LOG_DIR="/Users/gerardoezequiel/Developer/world-upside-down/.claude/logs"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/tool-use.jsonl"

# Extract just the tool name and a timestamp; keep it lean
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Write one JSON line per tool use
printf '{"ts":"%s","tool":"%s","session":"%s"}\n' \
  "$TIMESTAMP" \
  "${TOOL_NAME:-unknown}" \
  "${SESSION_ID:-unknown}" \
  >> "$LOG_FILE"
