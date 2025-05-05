const fs = require('fs');
const sequelize = require('../config/sequelize'); // Adjust path

async function exportSchema() {
  const query = `
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `;

  const [results] = await sequelize.query(query);

  const schema = results.reduce((acc, row) => {
    if (!acc[row.table_name]) {
      acc[row.table_name] = [];
    }
    acc[row.table_name].push({
      column: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === 'YES'
    });
    return acc;
  }, {});

  fs.writeFileSync('schema.json', JSON.stringify(schema, null, 2));
  console.log('Schema exported to schema.json');
}

exportSchema();
