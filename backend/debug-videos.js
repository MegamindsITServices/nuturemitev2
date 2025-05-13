// Debug script to check for products with videos
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Setup __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple product schema
const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  videos: [String]
});

// Create the model
const Product = mongoose.model('Product', productSchema);

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');
    
    // Find products with videos
    const products = await Product.find({ 
      videos: { $exists: true, $ne: [] } 
    });
    
    console.log(`Found ${products.length} products with videos:`);
    
    // Log each product and verify the video files exist
    for (const product of products) {
      console.log(`\nProduct: ${product.name} (${product.slug || 'no slug'})`);
      console.log(`Videos: ${JSON.stringify(product.videos)}`);
      
      // Check if video files exist
      if (product.videos && product.videos.length > 0) {
        for (const videoFilename of product.videos) {
          const videoPath = path.join(__dirname, 'uploads', videoFilename);
          const exists = fs.existsSync(videoPath);
          console.log(`  - ${videoFilename}: ${exists ? 'File exists' : 'FILE MISSING'}`);
        }
      }
    }
    
    console.log('\nDebug complete');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
