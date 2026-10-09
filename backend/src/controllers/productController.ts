import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/**
 * GET /api/categories
 * Returns all active categories ordered by sort order
 */
export async function getCategories(_req: Request, res: Response): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        sortOrder: true
      }
    });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve categories"
    });
  }
}

/**
 * GET /api/products
 * Returns all active products with their active variants and category info
 * Query parameters:
 *  - categoryId: Filter by category UUID
 *  - search: Search by product name
 */
export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const { categoryId, search } = req.query;

    const whereClause: Record<string, unknown> = {
      isActive: true
    };

    if (categoryId && typeof categoryId === "string") {
      whereClause.categoryId = categoryId;
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      whereClause.name = {
        contains: search.trim(),
        mode: "insensitive"
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            sortOrder: true
          }
        },
        variants: {
          where: { isActive: true },
          orderBy: { size: "asc" },
          select: {
            id: true,
            size: true,
            price: true,
            isActive: true
          }
        }
      },
      orderBy: [
        { category: { sortOrder: "asc" } },
        { name: "asc" }
      ]
    });

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve products"
    });
  }
}
