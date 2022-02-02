# filtering

 Tool to discover github repos that could benefit from cffconvert-github-action.

## cffconvert.yml

```yml
name: cffconvert

on:
  push:
    paths:
      - CITATION.cff

jobs:
  validate:
    name: "validate"
    runs-on: ubuntu-latest
    steps:
      - name: Check out a copy of the repository
        uses: actions/checkout@v2

      - name: Check whether the citation metadata from CITATION.cff is valid
        uses: citation-file-format/cffconvert-github-action@2.0.0
        with:
          args: "--validate"

```
