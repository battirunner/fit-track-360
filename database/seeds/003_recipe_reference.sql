INSERT INTO recipes (
  id,
  title,
  description,
  main_ingredients,
  instructions,
  video_url,
  source
)
VALUES
  (
    '00000000-0000-0000-0000-000000000701',
    'Grilled Chicken Breast',
    'Chicken breast with salt, pepper, paprika and garlic powder.',
    '200g chicken breast, 1 tsp olive oil',
    'Season chicken, grill or air fry 12-15 min at 200C.',
    'https://www.youtube.com/results?search_query=healthy+grilled+chicken+breast',
    'FitTrack_Recipe_Reference_V1.docx'
  ),
  (
    '00000000-0000-0000-0000-000000000702',
    'Chicken Rice Bowl',
    'Meal-prep chicken with rice and broccoli.',
    '200g chicken, 150g cooked rice, 100g broccoli',
    'Cook rice, grill chicken, steam broccoli and serve.',
    'https://www.youtube.com/results?search_query=chicken+rice+meal+prep',
    'FitTrack_Recipe_Reference_V1.docx'
  ),
  (
    '00000000-0000-0000-0000-000000000703',
    'Healthy Chicken Curry',
    'Light chicken curry.',
    '220g chicken, onion, carrot, curry, 150g rice',
    'Cook onion, add chicken, vegetables and curry.',
    'https://www.youtube.com/results?search_query=healthy+chicken+curry',
    'FitTrack_Recipe_Reference_V1.docx'
  ),
  (
    '00000000-0000-0000-0000-000000000704',
    'Chicken Stir Fry',
    'Chicken with mixed vegetables.',
    '200g chicken, mixed vegetables',
    'Cook chicken then vegetables, season lightly.',
    'https://www.youtube.com/results?search_query=healthy+chicken+stir+fry',
    'FitTrack_Recipe_Reference_V1.docx'
  ),
  (
    '00000000-0000-0000-0000-000000000705',
    'Baked Salmon',
    'Oven baked salmon.',
    '180g salmon, broccoli, lemon',
    'Season and bake 15 min at 200C.',
    'https://www.youtube.com/results?search_query=easy+baked+salmon',
    'FitTrack_Recipe_Reference_V1.docx'
  ),
  (
    '00000000-0000-0000-0000-000000000706',
    'Beef Stir Fry',
    'Lean beef with vegetables.',
    '180g lean beef, onion, bell pepper, mushroom',
    'Stir fry beef then vegetables.',
    'https://www.youtube.com/results?search_query=healthy+beef+stir+fry',
    'FitTrack_Recipe_Reference_V1.docx'
  ),
  (
    '00000000-0000-0000-0000-000000000707',
    'Tuna Sandwich',
    'Quick protein sandwich.',
    '1 can tuna, 2 bread slices, lettuce',
    'Mix tuna and assemble sandwich.',
    'https://www.youtube.com/results?search_query=healthy+tuna+sandwich',
    'FitTrack_Recipe_Reference_V1.docx'
  ),
  (
    '00000000-0000-0000-0000-000000000708',
    'Tuna Rice Bowl',
    'Rice topped with tuna.',
    '150g tuna, 150g rice, cucumber',
    'Cook rice and top with tuna and vegetables.',
    'https://www.youtube.com/results?search_query=tuna+rice+bowl',
    'FitTrack_Recipe_Reference_V1.docx'
  ),
  (
    '00000000-0000-0000-0000-000000000709',
    'Greek Yogurt Bowl',
    'Healthy breakfast/snack.',
    '200g yogurt, banana, chia',
    'Mix all ingredients in a bowl.',
    'https://www.youtube.com/results?search_query=greek+yogurt+breakfast+bowl',
    'FitTrack_Recipe_Reference_V1.docx'
  ),
  (
    '00000000-0000-0000-0000-000000000710',
    'Overnight Oats',
    'Prepare breakfast the night before.',
    '60g oats, 250ml milk, banana',
    'Mix ingredients and refrigerate overnight.',
    'https://www.youtube.com/results?search_query=overnight+oats',
    'FitTrack_Recipe_Reference_V1.docx'
  ),
  (
    '00000000-0000-0000-0000-000000000711',
    'Protein Omelette',
    'High-protein egg breakfast.',
    '3-4 eggs, spinach, onion, tomato',
    'Beat eggs, add vegetables and cook.',
    'https://www.youtube.com/results?search_query=high+protein+omelette',
    'FitTrack_Recipe_Reference_V1.docx'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  main_ingredients = EXCLUDED.main_ingredients,
  instructions = EXCLUDED.instructions,
  video_url = EXCLUDED.video_url,
  source = EXCLUDED.source;

UPDATE meals
SET recipe_id = CASE
  WHEN name ILIKE '%%Chicken Curry%%' THEN '00000000-0000-0000-0000-000000000703'::uuid
  WHEN name ILIKE '%%Chicken Stir Fry%%' THEN '00000000-0000-0000-0000-000000000704'::uuid
  WHEN name ILIKE '%%Chicken%%Rice%%' OR name ILIKE '%%Chicken%%+ Rice%%' THEN '00000000-0000-0000-0000-000000000702'::uuid
  WHEN name ILIKE '%%Chicken%%' THEN '00000000-0000-0000-0000-000000000701'::uuid
  WHEN name ILIKE '%%Salmon%%' THEN '00000000-0000-0000-0000-000000000705'::uuid
  WHEN name ILIKE '%%Beef%%' THEN '00000000-0000-0000-0000-000000000706'::uuid
  WHEN name ILIKE '%%Tuna%%Rice%%' OR name ILIKE '%%Tuna 150g + Rice%%' THEN '00000000-0000-0000-0000-000000000708'::uuid
  WHEN name ILIKE '%%Tuna%%' THEN '00000000-0000-0000-0000-000000000707'::uuid
  WHEN name ILIKE '%%Yogurt%%' THEN '00000000-0000-0000-0000-000000000709'::uuid
  WHEN name ILIKE '%%Oats%%' THEN '00000000-0000-0000-0000-000000000710'::uuid
  WHEN name ILIKE '%%Eggs%%' OR name ILIKE '%%Omelette%%' THEN '00000000-0000-0000-0000-000000000711'::uuid
  ELSE recipe_id
END
WHERE meal_plan_id = '00000000-0000-0000-0000-000000000401';
