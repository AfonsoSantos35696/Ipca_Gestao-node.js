# 🎓 Sistema de Gestão Académica

## 📌 Descrição

Este projeto consiste num sistema de gestão académica desenvolvido com base numa base de dados relacional. O objetivo é gerir alunos, cursos, disciplinas, matrículas e avaliações de forma estruturada e eficiente.

A base de dados foi criada em **Mongo DB** e permite suportar operações comuns em instituições de ensino.

---

## ⚙️ Funcionalidades

* 👨‍🎓 Gestão de alunos (registo e dados pessoais)
* 📚 Gestão de cursos e disciplinas
* 📝 Gestão de pedidos de matrícula
* 📊 Lançamento e consulta de notas
* 📋 Criação de pautas
* 🗂️ Plano de estudos por curso
* 👥 Sistema de utilizadores com diferentes permissões:

  * Aluno
  * Funcionário
  * Gestor
  * Admin

---

## 🗄️ Estrutura da Base de Dados

Principais tabelas:

* `utilizadores` → Gestão de utilizadores e permissões
* `cursos` → Lista de cursos
* `disciplinas` → Disciplinas disponíveis
* `plano_estudos` → Associação entre cursos e disciplinas
* `ficha_aluno` → Dados detalhados dos alunos
* `pedido_matricula` → Pedidos de inscrição em cursos
* `pauta` → Registo de avaliações por disciplina
* `nota` → Notas dos alunos

---

## 🔗 Relações Importantes

* Um aluno (`utilizadores`) pode ter:

  * Uma ficha (`ficha_aluno`)
  * Vários pedidos de matrícula
  * Várias notas

* Um curso tem:

  * Várias disciplinas (via `plano_estudos`)

* Uma pauta está associada a:

  * Uma disciplina
  * Um funcionário

---

## 🚀 Como usar

1. Abrir o terminal e escrever:
  * npm start

2. Abrir o projeto:

   * Abrir o [http://](http://localhost:3000)

---

## 🔐 Credenciais de Teste

| Tipo        | Email                                       |
| ----------- | ------------------------------------------- |
| Aluno       | [aluno@teste.com](mailto:aluno@teste.com)   |
| Funcionário | [func@teste.com](mailto:func@teste.com)     |
| Gestor      | [gestor@teste.com](mailto:gestor@teste.com) |

---

## 🛠️ Tecnologias

* Atals Mongo DB
* Node.js

---

## 📈 Melhorias Futuras

* Interface web (Node.js / Express)
* Sistema de autenticação completo
* Dashboard com estatísticas
* Exportação de relatórios

---

## 👤 Autor

Projeto académico desenvolvido para gestão de dados escolares feito por Afonso Santos nº 35696
