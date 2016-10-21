# Badge print

Reads conference participants from Excel file, sorts by name,
normalizes information about them and creates a PDF with a badge
per participant

### Usage


1. Run `npm install`
2. Download the XLS from hoopla.no
3. Run `node index.js`

### Current issues:

* Many names are too long and break over two lines
* Because of this, I made the QR code very small
* Some talks names are too long
* A few users don't have calculable company names
