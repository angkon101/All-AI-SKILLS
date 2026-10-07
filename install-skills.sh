#!/usr/bin/env bash
# ==============================================================================
# AI Agent Skills Installer (Linux / macOS / Git Bash)
# Installs and copies skills to target projects (.agents/skills/) or globally.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_SKILLS_DIR="${SCRIPT_DIR}/skills"

if [[ ! -d "${SOURCE_SKILLS_DIR}" ]]; then
  echo "Error: Source skills directory not found at: ${SOURCE_SKILLS_DIR}" >&2
  exit 1
fi

DESTINATION=""
GLOBAL_INSTALL=false
SKILL_NAME=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --global|-g)
      GLOBAL_INSTALL=true
      shift
      ;;
    --skill|-s)
      SKILL_NAME="$2"
      shift 2
      ;;
    --dest|-d)
      DESTINATION="$2"
      shift 2
      ;;
    *)
      DESTINATION="$1"
      shift
      ;;
  esac
done

if [[ "${GLOBAL_INSTALL}" == true ]]; then
  TARGET_DIR="${HOME}/.gemini/config/skills"
elif [[ -n "${DESTINATION}" ]]; then
  if [[ "${DESTINATION}" =~ skills/?$ ]]; then
    TARGET_DIR="${DESTINATION}"
  else
    TARGET_DIR="${DESTINATION}/.agents/skills"
  fi
else
  echo "=========================================================="
  echo "         AI Agent Skills Installer (Bash / POSIX)         "
  echo "=========================================================="
  echo "1) Install globally to ~/.gemini/config/skills/ (All projects)"
  echo "2) Install to a specific project (.agents/skills/)"
  echo "q) Quit"
  read -rp "Select an option [1/2/q]: " CHOICE

  case "${CHOICE}" in
    1)
      TARGET_DIR="${HOME}/.gemini/config/skills"
      ;;
    2)
      read -rp "Enter target project root directory: " DEST_INPUT
      if [[ -z "${DEST_INPUT}" ]]; then
        echo "No destination specified. Exiting."
        exit 0
      fi
      TARGET_DIR="${DEST_INPUT}/.agents/skills"
      ;;
    *)
      echo "Exiting."
      exit 0
      ;;
  esac
fi

mkdir -p "${TARGET_DIR}"

if [[ -n "${SKILL_NAME}" ]]; then
  SRC="${SOURCE_SKILLS_DIR}/${SKILL_NAME}"
  if [[ ! -d "${SRC}" ]]; then
    echo "Error: Skill '${SKILL_NAME}' does not exist in ${SOURCE_SKILLS_DIR}." >&2
    exit 1
  fi
  cp -R "${SRC}" "${TARGET_DIR}/"
  echo "✓ Successfully copied '${SKILL_NAME}' to ${TARGET_DIR}/${SKILL_NAME}"
else
  echo "Copying all skills to: ${TARGET_DIR}..."
  cp -R "${SOURCE_SKILLS_DIR}"/* "${TARGET_DIR}/"
  echo "✓ All skills successfully installed to: ${TARGET_DIR}"
fi
