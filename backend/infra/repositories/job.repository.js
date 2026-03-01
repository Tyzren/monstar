const NotionProvider = require('@providers/notion.provider');

class JobRepository {
    static async findAll() {
        return await NotionProvider.fetchDatabase();
    }
}