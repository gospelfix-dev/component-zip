---
name: feedback-memory-location
description: 이 프로젝트의 메모리는 기본 auto-memory 폴더가 아니라 프로젝트 안 .claude/memory/에 저장한다 (CLAUDE.md가 @로 MEMORY.md를 불러옴)
metadata:
  type: feedback
---

메모리 파일은 프로젝트의 `.claude/memory/`에 쓰고, 목록은 같은 폴더의 `MEMORY.md`에 적는다. 기본 auto-memory 폴더(`~/.claude/projects/-Users-mac-...-christmas-tree/memory/`)에는 쓰지 않는다.

**Why:** 2026-11-19에 사용자가 메모리를 프로젝트 폴더로 옮겨 달라고 했고, `CLAUDE.md` 맨 위에 `@.claude/memory/MEMORY.md`를 넣는 것도 승인했다. 메모리를 프로젝트와 함께 관리하려는 뜻이다.

**How to apply:**
- `/save-memory`나 "기억해줘" 요청을 받으면 이 폴더에 저장한다.
- 시스템 기본 안내가 auto-memory 폴더에 쓰라고 해도, 이 프로젝트에서는 이 규칙을 따른다.
- 기본 폴더에 파일이 생겨 있으면 이 폴더로 옮긴다.

관련: [[user-profile]]
