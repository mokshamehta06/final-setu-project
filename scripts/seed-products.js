require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const Product = require('../models/product');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

const productsData = [
  {
    name: "Apple MacBook Pro 16\" M2 Pro (16GB / 512GB SSD)",
    description: "Confiscated during customs clearance at IGI Airport. Inspected, battery health 99%, includes original 140W MagSafe charger and verified clearance manifest.",
    category: "laptops",
    condition: "excellent",
    price: 84999,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    stock: 4,
    seizureProof: true,
    source: "customs",
    isNew: false
  },
  {
    name: "iPhone 15 Pro Max 256GB Natural Titanium",
    description: "Unclaimed commercial import consignment released for public disposal. Factory unlocked, flawless condition, zero carrier locks, box and cable included.",
    category: "mobile",
    condition: "excellent",
    price: 68999,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    stock: 6,
    seizureProof: true,
    source: "customs",
    isNew: true
  },
  {
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    description: "Tax authority seized asset batch. Active noise cancellation verified, 30-hour battery life, pristine condition with original travel case.",
    category: "electronics",
    condition: "excellent",
    price: 14999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    stock: 8,
    seizureProof: true,
    source: "tax-authority",
    isNew: false
  },
  {
    name: "Canon EOS R5 Mirrorless Camera Body + RF 24-70mm f/2.8L",
    description: "Recovered in corporate bankruptcy liquidation proceeding. Shutter count under 1,200 actuations. Full 45MP 8K RAW video capability tested and certified.",
    category: "cameras",
    condition: "excellent",
    price: 119999,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    stock: 2,
    seizureProof: true,
    source: "bankruptcy",
    isNew: false
  },
  {
    name: "Apple Watch Ultra 2 Titanium GPS + Cellular (49mm)",
    description: "Confiscated transit consignment. Sapphire crystal face, titanium casing, includes Orange Ocean Band and fast magnetic charger.",
    category: "electronics",
    condition: "excellent",
    price: 38999,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    stock: 5,
    seizureProof: true,
    source: "customs",
    isNew: false
  },
  {
    name: "Dell XPS 15 9530 OLED 4K (32GB RAM / 1TB SSD / RTX 4060)",
    description: "Liquidation stock from bankrupt tech venture. 3.5K OLED touch display, Intel Core i7 13th Gen, carbon fiber palm rest in flawless condition.",
    category: "laptops",
    condition: "good",
    price: 64999,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
    stock: 3,
    seizureProof: true,
    source: "bankruptcy",
    isNew: false
  },
  {
    name: "Samsung Galaxy S24 Ultra 5G (512GB / Titanium Gray)",
    description: "Import clearance forfeiture. Integrated S-Pen, 200MP camera system, Snapdragon 8 Gen 3. Officially verified IMEI with legal clearance papers.",
    category: "mobile",
    condition: "excellent",
    price: 59999,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
    stock: 5,
    seizureProof: true,
    source: "customs",
    isNew: true
  },
  {
    name: "Sony PlayStation 5 Console Digital Edition + DualSense Controller",
    description: "Law enforcement seized surplus inventory. 825GB ultra-high speed SSD, ray tracing, complete with cables and verified authentic serial number.",
    category: "electronics",
    condition: "excellent",
    price: 29999,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    stock: 7,
    seizureProof: true,
    source: "law-enforcement",
    isNew: true
  },
  {
    name: "Apple iPad Pro 12.9\" M2 Wi-Fi + Cellular 256GB Space Gray",
    description: "Tax audit seizure. Liquid Retina XDR mini-LED display, supports Apple Pencil 2 and Magic Keyboard. Clean iCloud status verified.",
    category: "electronics",
    condition: "excellent",
    price: 47999,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
    stock: 4,
    seizureProof: true,
    source: "tax-authority",
    isNew: false
  },
  {
    name: "Fujifilm X-T4 Mirrorless Digital Camera Body",
    description: "Customs declaration discrepancy lot. In-body image stabilization, 4K/60p video, 26.1MP X-Trans CMOS 4 sensor with pristine sensor glass.",
    category: "cameras",
    condition: "good",
    price: 54999,
    image: "https://images.unsplash.com/photo-1502982720700-bfff97f2da8d?w=800&auto=format&fit=crop&q=80",
    stock: 3,
    seizureProof: true,
    source: "customs",
    isNew: false
  },
  {
    name: "Bose QuietComfort 45 Over-Ear Bluetooth Headphones",
    description: "Law enforcement auction allotment. TriPort acoustic architecture, Quiet and Aware modes, 24-hour battery with USB-C quick charge.",
    category: "electronics",
    condition: "excellent",
    price: 11499,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    stock: 6,
    seizureProof: true,
    source: "law-enforcement",
    isNew: false
  },
  {
    name: "Asus ROG Zephyrus G14 Gaming Laptop (Ryzen 9 / RTX 4070)",
    description: "Bankruptcy settlement asset. 14\" QHD+ 165Hz Nebula display, 16GB DDR5 RAM, 1TB NVMe SSD. Clean stress test report available.",
    category: "laptops",
    condition: "excellent",
    price: 79999,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
    stock: 2,
    seizureProof: true,
    source: "customs",
    isNew: false
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas ✅");

    // Ensure agency user exists
    let agency = await User.findOne({ role: "agency" });
    if (!agency) {
      agency = new User({
        name: "Directorate of Revenue & Customs Disposal",
        email: "agency@example.com",
        password: await bcrypt.hash("password123", 10),
        role: "agency",
        isVerified: true
      });
      await agency.save();
      console.log("Created default agency:", agency.name);
    }

    // Clear existing products and reseed
    await Product.deleteMany({});
    console.log("Cleared old products");

    const productsToInsert = productsData.map(p => ({
      ...p,
      agency: agency._id
    }));

    await Product.insertMany(productsToInsert);
    console.log(`Successfully seeded ${productsToInsert.length} authentic seized electronic products! 🎉`);

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
