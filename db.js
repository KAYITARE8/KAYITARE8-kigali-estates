const Datastore = require('@seald-io/nedb');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

const db = {
  properties: new Datastore({ filename: path.join(dataDir, 'properties.db'), autoload: true }),
  agents:     new Datastore({ filename: path.join(dataDir, 'agents.db'),     autoload: true }),
  inquiries:  new Datastore({ filename: path.join(dataDir, 'inquiries.db'),  autoload: true }),
  settings:   new Datastore({ filename: path.join(dataDir, 'settings.db'),   autoload: true }),
  admin:      new Datastore({ filename: path.join(dataDir, 'admin.db'),       autoload: true }),
  orders:     new Datastore({ filename: path.join(dataDir, 'orders.db'),      autoload: true }),
  users:      new Datastore({ filename: path.join(dataDir, 'users.db'),       autoload: true }),
};

async function seed() {
  const propCount = await db.properties.countAsync({});
  if (propCount === 0) {
    await db.properties.insertAsync([
      { _id: 'p1', title: 'Modern Villa in Kacyiru',          type: 'house',      status: 'sale', price: 850000000, currency: 'RWF', location: 'Kacyiru, Kigali',       district: 'Gasabo',     bedrooms: 4, bathrooms: 3, area: 350,  description: 'Stunning modern villa with panoramic views of Kigali.',          features: ['Garden','Parking','Security','Modern Kitchen','Backup Generator'], image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', featured: true,  createdAt: '2026-01-15' },
      { _id: 'p2', title: 'Luxury Apartment in Nyarutarama',  type: 'apartment',  status: 'rent', price: 2500000,   currency: 'RWF', location: 'Nyarutarama, Kigali',   district: 'Gasabo',     bedrooms: 3, bathrooms: 2, area: 180,  description: 'Elegant apartment in the heart of Nyarutarama.',                 features: ['Furnished','Balcony','Gym Access','Pool','24/7 Security'],          image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', featured: true,  createdAt: '2026-02-01' },
      { _id: 'p3', title: 'Commercial Plot in Remera',        type: 'land',       status: 'sale', price: 450000000, currency: 'RWF', location: 'Remera, Kigali',         district: 'Gasabo',     bedrooms: 0, bathrooms: 0, area: 1200, description: 'Prime commercial plot on main road in Remera.',                  features: ['Main Road Access','Utilities Ready','Commercial Zoning','Flat Terrain'], image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', featured: true,  createdAt: '2026-02-10' },
      { _id: 'p4', title: 'Family Home in Kimihurura',        type: 'house',      status: 'sale', price: 620000000, currency: 'RWF', location: 'Kimihurura, Kigali',     district: 'Gasabo',     bedrooms: 5, bathrooms: 4, area: 420,  description: 'Spacious family home in quiet Kimihurura neighborhood.',         features: ['Large Compound','Servant Quarters','Borehole','Solar Panels','Garage'], image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', featured: false, createdAt: '2026-02-20' },
      { _id: 'p5', title: 'Office Space in CBD',              type: 'commercial', status: 'rent', price: 1800000,   currency: 'RWF', location: 'City Center, Kigali',    district: 'Nyarugenge', bedrooms: 0, bathrooms: 2, area: 200,  description: 'Professional office space in Kigali CBD.',                      features: ['Open Plan','Meeting Rooms','Elevator','Reception Area','Parking'],  image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', featured: false, createdAt: '2026-03-01' },
      { _id: 'p6', title: 'Affordable Apartment in Gikondo',  type: 'apartment',  status: 'rent', price: 450000,    currency: 'RWF', location: 'Gikondo, Kigali',        district: 'Kicukiro',   bedrooms: 2, bathrooms: 1, area: 75,   description: 'Clean and affordable 2-bedroom apartment in Gikondo.',          features: ['Water Tank','Security Guard','Tiled Floors','Balcony'],             image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', featured: false, createdAt: '2026-03-05' },
    ]);
  }

  const agentCount = await db.agents.countAsync({});
  if (agentCount === 0) {
    await db.agents.insertAsync([
      { _id: 'a1', name: 'Jean Baptiste N.', role: 'Senior Agent',        phone: '+250 788 111 222', email: 'jean@kigaliestates.rw',    photo: '' },
      { _id: 'a2', name: 'Marie Claire U.',  role: 'Property Consultant', phone: '+250 789 333 444', email: 'marie@kigaliestates.rw',   photo: '' },
      { _id: 'a3', name: 'Patrick H.',       role: 'Land Specialist',     phone: '+250 787 555 666', email: 'patrick@kigaliestates.rw', photo: '' },
    ]);
  }

  const settingsCount = await db.settings.countAsync({});
  if (settingsCount === 0) {
    await db.settings.insertAsync({ _id: 'main', companyName: 'Kigali Estates', tagline: 'Your Trusted Real Estate Partner in Rwanda', phone: '+250 788 123 456', email: 'info@kigaliestates.rw', address: 'KG 7 Ave, Kigali, Rwanda', whatsapp: '+250788123456', about: 'Kigali Estates is a leading real estate agency operating across Rwanda.' });
  }

  const adminCount = await db.admin.countAsync({});
  if (adminCount === 0) {
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash('admin123', 10);
    await db.admin.insertAsync({ _id: 'admin1', username: 'kayitaree35@gmail.com', password: hashed, name: 'Administrator' });
  }
}

module.exports = { db, seed };
