# action-tagging

This action will read from any file (specified in yml file )from root and get value from version attribute and cross check with existing tags, then created new tag.

# Ussage

The following is an example .github/workflows/main.yml that will execute when a push to the master branch occurs.

```
name: My Workflow

on:
  push:
    paths:
    - build.gradle
    branches:
    - master

env:
  GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master
    - uses: ajay0688/action-tagging@master
      with:
        source_file: "build.gradle"
        tag_prefix: "v"
        extraction_regex: "version\\s*=\\s*\\d+.\\d+.\\d+"
```

To make this work, the workflow must have the checkout action before the autotag action.

This order is important!

- uses: actions/checkout@v2
- uses: ajay0688/action-tagging@master


# Configuration

To create tags, GITHUB_TOKEN need to be passed in as env variable.

NEVER HARD CODE THE SECRET in YAML FILE.

# Inputs

- source_file - tagging will look for the file in in this location. MANDATORY
- extraction_regex - regular expression for searching version. As an example : "version\\s*=\\s*\\d+.\\d+.\\d+"

- tag_prefix - A prefix can be used to add text before the tag name. For example, if tag_prefx is set to "v", then the tag would be labeled as "v1.0.0". as Default it's empty. OPTIONAL

- tag_message - This is a hard-coded message. OPTIONAL


# Credits

- Klemensas/action-autotag
- ButlerLogic/action-autotag
