const NotionProvider = require('@providers/notion.provider');

class JobRepository {
  static async findAll() {
    return await NotionProvider.fetchDatabase();
  }

  static async findByStatus(status) {
    const all = await this.findAll();
    return all.filter(
      (job) => job['Status']?.toUpperCase() === status.toUpperCase()
    );
  }

  static async findById(id) {
    const all = await this.findAll();
    return all.find((job) => job.id === id) ?? null;
  }

  static async findByRoleType(roleType) {
    const all = await this.findAll();
    const target = roleType.toLowerCase();
    return all.filter((job) =>
      (job['Role Type'] || []).some((rt) => rt.toLowerCase() === target)
    );
  }
}

module.exports = JobRepository;
