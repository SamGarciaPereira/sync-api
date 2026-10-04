import { exec } from "node:child_process";

function checkMySQL() {
  exec(
    "docker exec mysql-sync-db-dev mysqladmin ping -u sync -psenha123 --silent",
    handleReturn,
  );

  function handleReturn(error, stdout) {
    if (stdout.search("mysqld is alive") === -1) {
      process.stdout.write(".");
      setTimeout(checkMySQL, 1000);
      return;
    }

    console.log("\n🟢 MySQL está pronto e aceitando conexões!\n");
  }
}

process.stdout.write("\n\n🔴 Aguardando MySQL aceitar conexões");
checkMySQL();
