import ImageKit from '@imagekit/nodejs';
import 'dotenv/config'

const ikInstance = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Provide backward-compatible upload and url methods for @imagekit/nodejs v7
const imagekit = Object.assign(ikInstance, {
  upload: async (options) => {
    const opts = { ...options };
    if (opts.file && Buffer.isBuffer(opts.file)) {
      opts.file = opts.file.toString('base64');
    }
    return await ikInstance.files.upload(opts);
  },
  url: (options = {}) => {
    const endpoint = (options.urlEndpoint || process.env.IMAGEKIT_URL_ENDPOINT || '').replace(/\/$/, '');
    let src = options.src;
    if (!src && options.path) {
      src = `${endpoint}/${options.path.replace(/^\//, '')}`;
    }
    if (ikInstance.helper && typeof ikInstance.helper.buildSrc === 'function' && src) {
      try {
        const built = ikInstance.helper.buildSrc({
          ...options,
          urlEndpoint: endpoint,
          src
        });
        if (built) return built;
      } catch (err) {}
    }
    return src || endpoint;
  }
});

export default imagekit
