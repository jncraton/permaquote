# permaquote

[![Lint](https://github.com/jncraton/permaquote/actions/workflows/lint.yml/badge.svg)](https://github.com/jncraton/permaquote/actions/workflows/lint.yml)
[![Test](https://github.com/jncraton/permaquote/actions/workflows/test.yml/badge.svg)](https://github.com/jncraton/permaquote/actions/workflows/test.yml)
[![Deploy](https://github.com/jncraton/permaquote/actions/workflows/deploy.yml/badge.svg)](https://github.com/jncraton/permaquote/actions/workflows/deploy.yml)

Permanent URLs for cited quotes

## Purpose

Create permanent, lightweight web pages for quotes that cite and link back to their original source.

The URL for a webpage should be the ideal way to link to its content. URLs [shouldn't change](https://jncraton.github.io/permaquote/#https://www.w3.org/Provider/Style/URI;Cool+URIs+don't+change;2025-10-13;dZFNTsQwDIWv4gOMegXEggW7EQKx9iRuE5rYUX6m9PbYZZBAIxZNE9vx9/zyzNADSd1P9gcvGSMDYyZoBR2BbEzV1vZPAbK3TKVZqp5SgreX5wZaFPsET5+OStdTk3Qldsph6SHyAqWSRvp932/kXCXDSlSs1kosN8Gj4uKP6COuuJuUwV4v7jLqn35REdJV2f67wgn3KukETSwADhkyrlreARu0jpdEtrNkiquyz5V63yEPFw6ysLZcRDxUwiYMagGgst3IOplSwceGpRDe5rFb73Q5JAXsx9lJLsg7bCFqXxve31myWTsZ+s1wGS0ytQYKM9EskIQXnQtnFeANa74dTRrVq2bqYFYfJ3gNxEraAfWxjmez+bPxPfKSzGxd1nYzGTapyT/AGesBV3NU+8doHRK61UL27j3IWEKfvgA=), and pages associated with large organizations should be available on a nearly permanent basis. Reality looks quite different. Pages disappear with time and we experience [link rot](https://jncraton.github.io/permaquote/#https://en.wikipedia.org/wiki/Link_rot;Link+Rot;2025-10-13;TY6xCsIwFEV/5S7iUoq2Cq4Obg5SEOeQvDaPpi8lL9LfNy2IThcunMN50IKOlEyyHn18i0P2JldgQXNo2grtZYfYYzYDKfoUp/IfWywkGROrsgw1rkHjH3M+bcxNhsDq8eKRZ3JsYFJmG4rIGwcDR2UCy7ii2RP2iXpKJJZ0DyWbOQpMiWrazSi06E+yklSC41f17O71Bw==). Additionally, pages may have become overwhelmed with ads or locked behind paywalls making a simple link less than ideal for viewing the intended relevant content.

Permaquote attempts to address this in a few ways:

1. Users can generate permanent URLs that directly link to a quote or excerpt from a page. These URLs will never change.
2. The source and content of the page is embedded in the link itself. Permaquote does not have access to any data shared with this service. The source, date, and quote contents can be derived directly from the link microformat without sending an HTTP request.
3. Direct links to the source page are provided if a viewer would like to attempt to click through to the full context.
4. Links to archival services are also provided if the original page is no longer available.

## Microformat

The URLs used by permaquote leverage a microformat within the URL fragment to represent all required data.

```
baseurl#https://example.com/page1;Example+Page;2000-01-02;{quote content compressed using 'deflate-raw'}
```

This format allows the original source to be seen in plain text along with its access date so that it can be properly reconstructed from archives if needed. It also directly encodes the original excerpt for easy, immediate viewing.

## Bookmarklet

This tool can be accessed to quickly quote the current selection on a page by clicking <a href="javascript:Promise.resolve(new Blob([getSelection().toString()]).stream()).then(s=>s.pipeThrough(new CompressionStream('deflate-raw'))).then(s=>new Response(s)).then(res=>res.blob()).then(blob=>blob.arrayBuffer()).then(buf=>btoa(String.fromCharCode(...new Uint8Array(buf)))).then(ex=>{let u='https://jncraton.github.io/permaquote/#'+encodeURIComponent(document.location.href).replace(new%20RegExp('%253A','g'),':').replace(new%20RegExp('%252F','g'),'/')+';'+encodeURIComponent(document.title).replace(new%20RegExp('%2520','g'),'+')+';'+(new%20Date().toISOString().slice(0,10))+';'+ex;prompt('Sharable%20URL',u)}));">this bookmarklet</a>.