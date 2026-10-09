import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface MenuItem {
  name: string;
  description?: string;
  variants: {
    size: string | null;
    price: number;
  }[];
}

interface MenuCategory {
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

const menuData: MenuCategory[] = [
  {
    name: "Iced Coffee",
    sortOrder: 1,
    items: [
      {
        name: "Spanish Latte",
        variants: [
          { size: "12oz", price: 69 },
          { size: "16oz", price: 79 }
        ]
      },
      {
        name: "Oreo Latte",
        variants: [
          { size: "12oz", price: 75 },
          { size: "16oz", price: 89 }
        ]
      },
      {
        name: "Salted Caramel",
        variants: [
          { size: "12oz", price: 75 },
          { size: "16oz", price: 89 }
        ]
      },
      {
        name: "White Mocha",
        variants: [
          { size: "12oz", price: 69 },
          { size: "16oz", price: 79 }
        ]
      },
      {
        name: "Vanilla Latte",
        variants: [
          { size: "12oz", price: 75 },
          { size: "16oz", price: 79 }
        ]
      },
      {
        name: "Hazelnut Latte",
        variants: [
          { size: "12oz", price: 75 },
          { size: "16oz", price: 89 }
        ]
      },
      {
        name: "Butterscotch",
        variants: [
          { size: "12oz", price: 75 },
          { size: "16oz", price: 89 }
        ]
      },
      {
        name: "Biscoff Latte",
        variants: [
          { size: "12oz", price: 89 },
          { size: "16oz", price: 110 }
        ]
      },
      {
        name: "Caramel Macchiato",
        variants: [
          { size: "12oz", price: 75 },
          { size: "16oz", price: 89 }
        ]
      }
    ]
  },
  {
    name: "Milky Based Drinks",
    sortOrder: 2,
    items: [
      {
        name: "Biscoff Milk",
        variants: [
          { size: "12oz", price: 89 },
          { size: "16oz", price: 99 }
        ]
      },
      {
        name: "Milky Oreo",
        variants: [
          { size: "12oz", price: 75 },
          { size: "16oz", price: 89 }
        ]
      },
      {
        name: "Oreo Biscoff",
        variants: [
          { size: "12oz", price: 89 },
          { size: "16oz", price: 110 }
        ]
      },
      {
        name: "Strawberry",
        variants: [
          { size: "12oz", price: 75 },
          { size: "16oz", price: 79 }
        ]
      }
    ]
  },
  {
    name: "Matcha",
    sortOrder: 3,
    items: [
      {
        name: "Oreo Matcha",
        variants: [
          { size: "12oz", price: 89 },
          { size: "16oz", price: 110 }
        ]
      },
      {
        name: "Dirty Matcha",
        variants: [
          { size: "12oz", price: 79 },
          { size: "16oz", price: 99 }
        ]
      },
      {
        name: "Matcha Latte",
        variants: [
          { size: "12oz", price: 75 },
          { size: "16oz", price: 89 }
        ]
      },
      {
        name: "Matcha Berry",
        variants: [
          { size: "12oz", price: 89 },
          { size: "16oz", price: 99 }
        ]
      },
      {
        name: "Biscoff Matcha",
        variants: [
          { size: "12oz", price: 89 },
          { size: "16oz", price: 110 }
        ]
      }
    ]
  },
  {
    name: "Snacks",
    sortOrder: 4,
    items: [
      {
        name: "French Fries",
        variants: [{ size: null, price: 55 }]
      },
      {
        name: "Siomai (3 pcs)",
        variants: [{ size: null, price: 20 }]
      },
      {
        name: "Nachos",
        variants: [{ size: null, price: 75 }]
      },
      {
        name: "Cheesy Burger",
        variants: [{ size: null, price: 65 }]
      },
      {
        name: "Chick N' Fries",
        variants: [{ size: null, price: 99 }]
      }
    ]
  }
];

async function main() {
  console.log("🌱 Starting Blaise Café database seeding...");

  for (const catData of menuData) {
    const category = await prisma.category.upsert({
      where: { name: catData.name },
      update: { sortOrder: catData.sortOrder },
      create: {
        name: catData.name,
        sortOrder: catData.sortOrder
      }
    });

    console.log(`📁 Category: ${category.name}`);

    for (const item of catData.items) {
      let product = await prisma.product.findFirst({
        where: {
          name: item.name,
          categoryId: category.id
        }
      });

      if (!product) {
        product = await prisma.product.create({
          data: {
            name: item.name,
            categoryId: category.id,
            description: item.description || null
          }
        });
      }

      for (const variant of item.variants) {
        const existingVariant = await prisma.productVariant.findFirst({
          where: {
            productId: product.id,
            size: variant.size
          }
        });

        if (!existingVariant) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              size: variant.size,
              price: variant.price
            }
          });
        } else {
          await prisma.productVariant.update({
            where: { id: existingVariant.id },
            data: { price: variant.price }
          });
        }
      }

      console.log(`  ☕ Added: ${item.name} (${item.variants.length} variant(s))`);
    }
  }

  console.log("✅ Blaise Café menu seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
