export const { LOG_LEVEL, SECRET_KEY } = process.env;

export const __DEBUG__ = LOG_LEVEL === "3";

export const SECRET = SECRET_KEY || "KisiKoNahiBtaonga";