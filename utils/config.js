import dotenv from 'dotenv';
import { Command } from 'commander';

const program = new Command();
program
  .version('2.0.1')
  .option('-p --port <port>', 'Execution port', 3000)
  .option('-m --mode <mode>', 'Execution mode (PRODUCTION / DEVELOPMENT)', 'DEVELOPMENT')
  .option('-d --debug', 'Activate / deactivate debug', false)
  .parse(process.argv);
const cl_options = program.opts();

// Por el momento, el entorno de development y de producción es el mismo
dotenv.config({ path: cl_options.mode == 'DEVEL' ? './.env.development' : './.env.production' });

const config = {
  PORT: 3030,
  WS_PORT: 3000,
  MONGOOSE_URL: 'mongodb+srv://fgtenaglia96:MARIQUENA123@cluster0.m2c4it6.mongodb.net/?retryWrites=true&w=majority',
  SESSION_SECRET: process.env.SESSION_SECRET,
  PERSISTENCE: process.env.PERSISTENCE
};

export default config;
