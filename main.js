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

async function update() {
  let excerpt = await encode(text.value, 'deflate-raw')
  share.value =
    window.location.href.split('#')[0] + '#' + encodeURL(src.value) + ';' + encodeTitle(title.value) + ';' + excerpt
  len.textContent = share.value.length
  render()
}

function render() {
  const template = document.querySelector('#article').content.cloneNode(true)

  document.querySelector('main').appendChild(template)

  out_title.textContent = title.value || title.placeholder
  document.title = title.value || title.placeholder
  out_text.innerHTML = text.value.replaceAll('\n\n', '<p>') || text.placeholder
  out_date.datetime = date.value || ''
  out_date.textContent = date.value || ''

  let src_url = src.value || src.placeholder

  if (src_url.includes('#')) {
    original.href = src_url
  } else {
    let text_fragment = encodeURIComponent(text.value.slice(0, 50).replace(/\W*\w+$/, ''))
    original.href = src_url + '#:~:text=' + text_fragment
  }

  original.textContent = src_url.replace(/^https?:\/\/(www\.|)/, '')

  domain.href = src_url
  domain.textContent = original.textContent.replace(/\/.*$/, '')

  internet_archive.href = `https://web.archive.org/web/*/${src.value}`
  archive_today.href = `https://archive.today/${src.value}`
}

async function load() {
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', update)
  })

  let hash = location.hash.slice(1)
  if (document.location.href.length > 1800) {
    document.querySelector('main').textContent = 'URL too long'
    return
  }

  if (hash.length <= 1) {
    document.querySelector('form').style.display = 'block'
  } else {
    let [fsrc, ftitle, fdate, excerpt] = hash.split(';')
    src.value = decodeURL(fsrc)
    title.value = decodeTitle(ftitle)
    text.value = await decode(excerpt, 'deflate-raw')
    date.value = fdate
  }
  update()
}

addEventListener('load', load)
