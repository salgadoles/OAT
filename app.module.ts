import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './database/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CursosModule } from './cursos/cursos.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    CursosModule
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [CursosModule] // Exportar CursosModule para que o CursosService seja acessível no contexto da aplicação
})
export class AppModule {}
