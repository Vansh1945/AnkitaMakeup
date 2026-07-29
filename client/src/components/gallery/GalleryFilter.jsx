import React, { useState, useEffect } from 'react';
import { getCategories } from '../../services/categoryApi';

const GalleryFilter = ({ activeCategory, onSelectCategory }) => {
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    const fetchCats = async () => {
      const dbCats = await getCategories();
      if (dbCats && dbCats.length > 0) {
        const catNames = ['All', ...dbCats.map((c) => c.name)];
        setCategories(catNames);
      }
    };
    fetchCats();
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2">
      {categories.map((category) => {
        const isSelected = activeCategory.toLowerCase() === category.toLowerCase();
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
              isSelected
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface text-text border border-border hover:bg-secondary-light hover:text-primary'
            }`}
            aria-pressed={isSelected}
            aria-label={`Filter by ${category}`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};

export default GalleryFilter;
