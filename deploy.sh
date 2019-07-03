#!/bin/bash
if [[ ! -z "${OPENODE_TOKEN}" ]]; then
  openode ci-conf "${OPENODE_TOKEN}" "codesweets"
fi

openode deploy "codesweets"
