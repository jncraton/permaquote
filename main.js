async function encode(text, algo) {
  let stream = new Blob([text]).stream()

  if (algo) {
    stream = stream.pipeThrough(new CompressionStream(algo))
  }
  const res = await new Response(stream)

  const blob = await res.blob()
  const buffer = await blob.arrayBuffer()

  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

async function decode(text, algo) {
  const binary = Uint8Array.from(atob(text), c => c.charCodeAt(0))

  let stream = new Blob([binary]).stream()

  if (algo) {
    stream = stream.pipeThrough(new DecompressionStream(algo))
  }

  const res = await new Response(stream)
  const blob = await res.blob()
  return await blob.text()
}

function encodeURL(url) {
  url = encodeURIComponent(url)
  url = url.replace(/%2F/g, '/')
  url = url.replace(/%3A/g, ':')
  return url
}

function decodeURL(url) {
  url = decodeURIComponent(url)
  return url
}

function encodeTitle(title) {
  title = encodeURIComponent(title)
  title = title.replace(/%20/g, '+')
  return title
}

function decodeTitle(title) {
  title = decodeURIComponent(title)
  return title.replaceAll('+', ' ')
}

async function decodeHash(hash) {
  let [src, title, date, excerpt] = hash.split(';')

  return {
    src: decodeURL(src),
    title: decodeTitle(title),
    text: await decode(excerpt, 'deflate-raw'),
    date: date,
  }
}

async function update() {
  let excerpt = await encode(text.value, 'deflate-raw')
  let hash = [encodeURL(src.value), encodeTitle(title.value), encodeURIComponent(date.value), excerpt].join(';')
  share.value = window.location.href.split('#')[0] + '#' + hash

  len.textContent = share.value.length
  render(hash)
}

async function render(hash) {
  const template = document.querySelector('#article').content.cloneNode(true)

  let src_url, text
  ;({
    src: src_url,
    title: template.querySelector('h2').textContent,
    text: text,
    date: template.querySelector('time').datetime,
  } = await decodeHash(hash))

  template.querySelector('blockquote').innerHTML = text
  document.title = template.querySelector('h2').textContent
  template.querySelector('time').textContent = template.querySelector('time').datetime

  let text_fragment = encodeURIComponent(text.slice(0, 50).replace(/\W*\w+$/, ''))
  template.querySelectorAll('a').forEach(a => {
    if (!src_url.includes('#') && !a.href) {
      a.href = src_url + '#:~:text=' + text_fragment
    } else {
      a.href += src_url
    }

    if (!a.textContent) {
      a.textContent = src_url.replace(/^https?:\/\/(www\.|)/, '')
    }
  })

  document.querySelector('article').replaceWith(template)
}

async function load() {
  let hash = location.hash.slice(1)
  if (document.location.href.length > 1800) {
    document.querySelector('main').textContent = 'URL too long'
    return
  }

  if (hash.length <= 1) {
    const form = document.querySelector('#form').content.cloneNode(true)
    document.querySelector('main').prepend(form)

    document.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', update)
    })

    update()
  } else {
    render(hash)
  }
}

addEventListener('load', load)
