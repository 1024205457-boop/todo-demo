import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

type Todo = {
  id: number;
  content: string;
  completed: boolean;
  created_at: string;
};

// GET /api/todos - 获取所有待办，按创建时间倒序
export async function GET() {
  try {
    const todos = await sql<Todo[]>`
      SELECT id, content, completed, created_at
      FROM todos
      ORDER BY created_at DESC
    `;

    return NextResponse.json(todos, { status: 200 });
  } catch (error) {
    console.error("GET /api/todos error:", error);
    return NextResponse.json(
      { message: "获取待办列表失败" },
      { status: 500 }
    );
  }
}

// POST /api/todos - 创建新待办
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json(
        { message: "content 不能为空" },
        { status: 400 }
      );
    }

    const inserted = await sql<Todo[]>`
      INSERT INTO todos (content, completed)
      VALUES (${content}, false)
      RETURNING id, content, completed, created_at
    `;

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/todos error:", error);
    return NextResponse.json(
      { message: "创建待办失败" },
      { status: 500 }
    );
  }
}

// PATCH /api/todos - 更新完成状态
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = Number(body?.id);
    const completed = body?.completed;

    if (!Number.isInteger(id) || typeof completed !== "boolean") {
      return NextResponse.json(
        { message: "请求参数不合法，需要 { id: number, completed: boolean }" },
        { status: 400 }
      );
    }

    const updated = await sql<Todo[]>`
      UPDATE todos
      SET completed = ${completed}
      WHERE id = ${id}
      RETURNING id, content, completed, created_at
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { message: "对应的待办不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error("PATCH /api/todos error:", error);
    return NextResponse.json(
      { message: "更新待办状态失败" },
      { status: 500 }
    );
  }
}


