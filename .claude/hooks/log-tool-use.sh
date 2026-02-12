#!/bin/bash
# Log tool usage for Foundry-style workflow analysis.
# Reads first 500 bytes of stdin (avoids blocking on huge Edit/Write payloads)
# and extracts tool_name with grep (no full JSON parse needed).

TOOL=$(head -c 500 | grep -o '"tool_name" *: *"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
LOG="/Users/gerardoezequiel/Developer/world-upside-down/.claude/memory/ai-engineering/workflow-log.jsonl"
echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"tool\":\"${TOOL:-unknown}\"}" >> "$LOG"
