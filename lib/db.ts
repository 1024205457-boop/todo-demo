import { neon } from "@neondatabase/serverless";

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL 环境变量未设置，请在 .env.local 或部署环境中配置 DATABASE_URL"
    );
  }
  return connectionString;
}

// 延迟创建 Neon SQL 客户端，避免构建时检查环境变量
let sqlClient: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!sqlClient) {
    sqlClient = neon(getConnectionString());
  }
  return sqlClient;
}

// 导出 sql，使用 Proxy 来延迟初始化
export const sql = new Proxy({} as ReturnType<typeof neon>, {
  get(_target, prop) {
    const client = getSql() as any;
    return typeof client[prop] === "function"
      ? client[prop].bind(client)
      : client[prop];
  },
});

// 示例：封装一个简单的健康检查查询（可选）
export async function healthCheck() {
  // 对于 PostgreSQL，最简单的健康检查就是执行一条 SELECT 1
  const result = await sql`SELECT 1 as ok`;
  return result[0]?.ok === 1;
}


