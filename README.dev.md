# Developer documentation

**Summary:**

- Install node >= 14 (e.g., using `nvm`)
- Get GitHub token (tips: you don't need to add permissions, and set a short expiry date)
- Install Visual Studio Code and the plugin "EditorConfig for VSCode"
- Install Docker
- `docker pull citationcff/cffconvert:2.0.0`
- Install the node packages with `npm install`
- Run `node query.mjs`

## Setup

### Install node and npm

Install [`node`](https://nodejs.dev) Long Term Support (LTS), version 14 or greater.
You could use your system's package manager or [`nvm`](https://github.com/nvm-sh/nvm).
If you use `nvm`, you can install the latest LTS with

```
nvm install --lts
```

Install [`npm`](https://www.npmjs.com).

### GitHub token

Go to [https://github.com/settings/tokens](https://github.com/settings/tokens) and create a GitHub token.
You don't need to give it any permissions (we'll only read public information).
We also recommend setting an expiry date.
You only have one chance to copy it, so don't miss it.
But if you missed it, you can re-generate it.

Create an environment variable called `GITHUB_TOKEN` storing your token.
One simple way of doing this is adding the line

```bash
export GITHUB_TOKEN=<your token>
```

to your `.bashrc` or `.zshrc`.
You can, instead, add this line to a separate file, and `source` it only when needed.
For instance, create a `secret.txt` file with the line above, and when you need it, just write `source secret.txt`.
Finally, you can also save the token in whatever safe way you prefer (e.g., password manager), and run the `export` above only when working on the project.

### Editor

We use [Visual Studio Code](https://code.visualstudio.com) with the plugins "EditorConfig for VSCode".
This ensures that Visual Studio Code follows the configuration in `.editorconfig`.

### Docker

Install [Docker](https://www.docker.com), preferably configuring it to run as a non-root user.
Check your operating system's installation instructions.

We will use Docker to run the `cffconvert` image. Pull it:

```
docker pull citationcff/cffconvert:2.0.0
```

## Installation

Download the repository and install the node packages with

```
npm install
```

## Running

Run the script with

```
node query.mjs
```

## Reference documents

- [MDN Javascript reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference)
- [Octokit.js API](https://octokit.github.io/rest.js/v18/)
- [GitHub developer documentation - REST API](https://docs.github.com/en/rest)
