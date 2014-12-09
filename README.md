# Gnomenclature

A tiny web app to help you practice inorganic chemical nomenclature.
Try it at http://gnomenclature.bencook.ca.

Written by Ben Cook <b@bencook.ca>.

*Note: This was written for a Canadian Grade 12 chemistry course and I haven't really
studied chem since, so it's not guaranteed to be either correct or challenging.*

## Installation

This is a tiny [Node.js](https://nodejs.org) app packaged for an easy NPM install.

If you don't have Node installed, go do that and come back. It's ok, I'll be here.
[Sass](http://sass-lang.com) will be needed as well if you want to edit the CSS,
although the Sass-rendered CSS is available in the repo as well.

1. `git clone https://github.com/blx/gnomenclature`
2. `cd gnomenclature`
3. `npm install`

Now `./watch` will run a development environment, serving the site on localhost:3000
and having Sass watch for changes and automatically regenerate the CSS.

Alternatively, just `node gnne.js` will spin up the server.

There is a `Procfile` for Heroku deployment.

## Licence
The ISC License (ISC)

Copyright (c) 2014 Benjamin Cook

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee
is hereby granted, provided that the above copyright notice and this permission notice appear in all 
copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE 
INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE 
LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING 
FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS 
ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
