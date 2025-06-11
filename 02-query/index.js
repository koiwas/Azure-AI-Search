const { AISearchClient } = require('./aisearchclient');

(async () => {
    const client = new AISearchClient();
    const res = await client.searchVector('課題', { top: 3 });
    console.log(JSON.stringify(res.data, null, 2));
})();
