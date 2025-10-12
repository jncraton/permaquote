Promise.resolve(new Blob([getSelection().toString()]).stream())
  .then(s => s.pipeThrough(new CompressionStream('deflate-raw')))
  .then(s => new Response(s))
  .then(res => res.blob())
  .then(blob => blob.arrayBuffer())
  .then(buf => btoa(String.fromCharCode(...new Uint8Array(buf))))
  .then(ex => {
    let u =
      'https://jncraton.github.io/permaquote/#' +
      encodeURIComponent(document.location.href)
        .replace(new RegExp('%3A', 'g'), ':')
        .replace(new RegExp('%2F', 'g'), '/') +
      ';' +
      encodeURIComponent(document.title).replace(new RegExp('%20', 'g'), '+') +
      ';' +
      ex
    prompt('Sharable URL', u)
  })
