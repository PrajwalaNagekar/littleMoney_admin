import dotenv from "dotenv";
dotenv.config();
const { SMS_AUTH_KEY, SMS_SENDERID } = process.env;

export { SMS_AUTH_KEY, SMS_SENDERID };