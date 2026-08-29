import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean up any existing data
  await prisma.kioskSession.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.demoUser.deleteMany({});
  await prisma.fraudCheck.deleteMany({});

  // Seed the Demo User
  const demoUser = await prisma.demoUser.create({
    data: {
      customerId: "SBK001",
      pinHash: "1234", // Storing plaintext for simple demo authentication
      name: "Aarav Sharma",
      balance: 25430.0,
      savingsBalance: 20430.0,
      pendingBalance: 1500.0,
    },
  });

  console.log(`Created user: ${demoUser.name} (${demoUser.customerId})`);

  // Seed Transactions
  const transactions = [
    {
      description: "Monthly Salary Credit",
      category: "Salary",
      amount: 30000.0,
      type: "CREDIT",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      description: "Electricity Bill Payment",
      category: "Bills",
      amount: 750.0,
      type: "DEBIT",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      description: "Grocery Shopping (Supermarket)",
      category: "Groceries",
      amount: 650.0,
      type: "DEBIT",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      description: "House Rent",
      category: "Bills",
      amount: 8000.0,
      type: "DEBIT",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
    {
      description: "Mobile Recharge",
      category: "Bills",
      amount: 399.0,
      type: "DEBIT",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
    {
      description: "Savings Interest Credit",
      category: "Salary",
      amount: 150.0,
      type: "CREDIT",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      description: "Coffee Shop",
      category: "Entertainment",
      amount: 120.0,
      type: "DEBIT",
      date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        userId: demoUser.id,
        description: tx.description,
        category: tx.category,
        amount: tx.amount,
        type: tx.type,
        date: tx.date,
      },
    });
  }

  // Pre-seed some default Fraud messaging checks for testing
  await prisma.fraudCheck.create({
    data: {
      messageText:
        "Your bank account will be blocked today. Click this link immediately to complete KYC.",
      riskLevel: "HIGH",
      confidence: 0.98,
      warningSigns: JSON.stringify([
        "Urgent or threatening language",
        "Suspicious or unofficial link",
        "Demand for instant personal action (KYC update)",
      ]),
      explanation:
        "The message uses urgent phrasing (account blocked today) and prompts you to click an unofficial hyperlink to submit personal information.",
      recommendation:
        "Do not click the link. Banks will never threaten to suspend accounts immediately via SMS or ask for credentials via unverified web pages.",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
