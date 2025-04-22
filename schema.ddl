CREATE TABLE notes (
  id        STRING(36) NOT NULL,
  title     STRING(MAX) NOT NULL,
  content   STRING(MAX) NOT NULL,
  category  STRING(MAX),
  published BOOL,
  createdAt TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true),
  updatedAt TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true)
) PRIMARY KEY (id);

CREATE UNIQUE INDEX notes_title_idx ON notes(title);