export interface Recipe {
  id: string;
  title: string;
  category: string;
  prepTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  image: string;
  description: string;
  featuredProductId: string; // Links to Devam product
  ingredients: string[];
  instructions: string[];
}

export const recipes: Recipe[] = [
  {
    id: "1",
    title: "Authentic Gujarati Thepla",
    category: "Gujarati Specials",
    prepTime: "25 mins",
    difficulty: "Easy",
    image: "/recipe_thepla.png",
    description: "A staple in Gujarati households, these spiced flatbreads are perfect for breakfast, travel, or a light dinner. Made soft and flavorful with fresh methi and Devam's premium flours and spices.",
    featuredProductId: "14", // Ghavu Lot
    ingredients: [
      "2 cups Devam Ghavu Lot (Wheat Flour)",
      "1/4 cup Devam Besan (Gram Flour)",
      "1 cup Fresh Methi (Fenugreek) leaves, chopped",
      "1 tsp Devam Marchu Powder (Red Chili)",
      "1/2 tsp Devam Haldar Powder (Turmeric)",
      "1 tsp Devam Dhana Jiru Powder",
      "1 tbsp Yogurt",
      "Salt to taste",
      "Oil for roasting"
    ],
    instructions: [
      "In a large bowl, mix the Ghavu Lot, Besan, and all the dry Devam spices.",
      "Add the chopped methi leaves, yogurt, salt, and 1 tbsp of oil. Mix well.",
      "Gradually add water and knead into a soft, smooth dough. Let it rest for 10 minutes.",
      "Divide the dough into small equal-sized balls and roll them out into thin circles.",
      "Heat a tawa (griddle) and roast each thepla on medium heat, applying a little oil on both sides until golden brown spots appear.",
      "Serve hot with yogurt, pickle, or chunda."
    ]
  },
  {
    id: "2",
    title: "Classic Dal Fry",
    category: "Healthy Everyday",
    prepTime: "40 mins",
    difficulty: "Medium",
    image: "/recipe_dal_fry.png",
    description: "A rich, creamy, and comforting lentil dish tempered with aromatic spices. The secret to a perfect Dal Fry is the quality of the dal and the fresh punch of the tadka.",
    featuredProductId: "24", // Chana Dal
    ingredients: [
      "1 cup Devam Chana Dal (or mix of Toor & Chana)",
      "1 tsp Devam Jiru (Cumin Seeds)",
      "1/2 tsp Devam Mustard Seeds",
      "1 tsp Devam Garam Masala",
      "1 tsp Devam Haldar Powder",
      "1 medium Onion, finely chopped",
      "2 Tomatoes, pureed",
      "2 Green Chilies, slit",
      "2 tbsp Ghee or Oil",
      "Fresh Coriander for garnish"
    ],
    instructions: [
      "Wash the Devam Chana Dal thoroughly. Pressure cook it with turmeric and water for 4-5 whistles until soft and mashable.",
      "In a heavy-bottomed pan, heat the ghee. Add Devam Mustard Seeds and let them splutter. Add Devam Jiru and let it crackle.",
      "Add finely chopped onions and green chilies. Sauté until the onions turn golden brown.",
      "Pour in the tomato puree and cook until the ghee separates from the masala.",
      "Add the boiled dal to the pan. Adjust consistency with warm water.",
      "Stir in the Devam Garam Masala and salt. Simmer for 5-7 minutes.",
      "Garnish with freshly chopped coriander and serve hot with Devam Rice or Phulkas."
    ]
  },
  {
    id: "3",
    title: "Perfect Soft Phulkas",
    category: "Roti & Rotla",
    prepTime: "20 mins",
    difficulty: "Easy",
    image: "/recipe_phulka.png",
    description: "The quintessential Indian bread. Soft, airy, and perfectly puffed. Using high-quality, finely milled wheat flour ensures your phulkas stay soft for hours.",
    featuredProductId: "14", // Ghavu Lot
    ingredients: [
      "2 cups Devam Ghavu Lot (Wheat Flour)",
      "3/4 cup Warm Water (adjust as needed)",
      "1/2 tsp Salt (optional)",
      "Ghee for smearing (optional but recommended)"
    ],
    instructions: [
      "In a wide mixing bowl, add the Devam Ghavu Lot and salt. Mix well.",
      "Slowly add the warm water, mixing with your fingers until the dough starts coming together.",
      "Knead vigorously for 5-7 minutes. The dough should be soft, pliable, and smooth. Cover with a damp cloth and rest for 15 minutes.",
      "Pinch off lemon-sized balls of dough. Roll them into smooth balls.",
      "Dust a ball with dry flour and roll it evenly into a 6-inch circle.",
      "Place on a hot tawa. When small bubbles appear, flip it over and cook for a few seconds.",
      "Using tongs, transfer the roti directly to an open flame. It should puff up instantly into a ball.",
      "Remove from heat, smear with ghee, and serve immediately."
    ]
  },
  {
    id: "4",
    title: "Authentic Gujarati Kadhi",
    category: "Gujarati Specials",
    prepTime: "20 mins",
    difficulty: "Easy",
    image: "/recipe_kadhi.png",
    description: "A sweet and spicy yogurt-based soup thickened with fine gram flour. A staple in every Gujarati household, perfectly complementing hot rice or khichdi.",
    featuredProductId: "23", // Besan
    ingredients: [
      "2 tbsp Devam Besan (Gram Flour)",
      "1 cup Sour Yogurt (Curd)",
      "3 cups Water",
      "1 tsp Devam Mustard Seeds",
      "1 tsp Devam Jiru (Cumin Seeds)",
      "2 Green Chilies & 1 inch Ginger, crushed",
      "1 tbsp Ghee",
      "Salt and Sugar/Jaggery to taste"
    ],
    instructions: [
      "In a large bowl, whisk together the yogurt and Devam Besan until completely smooth and lump-free.",
      "Add water, salt, and sugar. Mix well and set aside.",
      "In a deep pan, heat ghee. Add Devam Mustard Seeds and Devam Jiru. Let them crackle.",
      "Add the crushed ginger-chili paste and sauté for a few seconds.",
      "Slowly pour in the yogurt-besan mixture while stirring continuously to prevent curdling.",
      "Bring the kadhi to a gentle boil on medium heat, stirring occasionally. Let it simmer for 10-12 minutes until it thickens slightly and the raw smell of besan disappears.",
      "Garnish with fresh coriander and serve hot."
    ]
  },
  {
    id: "5",
    title: "Traditional Bajra na Rotla",
    category: "Roti & Rotla",
    prepTime: "30 mins",
    difficulty: "Hard",
    image: "/recipe_bajra_rotla.png",
    description: "A rustic, thick pearl millet flatbread that is a winter favorite in Gujarat and Rajasthan. Best enjoyed with fresh white butter, garlic chutney, and ringna no oro.",
    featuredProductId: "19", // Bajari Lot
    ingredients: [
      "2 cups Devam Bajari Lot (Pearl Millet Flour)",
      "Warm Water as needed",
      "1/2 tsp Salt",
      "White Butter or Ghee for serving"
    ],
    instructions: [
      "Take Devam Bajari Lot and salt in a wide plate (thali).",
      "Gradually add warm water and knead the dough vigorously with the heel of your palm for 3-4 minutes until it becomes smooth and pliable. Knead only enough dough for 1-2 rotlas at a time.",
      "Take a large portion of the dough and shape it into a smooth ball.",
      "Using wet palms, gently flatten the ball and pat it in a circular motion until it forms a thick, even flatbread. (Alternatively, roll it gently between two plastic sheets).",
      "Carefully transfer the rotla to a hot clay tawa or iron griddle.",
      "Cook on medium heat until the bottom is cooked, then flip it and cook the other side until brown spots appear.",
      "Smear generously with white butter and serve hot."
    ]
  },
  {
    id: "6",
    title: "Classic Makki ki Roti",
    category: "Roti & Rotla",
    prepTime: "25 mins",
    difficulty: "Medium",
    image: "/recipe_makki_roti.png",
    description: "The pride of Punjab. A nutritious, golden-yellow flatbread made from fine maize flour, traditionally paired with Sarson ka Saag and a dollop of butter.",
    featuredProductId: "18", // Makai Lot
    ingredients: [
      "2 cups Devam Makai Lot (Corn Flour)",
      "Warm Water as needed",
      "1/2 tsp Salt",
      "Ghee or Butter for roasting"
    ],
    instructions: [
      "In a mixing bowl, combine Devam Makai Lot and salt.",
      "Add warm water gradually and knead into a firm but pliable dough.",
      "Divide the dough into equal-sized balls.",
      "Place a dough ball between two sheets of parchment paper or plastic wrap, and gently press it down with your hands or a rolling pin to form a thick circle.",
      "Heat a tawa on medium flame and transfer the roti carefully.",
      "Cook until the base is firm, then flip. Apply a little ghee around the edges and cook until golden brown spots appear on both sides.",
      "Serve hot, smothered in butter alongside Sarson ka Saag."
    ]
  },
  {
    id: "7",
    title: "Nourishing Masala Khichdi",
    category: "Healthy Everyday",
    prepTime: "25 mins",
    difficulty: "Easy",
    image: "/recipe_khichdi.png",
    description: "A complete one-pot meal that is both healthy and comforting. Made with a mix of rice, dals, and aromatic Devam spices.",
    featuredProductId: "8", // Dhana Jiru
    ingredients: [
      "1/2 cup Devam Chana Dal (mixed with Moong Dal)",
      "1/2 cup Rice",
      "1 tsp Devam Mustard Seeds",
      "1 tsp Devam Dhana Jiru Powder",
      "1/2 tsp Devam Haldar Powder (Turmeric)",
      "1/2 tsp Devam Garam Masala",
      "Mixed Vegetables (Peas, Carrots, Beans)",
      "2 tbsp Ghee",
      "Salt to taste"
    ],
    instructions: [
      "Wash the rice and dal thoroughly and soak them for 15 minutes.",
      "In a pressure cooker, heat ghee. Add Devam Mustard Seeds and let them crackle.",
      "Add your mixed vegetables and sauté for 2 minutes.",
      "Add Devam Haldar Powder, Dhana Jiru Powder, and Garam Masala. Sauté for another minute.",
      "Drain the soaked rice and dal, and add them to the cooker along with 3 cups of water and salt.",
      "Close the lid and pressure cook for 3-4 whistles.",
      "Let the pressure release naturally. Serve hot, topped with an extra dollop of ghee and fresh coriander."
    ]
  },
  {
    id: "8",
    title: "Rich Besan Ladoo",
    category: "Festive",
    prepTime: "45 mins",
    difficulty: "Medium",
    image: "/recipe_besan_ladoo.png",
    description: "Classic festive sweet made by slowly roasting fine gram flour in ghee until golden brown, then sweetened and shaped into melt-in-mouth spheres.",
    featuredProductId: "23", // Besan
    ingredients: [
      "2 cups Devam Besan (Gram Flour)",
      "1/2 cup Ghee (clarified butter)",
      "1 cup Powdered Sugar (Bura)",
      "1/2 tsp Cardamom Powder",
      "2 tbsp Chopped Almonds and Pistachios"
    ],
    instructions: [
      "In a heavy-bottomed kadhai, melt the ghee on low heat.",
      "Add Devam Besan and roast it continuously on low heat. The secret to perfect ladoos is slow roasting without burning.",
      "Keep stirring for about 20-25 minutes until the besan turns a deep golden color and releases a nutty aroma.",
      "Turn off the heat and let the mixture cool slightly until it is warm to the touch (do not let it cool completely).",
      "Add powdered sugar, cardamom powder, and chopped nuts. Mix thoroughly with your hands.",
      "Take small portions and roll them into smooth, round balls (ladoos).",
      "Store in an airtight container once completely cooled."
    ]
  },
  {
    id: "9",
    title: "Atta Sheera (Kada Prasad)",
    category: "Festive",
    prepTime: "15 mins",
    difficulty: "Easy",
    image: "/recipe_atta_sheera.png",
    description: "A divine, rich wheat pudding commonly served as Prasad. Uses equal parts of pure Devam whole wheat flour, ghee, and sugar for the perfect texture.",
    featuredProductId: "17", // Ghavu Lot
    ingredients: [
      "1 cup Devam Ghavu Lot (Premium Wheat Atta)",
      "1 cup Ghee",
      "1 cup Sugar",
      "3 cups Hot Water",
      "Slivered Almonds for garnish"
    ],
    instructions: [
      "In a saucepan, bring the water and sugar to a boil to make a simple syrup. Keep it simmering.",
      "In a heavy pan, melt the ghee on medium heat.",
      "Add Devam Ghavu Lot and roast it continuously, stirring well to prevent lumps.",
      "Roast until the flour turns a rich, dark golden brown and releases a beautiful roasted aroma.",
      "Carefully pour the hot sugar syrup into the roasted flour (be careful as it will bubble vigorously).",
      "Stir continuously until all the water is absorbed and the sheera leaves the sides of the pan, oozing a little ghee.",
      "Garnish with almonds and serve warm."
    ]
  }
];
