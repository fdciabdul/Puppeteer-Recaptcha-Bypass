const axios = require('axios');

module.exports = async function apiCall(audioBytes, apiKey) {
  return await axios.post('https://api.wit.ai/speech?v=20220622', new Uint8Array(audioBytes), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'audio/mpeg3'
    }
  });
};
