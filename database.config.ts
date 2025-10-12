import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root', // Substitua pelo seu usuário do MySQL
  password: 'password', // Substitua pela sua senha do MySQL
  database: 'oat_db', // Substitua pelo nome do seu banco de dados
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // CUIDADO: Use apenas em desenvolvimento. Em produção, use migrações.
};
