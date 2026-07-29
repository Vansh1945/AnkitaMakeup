const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  { name: 'Bridal Makeup', description: 'Royal & HD bridal makeovers', sortOrder: 1 },
  { name: 'Party Makeup', description: 'Glamour party & occasion makeup', sortOrder: 2 },
  { name: 'Engagement Makeup', description: 'Soft radiant engagement glam', sortOrder: 3 },
  { name: 'Reception Makeup', description: 'Cocktail & reception makeup', sortOrder: 4 },
  { name: 'HD Makeup', description: 'High-definition poreless makeup', sortOrder: 5 },
  { name: 'Airbrush Makeup', description: 'Flawless airbrush foundation', sortOrder: 6 },
  { name: 'Hair Styling', description: 'Bridal & Hollywood vintage hairstyle', sortOrder: 7 },
  { name: 'Editorial & Shoot', description: 'Commercial & fashion shoot styling', sortOrder: 8 },
  { name: 'Pre Wedding Makeup', description: 'Outdoor pre-wedding photoshoot styling', sortOrder: 9 },
  { name: 'Nail Art', description: 'Custom nail extensions & art', sortOrder: 10 },
  { name: 'Other', description: 'Custom beauty & makeover services', sortOrder: 11 },
];

/**
 * Auto-seed Categories if database collection is empty
 */
const seedCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial categories into database...');
      await Category.insertMany(DEFAULT_CATEGORIES);
      console.log('✅ Initial categories seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding categories:', error.message);
  }
};

module.exports = seedCategories;
