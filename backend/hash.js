const bcrypt = require("bcryptjs");

async function run() {
  const students = [
    { usn: "2354001", password: "Appanna@2005" },
    { usn: "2354002", password: "Swaroop@2005" },
    { usn: "2354003", password: "Sujan@2005" },
    { usn: "2353001", password: "Varun@2005" },
    { usn: "2353002", password: "Gagan@2005" },
    { usn: "2353003", password: "Shreyas@2005" }
  ];

  for (let s of students) {
    const hashed = await bcrypt.hash(s.password, 10);
    console.log(`${s.usn} → ${s.password} → ${hashed}`);
  }
}

run();