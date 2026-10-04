function getOrigin(): string {
  if (["test", "development"].includes(process.env.NODE_ENV || "")) {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  }

  return "https://sistema.usesync.com.br";
}

const webserver = {
  origin: getOrigin(),
};

export default webserver;
