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
