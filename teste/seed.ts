import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { CursosService } from '@app/cursos/cursos.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const cursosService = app.get(CursosService);

  const cursos = [
    { titulo: 'Curso de Python Avançado', descricao: 'Automação, APIs e IA', criador: 'Chrystian Allday', categoria: 'Programação', score: 4.8, preco: 100.00, promocao: 10.00, percentual_desconto: 90, imagem_url: 'https://d335luupugsy2.cloudfront.net/cms/files/47031/1757823897/$of7p3idlna', skills: ['Python', 'Automação', 'IA'] },
    { titulo: 'Design UI/UX', descricao: 'Crie interfaces modernas', criador: 'Maria Clara', categoria: 'Design', score: 4.9, preco: 120.00, promocao: 12.00, percentual_desconto: 90, imagem_url: 'https://d335luupugsy2.cloudfront.net/cms/files/47031/1757823897/$of7p3idlna', skills: ['UI', 'UX', 'Figma'] },
    { titulo: 'Machine Learning', descricao: 'Modelos inteligentes e predição', criador: 'João Pedro', categoria: 'Data Science', score: 4.7, preco: 150.00, promocao: 15.00, percentual_desconto: 90, imagem_url: 'https://d335luupugsy2.cloudfront.net/cms/files/47031/1757823897/$of7p3idlna', skills: ['Machine Learning', 'Python', 'TensorFlow'] },
    { titulo: 'Marketing Digital', descricao: 'Estratégias e crescimento online', criador: 'Ana Carolina', categoria: 'Marketing', score: 4.6, preco: 80.00, promocao: 8.00, percentual_desconto: 90, imagem_url: 'https://d335luupugsy2.cloudfront.net/cms/files/47031/1757823897/$of7p3idlna', skills: ['Marketing', 'SEO', 'Google Ads'] },
  ];

  for (const cursoData of cursos) {
    const { skills, ...rest } = cursoData;
    const curso = await cursosService.create(rest);
    if (skills && skills.length > 0) {
      await cursosService.addSkillsToCurso(curso.id, skills);
    }
  }

  await app.close();
  console.log('Banco de dados populado com sucesso!');
}

bootstrap();
