import Url from "./utils/Url";

export default function loadPolyFill() {

  if (!('isConnected' in Node.prototype)) {
    Object.defineProperty(Node.prototype, 'isConnected', {
      get() {
        return (
          !this.ownerDocument ||
          !(
            this.ownerDocument.compareDocumentPosition(this) &
            this.DOCUMENT_POSITION_DISCONNECTED
          )
        );
      },
    });
  }

  if (!HTMLElement.prototype.append) {
    HTMLElement.prototype.append = function (...nodes) {
      nodes.map(node => {
        this.appendChild(node);
      });
    };
  }

  if (!HTMLElement.prototype.remove) {
    HTMLElement.prototype.remove = function () {
      this.parentElement.removeChild(this);
    };
  }

  Object.defineProperty(String.prototype, 'hashCode', {
    value: function () {
      let hash = 0;
      for (let i = 0; i < this.length; i++) {
        const chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return Math.abs(hash) + (hash < 0 ? 'N' : '');
    }
  });
}