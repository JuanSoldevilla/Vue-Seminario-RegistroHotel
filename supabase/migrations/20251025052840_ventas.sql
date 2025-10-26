drop table if exists Ventas;
drop type if exists estados;

create type estados as enum ('pendiente', 'pagado', 'cancelado');

create table
  Ventas(
    id bigint primary key generated always as identity not null,
    create_at timestamp default now() not null,
    status estados default 'pendiente' not null,
    cliente text not null,
    fecha text not null,
    productos text array default array[]::varchar[] not null
  );