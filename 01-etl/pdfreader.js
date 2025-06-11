// EventEmitterをインポート
const {EventEmitter} = require('events');

// EventEmitterを継承
class Reader extends EventEmitter {
  constructor() {
    super();
  }

  // 指定されたファイルパスのPDFファイルを非同期で読み取るメソッド
  async read(filepath) {
    const {PdfReader} = await import('pdfreader');
    const reader = new PdfReader();

    var pageNumber = 0;
    var lineHeight = 0;
    var text = '';

    reader.parseFileItems(filepath, (err, item) => {
      if (err) {
        console.error(err);
        return;
      }

      if (!item) {
        this.emit('page', { pageNumber, text });
        this.emit('done');
      } else if (item.page) {
        pageNumber && this.emit('page', { pageNumber, text });
        pageNumber = item.page;
        lineHeight = 0;
        text = '';
      } else if (item.text) {
        if (lineHeight === item.y || !lineHeight) {
          text += item.text;
        } else {
          text += '\n' + item.text;
        }
        lineHeight = item.y;
      }
    });
  }
}

// ReaderクラスをPdfReaderクラスとしてエクスポート
module.exports = {
  PdfReader: Reader
};
