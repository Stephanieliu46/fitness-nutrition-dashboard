import { NextResponse } from "next/server";
import { getFoodDatabase, searchFoods } from "@/lib/nutrition";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const foods = await getFoodDatabase();
  const results = query ? searchFoods(query, foods) : foods;
  return NextResponse.json(results);
}
