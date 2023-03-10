import express from 'express';
import Keyv from 'keyv';
import { KeyvFile } from 'keyv-file';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const jsonDbFileName = 'db1.json';
const jsonDbFileName = './data/shortened-url.json';

String.prototype.hashCode = function() {
  var hash = 0,
    i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// More options with default value:
const customKeyv1 = new Keyv({
  store: new KeyvFile({
    // filename: `db1.json`, // the file path to store the data
    filename: jsonDbFileName, // the file path to store the data
    // expiredCheckDelay: 24 * 3600 * 1000, // ms, check and remove expired data in each ms
    writeDelay: 100, // ms, batch write to disk in a specific duration, enhance write performance.
    encode: JSON.stringify, // serialize function
    decode: JSON.parse, // deserialize function
    namespace: 'customKeyv1'
  }),
})

app.get('/url/:hashId', async (req, res) => {
  console.log(req.params.hashId);
  const { hashId } = req.params;
  const x1 = await customKeyv1.get(hashId);
  res.send(x1);
})

app.post('/url', async (req, res, next) => {
  // console.log({body: req.body});
  if (!req.body) return;
  const urlValue = req.body.urlValue;
  if (!urlValue) return;
  const urlHash = urlValue.hashCode();
  const status = await customKeyv1.set(urlHash, urlValue);
  res.send({
    status,
    urlHash,
    urlValue,
  });
  // res.send(status);
  // res.send('Got a POST request at /user')
})

app.listen(5000, () => {
  console.log('listening on port 5000')
  console.log('http://localhost:5000')
})

