class URIThumb extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.attributeChangedCallback()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.attributes.uri?.value.startsWith('urn:isbn:')) {
      const isbn = this.attributes.uri?.value.slice(9)

      if (!this.shadowRoot.querySelector('img')) {
        this.shadowRoot.appendChild(document.createElement('img'))
      }

      this.shadowRoot.querySelector('img').src = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`
      this.shadowRoot.querySelector('img').height = 192
    }
  }
}

customElements.define('uri-thumb', URIThumb)

class URIAnchor extends HTMLElement {
  static observedAttributes = ['uri']

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.appendChild(document.createElement('a'))
  }

  connectedCallback() {
    this.attributeChangedCallback()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const uri = this.attributes.uri.value
    const a = this.shadowRoot.querySelector('a')

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
      }

      if (!a.textContent) {
        a.textContent = `ISBN: ${isbn}`
      }
    }
  }
}

customElements.define('uri-anchor', URIAnchor)

class URIInfo extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.attributeChangedCallback()
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (this.attributes.uri?.value.startsWith('urn:isbn:')) {
      const isbn = this.attributes.uri?.value.slice(9)
      const p = document.createElement('p')
      p.textContent = `Loading metadata...`
      this.shadowRoot.replaceChildren(p)
      try {
        const res = await fetch(`https://openlibrary.org/search.json?q=isbn:${isbn}`)
        const result = await res.json()

        const title = result.docs[0].title
        const author = result.docs[0].author_name[0]
        const year = result.docs[0].first_publish_year

        p.textContent = ` ${year} ${author}`
      } catch {
        p.textContent = `Unable to load metadata`
      }
    }
  }
}

customElements.define('uri-info', URIInfo)

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
