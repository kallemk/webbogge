DROP TABLE if EXISTS users;
DROP TABLE if EXISTS messages;

CREATE TABLE users (
  id integer primary key autoincrement,
  email text not null,
  password text not null,
  firstname text not null,
  familyname text not null,
  gender text not null,
  city text not null,
  country text not null
);

CREATE TABLE messages (
  id integer primary key autoincrement,
  email_sender text not null,
  email_wall text not null,
  message text not null
);
