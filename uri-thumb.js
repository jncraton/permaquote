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
