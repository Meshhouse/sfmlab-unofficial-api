# SFMLab unofficial API server

Unofficial SFMLab-based sites API server, written on Node.js, Typescript, TypeORM and Fastify.

## Supported sites

sfmlab.com, smutba.se, open3dlab.com

## How it works

You can run your private (or public) API **server**, however it doesn't save uploaded images or files to your server - only parsed text content. As far as creator of original site didn't created public API, we provide an alternative.

## Why I can't just parse by myself?

You can, but:
* You need to cache results, else response would be slow
* Original site can prevent from parsing by adding breaking changes - we don't guarantee that our solution works in 100% cases
* Some model information cannot be fetched on index page, so it leading to point 1

## Legal notice

This repository not affiliated with sfmlab.com, smutba.se and open3dlab.com.