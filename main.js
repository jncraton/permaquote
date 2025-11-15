class URIAnchor extends HTMLElement {
  static observedAttributes = ['uri']

  constructor() {
    super()
    const a = document.createElement('a')
    a.textContent = this.textContent
    this.replaceChildren(a)
  }

  connectedCallback() {
    this.attributeChangedCallback()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const uri = this.attributes.uri.value
    const a = this.querySelector('a')

    if (this.textContent) {
      a.textContent = this.textContent
    }

    if (uri.startsWith('http')) {
      if (this.attributes['href-web-fmt']?.value) {
        a.href = this.attributes['href-web-fmt']?.value.replaceAll('{url}', uri)
      } else {
        a.href = uri
      }

      if (!a.textContent) {
        a.textContent = uri.replace(/^https?:\/\/(www\.|)/, '')
      }
    }

    if (uri.startsWith('urn:isbn:')) {
      const isbn = uri.slice(9)

      if (this.attributes['href-isbn-fmt']?.value) {
        a.href = this.attributes['href-isbn-fmt']?.value.replace('{isbn}', isbn)
      } else {
        a.href = `https://openlibrary.org/isbn/${isbn}`
      }

      if (!a.textContent) {
        a.textContent = `ISBN: ${isbn}`
      }
    }
  }
}

customElements.define('uri-anchor', URIAnchor)

const algos = {
  d: 'deflate-raw',
  '+': 'url',
}

async function encode(text) {
  let enc = encoding.value

  if (enc == '+') {
    return '+' + encodeTitle(text)
  }

  let algo = algos[enc]

  let stream = new Blob([text]).stream()

  if (algo) {
    stream = stream.pipeThrough(new CompressionStream(algo))
  }
  const res = await new Response(stream)

  const blob = await res.blob()
  const buffer = await blob.arrayBuffer()

  return enc + btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

async function decode(text) {
  let algo = algos[text[0]]
  text = text.slice(1)

  if (algo == 'url') return decodeTitle(text)

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
    src: src ? decodeURL(src) : '',
    title: title ? decodeTitle(title) : '',
    text: excerpt ? await decode(excerpt) : '',
    date: date ? decodeTitle(date) : '',
  }
}

async function update() {
  let excerpt = await encode(text.value)
  let hash = [encodeURL(src.value), encodeTitle(title.value), encodeURIComponent(date.value), excerpt].join(';')
  share.value = window.location.href.split('#')[0] + '#' + hash

  len.textContent = share.value.length + ' bytes'
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

  text = '<p>' + text.split('\n\n').join('<p>')

  template.querySelector('blockquote').innerHTML = text
  document.title = template.querySelector('h2').textContent
  template.querySelector('time').textContent = template.querySelector('time').datetime

  let text_fragment = encodeURIComponent(text.slice(0, 50).replace(/\W*\w+$/, ''))
  template.querySelectorAll('uri-anchor,uri-thumb,uri-info').forEach(el => {
    el.setAttribute('uri', src_url)
  })

  template.querySelectorAll('details p').forEach(el => {
    if (src_url.startsWith(el.dataset.uriScheme)) {
      el.style.display = 'revert'
    }
  })

  document.querySelector('article').replaceWith(template)
}

async function showEdit() {
  if (!document.querySelector('main form')) {
    document.querySelector('main').prepend(document.querySelector('#form').content.cloneNode(true))
    let form = document.querySelector('main form')

    document.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('input', update)
    })
    ;({
      src: form.querySelector('#src').value,
      title: form.querySelector('#title').value,
      text: form.querySelector('#text').value,
      date: form.querySelector('#date').value,
    } = await decodeHash(location.hash.slice(1)))

    update()
  }
}

async function load() {
  let hash = location.hash.slice(1)
  if (document.location.href.length > 1800) {
    document.querySelector('main').textContent = 'URL too long'
    return
  }

  if (hash.length <= 1) {
    showEdit()
  } else {
    render(hash)

    document.addEventListener('keydown', event => {
      if (event.key === 'i') {
        showEdit()
      }
    })
  }
}

addEventListener('load', load)
