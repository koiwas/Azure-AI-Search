const axios = require('axios');
const { AzureOpenAIEmbeddings } = require('@langchain/openai');

class AISearchClient {
    constructor() {
        this.serviceName = process.env.AZURE_AISEARCH_SERVICE_NAME;
        this.apikey = process.env.AZURE_AISEARCH_ADMIN_KEY;
        this.indexName = process.env.AZURE_AISEARCH_INDEX_NAME;

        this.url = new URL(`https://${this.serviceName}.search.windows.net`)
        this.url.searchParams.append('api-version', '2024-07-01');
    }

    async searchText(text, options = {}){
        this.url.pathname = `/indexes/${this.indexName}/docs/search`;

        const res = await axios({
            method: 'POST',
            url: this.url.toString(),
            headers: {
                'Content-Type': 'application/json',
                'api-key': this.apikey,
            },
            data: {
                search: text,
                select: 'id, title',
                ...options
            }
        });
        return res;
    }

    async searchVector(text, options = {}){
        this.url.pathname = `/indexes/${this.indexName}/docs/search`;

        const model = new AzureOpenAIEmbeddings({
            azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
            azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
            azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_EMBED_DEPLOYMENT_NAME,
            azureOpenAIApiVersion: process.env.AZURE_OPENAI_EMBED_API_VERSION
        });

        const vector = await model.embedQuery(text);

        const res = await axios({
            method: 'POST',
            url: this.url.toString(),
            headers: {
                'Content-Type': 'application/json',
                'api-key': this.apikey,
            },
            data: {
                count: true,
                search: text,
                vectorQueries: [{
                    kind: 'vector',
                    vector: vector,
                    k: 5,
                    fields: 'contentVector',
                    exhaustive: true,
                    weight: 0.5
                }],
                select: 'id, title, content',
                ...options
            }
        });
        return res;
    }
}

module.exports = {
    AISearchClient
};
