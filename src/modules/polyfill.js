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

}