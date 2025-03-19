const logger = {
  info: (id: string, message: string) => {
    console.log(`[${id}] INFO: ${message}`);
  },
  error: (id: string, message: string) => {
    console.error(`[${id}] ERROR: ${message}`);
  },
  warn: (id: string, message: string) => {
    console.warn(`[${id}] WARN: ${message}`);
  },
};

export default logger;
