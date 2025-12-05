import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL 环境变量未设置，请在 .env.local 或部署环境中配置 DATABASE_URL"
  );
}

// 创建 Neon SQL 客户端
export const sql = neon(connectionString);

// 示例：封装一个简单的健康检查查询（可选）
export async function healthCheck() {
  // 对于 PostgreSQL，最简单的健康检查就是执行一条 SELECT 1
  const result = await sql`SELECT 1 as ok`;
  return result[0]?.ok === 1;
}


