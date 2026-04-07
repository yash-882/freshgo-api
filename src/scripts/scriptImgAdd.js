require("dotenv").config({ path: "src/configs/file.env" });

const mongoose = require("mongoose");
const axios = require("axios");
const { v2: cloudinary } = require("cloudinary");
const Product = require("../models/product");


// ---------- Config ----------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to MongoDB");
})

// ---------- Get Image from Unsplash ----------
async function getUnsplashImage(query) {
  const response = await axios.get("https://api.unsplash.com/search/photos", {
    params: {
      query,
      per_page: 1,
    },
    headers: {
      Authorization: `Client-ID ${'RzGqgt4KigiOHyUcMm1Pem8X5IUq4ayMYvE37dGQVtQ'}`,
    },
  });

  if (response.data.results.length === 0) {
    return null;
  }

  return response.data.results[0].urls.regular;
}

// ---------- Main ----------
async function run() {
  try {
    const products = await Product.find({ images: { $size: 0 } });

    console.log(`Found ${products.length} products\n`);

    for (const product of products) {
      console.log(`Searching image for: ${product.name}`);

      const imageUrl = await getUnsplashImage(product.name);

      if (!imageUrl) {
        console.log(`⚠ No image found for ${product.name}`);
        continue;
      }

      const publicId = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");

      const result = await cloudinary.uploader.upload(imageUrl, {
        folder: "products",
        public_id: publicId,
      });

      product.images = [result.secure_url];
      await product.save();

      console.log(`✅ Updated: ${product.name}\n`);
    }

    console.log("🎉 All done");
    process.exit(0);

  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
    process.exit(1);
  }
}

run()