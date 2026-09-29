import 'dotenv/config';

const trimSlash = (s = '') => s.replace(/\/+$/, '');

export const config = {
  port: Number(process.env.PORT) || 3001,
  clientUrl: trimSlash(process.env.CLIENT_URL || 'http://localhost:4321/museum_sun'),
  publicServerUrl: trimSlash(process.env.PUBLIC_SERVER_URL || `http://localhost:${process.env.PORT || 3001}`),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:4321')
    .split(',')
    .map((s) => trimSlash(s.trim()))
    .filter(Boolean),

  astra: {
    endpoint: process.env.ASTRA_DB_API_ENDPOINT || '',
    token: process.env.ASTRA_DB_APPLICATION_TOKEN || '',
    keyspace: process.env.ASTRA_DB_KEYSPACE || 'default_keyspace'
  },

  liqpay: {
    publicKey: process.env.LIQPAY_PUBLIC_KEY || '',
    privateKey: process.env.LIQPAY_PRIVATE_KEY || '',
    sandbox: process.env.LIQPAY_SANDBOX !== '0'
  },

  monobank: {
    token: process.env.MONO_TOKEN || ''
  }
};

export const paymentMethods = () => ({
  liqpay: Boolean(config.liqpay.publicKey && config.liqpay.privateKey),
  monobank: Boolean(config.monobank.token),
  cash: true
});
