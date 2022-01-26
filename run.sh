#!/bin/bash

function usage {
  echo "$0 URLS_FILE"
}

MESSAGE="[AUTO] Add cffconvert GitHub action

Hello from the Generalization Team :raising_hand_man:

This is an automated Pull Request to add a [**CITATION.cff validator action**](https://github.com/citation-file-format/cffconvert-github-action).
We have verified that you have a \`CITATION.cff\` file and that you don't have an existing validator.
If you need more information, or think we made a mistake, please get in touch.

Best"

# - 

# Create LOG files
date_suffix=$(date +"%Y-%m-%d")
curr_dir=$(pwd)
LOG_PR_CREATED="${curr_dir}/pr_created_${date_suffix}.txt"
LOG_HAS_ACTION="${curr_dir}/has_action_${date_suffix}.txt"
LOG_DONT_HAVE_CITATION_CFF="${curr_dir}/dont_have_citation_cff${date_suffix}.txt"


urls=$1
if [ ! -f "$urls" ]; then
  usage
  exit 1
fi

# Get URLs
cat "$urls" | while read -r url
do
  echo "Processing $url"

  tmpdir=$(mktemp -d)
  cd $tmpdir
  git clone --quiet "$url" .
  # Check whether repo has CITATION.cff
  if [ ! -f "CITATION.cff" ];
  then
    echo "  CITATION.cff not found. Leaving."
    echo "$url" >> "$LOG_DONT_HAVE_CITATION_CFF"
    cd "$curr_dir"
    rm -rf "$tmpdir"
    continue
  fi

  # See if it is already using the GitHub action (-> NEW ISSUE update main from existing)
  if grep -i "cffconvert-github-action" .github/workflows/*.yml &> /dev/null; then
    echo "  CFF validation action appears to exist. Leaving."
    echo "$url" >> "$LOG_HAS_ACTION"
    cd "$curr_dir"
    rm -rf "$tmpdir"
    continue
  fi

  # Create commit with the .github/workflows/cffconvert.yml
  echo "  Creating action."
  mkdir -p .github/workflows
  if [ -f .github/workflows/cffconvert.yml ]; then
    echo "  File cffconvert.yml exists"
    echo "$url" >> "$LOG_HAS_CFFCONVERT_FILE"
    cd "$curr_dir"
    rm -rf "$tmpdir"
    continue
  fi
  cp "$curr_dir/.github/workflows/cffconvert.yml" .github/workflows/cffconvert.yml
  git add .github/workflows/cffconvert.yml
  git checkout -b cffconvert-github-action
  git config --local user.email "generalization@esciencecenter.nl"
  git config --local user.name "Generalization Team (@nlescgt)"
  git commit -m ":robot: Create cffconvert GitHub action for validation of CITATION.cff"

  # Create Pull Request
  export GITHUB_USER=nlescgt
  export GITHUB_TOKEN=$(cat $curr_dir/GITHUB_TOKEN)
  hub fork --remote-name GTremote
  git push --force GTremote cffconvert-github-action
  hub pull-request -m "$MESSAGE" -h nlescgt:cffconvert-github-action
  cd "$curr_dir"
  rm -rf "$tmpdir"
  echo "  Done."
  echo "$url" >> "$LOG_PR_CREATED"
done
