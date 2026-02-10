import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";


const prisma = new PrismaClient();
const hashedPassword = await bcrypt.hash("123456", 10);

async function main() {
  // Criando usuários
  const user1 = await prisma.user.create({
    data: {
      name: "Deivid",
      email: "deivid@email.com",
      password: hashedPassword
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Maria",
      email: "maria@email.com",
      password: hashedPassword
    }
  });

  // Criando músicas
  await prisma.music.createMany({
    data: [
      {
        title: "Music One",
        artist: "Artist A",
        userId: user1.id
      },
      {
        title: "Music Two",
        artist: "Artist B",
        userId: user1.id
      },
      {
        title: "Music Three",
        artist: "Artist C",
        userId: user2.id
      }
    ]
  });

  console.log("Seed finalizado 🚀");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
