# Fork of webmention.app

This forked version of [webmention.app](https://github.com/remy/wm). It is deployed to [Netlify](https://netlify.com) and uses a [function](https://functions.netlify.com/) to receive requests.

## Changes
- Add Netlify functions support ([check.js](https://github.com/benjifs/wm/blob/feat/netlify/functions/check.js))
- Add support for parsing links in `h-entry` but outside `e-content` ([4d856e5](https://github.com/benjifs/wm/commit/4d856e568f0e7002837cd42dc63e6f5bb9c69f47)). [PR #31](https://github.com/remy/wm/pull/31).
- Remove `limit` in `getEndpoints` ([58c9312](https://github.com/benjifs/wm/commit/58c931294c68002991de5d26a1a1eccbd6544d3b)). [Issue #66](https://github.com/remy/wm/issues/66).

## Usage

To check for webmentions:

**`GET`** https://webmention.netlify.app/check?url=:url

To send webmentions:

**`POST`** https://webmention.netlify.app/check?url=:url

You can also install this fork for your project with:

```sh
npm install @benjifs/wm
```

Everything below is from the original README for the project.

---

## Automate your outgoing webmentions

[webmention.app](https://webmention.app) is a platform agnostic service that will check a given URL for links to other sites, discover if they support webmentions, then send a webmention to the target.

This repository also includes a stand alone command line tool that doesn't rely on [webmention.app](https://webmention.app) at all and doesn't require a token - so you can run it locally with the knowledge that if your site outlives this one, the tool will still work.

### Installation

The tool uses nodejs and once nodejs is installed, you can install the tool using:

```
$ npm install @remy/webmention
```

This provides an executable under the command webmention (also available as wm). Default usage allows you to pass a filename (like a newly generated RSS feed) or a specific URL. It will default to the 10 most recent entries found (using item for RSS and `h-entry` for HTML).

### Usage

By default, the command will perform a dry-run/discovery only. To complete the notification of webmentions use the `--send` flag.

The options available are:

- `--send` (default: false) send the webmention to all valid endpoints
- `--limit n` (default: 10) limit to n entries found
- `--debug` (default: false) print internal debugging
Using npx you can invoke the tool to read the latest entry in your RSS feed:

```
$ npx webmention https://yoursite.com/feed.xml --limit 1 --send
```

Alternatively, you can make the tool part of your build workflow and have it execute during a postbuild phase:

```json
{
  "scripts": {
    "postbuild": "webmention dist/feed.xml --limit 1 --send"
  }
}
```

## Misc

- Further documentation found on [webmention.app/docs](https://webmention.app/docs)
- Built by [@rem](https://remysharp.com)
- MIT / [rem.mit-license.org](https://rem.mit-license.org/)
