import { sql, PostgreSQL } from '@codemirror/lang-sql'
export default () => sql({ dialect: PostgreSQL })
