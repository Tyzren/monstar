const NotionProvider = require('@providers/notion.provider');

class JobRepository {
    static async findAll() {
        return await NotionProvider.fetchDatabase();
    }

    static async findByStatus(status) {
        const all = await this.findAll();
        return all.filter(job => job['Status']?.toUpperCase() === status.toUpperCase());
    }
}