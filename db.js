const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'kigali_estates.db');

let db;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      price INTEGER NOT NULL,
      currency TEXT DEFAULT 'RWF',
      location TEXT NOT NULL,
      district TEXT NOT NULL,
      bedrooms INTEGER DEFAULT 0,
      bathrooms INTEGER DEFAULT 0,
      area INTEGER NOT NULL,
      description TEXT,
      features TEXT DEFAULT '[]',
      image TEXT,
      featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (date('now'))
    );
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      phone TEXT,
      email TEXT,
      photo TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT,
      property_id TEXT DEFAULT '',
      property_title TEXT DEFAULT 'General Inquiry',
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL
    );
  `);

  // Seed properties
  const propCount = db.exec('SELECT COUNT(*) as c FROM properties')[0]?.values[0][0];
  if (!propCount) {
    const props = [
      ['p1','Modern Villa in Kacyiru','house','sale',850000000,'RWF','Kacyiru, Kigali','Gasabo',4,3,350,'Stunning modern villa with panoramic views of Kigali.',JSON.stringify(['Garden','Parking','Security','Modern Kitchen','Backup Generator']),'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',1,'2026-01-15'],
      ['p2','Luxury Apartment in Nyarutarama','apartment','rent',2500000,'RWF','Nyarutarama, Kigali','Gasabo',3,2,180,'Elegant apartment in the heart of Nyarutarama.',JSON.stringify(['Furnished','Balcony','Gym Access','Pool','24/7 Security']),'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',1,'2026-02-01'],
      ['p3','Commercial Plot in Remera','land','sale',450000000,'RWF','Remera, Kigali','Gasabo',0,0,1200,'Prime commercial plot on main road in Remera.',JSON.stringify(['Main Road Access','Utilities Ready','Commercial Zoning','Flat Terrain']),'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',1,'2026-02-10'],
      ['p4','Family Home in Kimihurura','house','sale',620000000,'RWF','Kimihurura, Kigali','Gasabo',5,4,420,'Spacious family home in quiet Kimihurura neighborhood.',JSON.stringify(['Large Compound','Servant Quarters','Borehole','Solar Panels','Garage']),'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',0,'2026-02-20'],
      ['p5','Office Space in CBD','commercial','rent',1800000,'RWF','City Center, Kigali','Nyarugenge',0,2,200,'Professional office space in Kigali CBD.',JSON.stringify(['Open Plan','Meeting Rooms','Elevator','Reception Area','Parking']),'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',0,'2026-03-01'],
      ['p6','Affordable Apartment in Gikondo','apartment','rent',450000,'RWF','Gikondo, Kigali','Kicukiro',2,1,75,'Clean and affordable 2-bedroom apartment in Gikondo.',JSON.stringify(['Water Tank','Security Guard','Tiled Floors','Balcony']),'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',0,'2026-03-05']
    ];
    props.forEach(p => db.run(
      'INSERT INTO properties VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', p
    ));
  }

  // Seed agents
  const agentCount = db.exec('SELECT COUNT(*) FROM agents')[0]?.values[0][0];
  if (!agentCount) {
    db.run("INSERT INTO agents VALUES ('a1','Jean Baptiste N.','Senior Agent','+250 788 111 222','jean@kigaliestates.rw','')");
    db.run("INSERT INTO agents VALUES ('a2','Marie Claire U.','Property Consultant','+250 789 333 444','marie@kigaliestates.rw','')");
    db.run("INSERT INTO agents VALUES ('a3','Patrick H.','Land Specialist','+250 787 555 666','patrick@kigaliestates.rw','')");
  }

  // Seed settings
  const settingsCount = db.exec('SELECT COUNT(*) FROM settings')[0]?.values[0][0];
  if (!settingsCount) {
    const defaults = [
      ['companyName','Kigali Estates'],
      ['tagline','Your Trusted Real Estate Partner in Rwanda'],
      ['phone','+250 788 123 456'],
      ['email','info@kigaliestates.rw'],
      ['address','KG 7 Ave, Kigali, Rwanda'],
      ['whatsapp','+250788123456'],
      ['about','Kigali Estates is a leading real estate agency operating across Rwanda.']
    ];
    defaults.forEach(([k, v]) => db.run('INSERT INTO settings VALUES (?,?)', [k, v]));
  }

  // Seed admin
  const adminCount = db.exec('SELECT COUNT(*) FROM admin')[0]?.values[0][0];
  if (!adminCount) {
    db.run("INSERT INTO admin VALUES (1,'admin','admin123','Administrator')");
  }

  persist();
  return db;
}

function persist() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Helper: run a query and return all rows as objects
function query(sql, params = []) {
  const result = db.exec(sql, params);
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

// Helper: run a single-row query
function queryOne(sql, params = []) {
  const rows = query(sql, params);
  return rows[0] || null;
}

// Helper: run a write statement and persist
function run(sql, params = []) {
  db.run(sql, params);
  persist();
}

module.exports = { getDb, query, queryOne, run };
