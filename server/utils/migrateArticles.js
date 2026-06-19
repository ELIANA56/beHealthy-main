function getWeekOfYear(date = new Date()) {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const jan1 = new Date(target.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((target - jan1) / (24 * 60 * 60 * 1000)) + 1;
  return Math.min(52, Math.max(1, Math.ceil(dayOfYear / 7)));
}

const WEEKLY_ARTICLES = [
  { week: 1, category: 'Basics', title: 'Start with hydration', summary: 'Why water is the foundation of every health goal.', content: 'Drinking enough water supports digestion, energy, focus, and workout recovery. Aim for consistent intake through the day rather than large amounts at once. A simple habit: keep a bottle nearby and drink a glass when you wake up.' },
  { week: 2, category: 'Sleep', title: 'Sleep and recovery', summary: 'Better sleep improves appetite control and training results.', content: 'Most adults benefit from 7-9 hours of sleep. A fixed bedtime, less screen time before bed, and a cool dark room can improve sleep quality. Recovery is when your body repairs muscle and balances hunger hormones.' },
  { week: 3, category: 'Nutrition', title: 'Protein at every meal', summary: 'Spread protein across the day for better satiety and muscle support.', content: 'Protein helps you feel full and supports muscle maintenance, especially when exercising. Include a protein source at breakfast, lunch, dinner, and snacks such as eggs, yogurt, fish, legumes, or tofu.' },
  { week: 4, category: 'Movement', title: 'Walk more every day', summary: 'Daily steps are one of the easiest health upgrades.', content: 'Walking improves heart health, mood, and calorie balance without needing a gym. Try short walks after meals, take stairs when possible, and build toward a daily step goal that feels realistic for your schedule.' },
  { week: 5, category: 'Nutrition', title: 'Build a balanced plate', summary: 'Use portions of protein, carbs, vegetables, and healthy fats.', content: 'A balanced plate usually includes half vegetables, a quarter protein, and a quarter whole grains or starchy carbs, plus a small amount of healthy fat. This structure supports stable energy and makes meal logging easier.' },
  { week: 6, category: 'Mindset', title: 'Set realistic goals', summary: 'Small consistent changes beat extreme short diets.', content: 'Sustainable health progress comes from habits you can maintain for months, not days. Focus on one or two changes at a time, such as adding vegetables or planning lunches, instead of overhauling everything at once.' },
  { week: 7, category: 'Nutrition', title: 'Meal planning saves time', summary: 'Planning reduces impulsive food choices during busy weeks.', content: 'Spend 20 minutes once a week deciding breakfasts, lunches, and dinners. Prep ingredients in advance when possible. Planned meals make it easier to stay near your calorie and protein targets.' },
  { week: 8, category: 'Fitness', title: 'Strength training basics', summary: 'Muscle-supporting exercise helps metabolism and bone health.', content: 'Strength training twice a week can include bodyweight squats, push-ups, resistance bands, or gym machines. Progressive challenge over time matters more than perfect form on day one.' },
  { week: 9, category: 'Nutrition', title: 'Smart snack choices', summary: 'Snacks can support energy or derail progress depending on choice.', content: 'Useful snacks combine protein and fiber, such as yogurt with fruit, hummus with vegetables, or a small handful of nuts. Avoid grazing without hunger, and log snacks so they fit your daily budget.' },
  { week: 10, category: 'Habits', title: 'Track what matters', summary: 'Awareness is the first step to improvement.', content: 'Tracking meals, workouts, and sleep helps you notice patterns. You do not need perfection—consistent logging for a few weeks often reveals the highest-impact changes you can make.' },
  { week: 11, category: 'Nutrition', title: 'Fiber for fullness', summary: 'Fiber supports digestion and helps control appetite.', content: 'Whole grains, beans, lentils, vegetables, and fruit add fiber that keeps you satisfied longer. Increase fiber gradually and drink water to support digestion.' },
  { week: 12, category: 'Recovery', title: 'Rest days matter', summary: 'Recovery is part of training, not a break from progress.', content: 'Muscles adapt during rest. Schedule at least one lighter day per week, prioritize sleep, and eat enough protein on rest days to support repair.' },
  { week: 13, category: 'Nutrition', title: 'Healthy fats explained', summary: 'Not all fats are equal, and some are essential.', content: 'Olive oil, avocado, nuts, and fatty fish provide fats that support hormones and vitamin absorption. Limit highly processed fried foods while keeping moderate amounts of healthy fats in meals.' },
  { week: 14, category: 'Fitness', title: 'Cardio without burnout', summary: 'Mix intensity and duration for better results.', content: 'Cardio can include brisk walking, cycling, swimming, or dancing. Moderate sessions most days with occasional harder efforts can improve endurance without exhausting recovery capacity.' },
  { week: 15, category: 'Nutrition', title: 'Breakfast that lasts', summary: 'Morning meals can reduce overeating later in the day.', content: 'A breakfast with protein and fiber—such as eggs with vegetables, Greek yogurt with oats, or whole-grain toast with cottage cheese—can stabilize hunger through late morning.' },
  { week: 16, category: 'Mindset', title: 'Progress is not linear', summary: 'Weight and energy naturally fluctuate day to day.', content: 'Daily scale changes reflect water, sodium, sleep, and digestion—not just fat. Look at weekly trends, how clothes fit, energy levels, and workout performance instead of one number.' },
  { week: 17, category: 'Nutrition', title: 'Eating out wisely', summary: 'Restaurant meals can fit your plan with a few choices.', content: 'Choose grilled proteins, ask for sauces on the side, add vegetables, and estimate portions honestly when logging. One restaurant meal does not ruin progress if the rest of the week stays consistent.' },
  { week: 18, category: 'Fitness', title: 'Warm up and cool down', summary: 'Short mobility work reduces injury risk.', content: 'A 5-minute warm-up increases blood flow before exercise. Light stretching or walking after workouts supports recovery. This is especially helpful if you are new to training.' },
  { week: 19, category: 'Nutrition', title: 'Sugar awareness', summary: 'Reduce added sugar without banning all sweets.', content: 'Check labels for added sugar in drinks, sauces, and snacks. Whole fruit is different from sugary drinks because it includes fiber. Save desserts for intentional moments rather than daily habit.' },
  { week: 20, category: 'Sleep', title: 'Caffeine and sleep timing', summary: 'Late caffeine can delay sleep even if you feel fine.', content: 'Many people sleep better when they stop caffeine 6-8 hours before bed. Try herbal tea in the evening and notice whether sleep depth improves over a week.' },
  { week: 21, category: 'Nutrition', title: 'Vegetables at lunch and dinner', summary: 'Volume from vegetables helps fullness with fewer calories.', content: 'Aim for color on your plate: leafy greens, peppers, carrots, broccoli, and tomatoes add nutrients and fiber. Frozen vegetables are convenient and just as useful as fresh.' },
  { week: 22, category: 'Fitness', title: 'Find movement you enjoy', summary: 'Consistency improves when exercise feels rewarding.', content: 'If you dislike the gym, try hiking, dance classes, swimming, or team sports. Enjoyable movement is easier to repeat, and repetition drives results.' },
  { week: 23, category: 'Nutrition', title: 'Portion size cues', summary: 'Learn visual guides when scales are not available.', content: 'A palm-sized portion often approximates protein, a cupped hand for carbs, a thumb for fats, and two cupped hands for vegetables. These are starting points, not strict rules.' },
  { week: 24, category: 'Hydration', title: 'Electrolytes and workouts', summary: 'Long or sweaty sessions may need more than water.', content: 'For intense training in heat, consider electrolytes from food or drinks. For most daily workouts, water plus balanced meals usually covers needs.' },
  { week: 25, category: 'Mindset', title: 'Stress and eating', summary: 'Stress can increase cravings and reduce planning.', content: 'When stressed, people often reach for quick comfort foods. Notice your triggers and build alternatives: a short walk, tea, protein snack, or brief breathing exercise before eating.' },
  { week: 26, category: 'Nutrition', title: 'Mid-year check-in', summary: 'Review habits and adjust goals for the second half of the year.', content: 'Look at what worked since January: meal logging, workouts, sleep. Keep successful habits and change only one weak area this month instead of restarting from zero.' },
  { week: 27, category: 'Fitness', title: 'Core strength for daily life', summary: 'A strong core supports posture and back comfort.', content: 'Planks, dead bugs, and bird dogs build core stability better than endless crunches. A few minutes several times per week can improve how you feel during daily tasks.' },
  { week: 28, category: 'Nutrition', title: 'Cook once, eat twice', summary: 'Batch cooking reduces decision fatigue.', content: 'Double recipes for grains, roasted vegetables, or proteins. Leftovers become tomorrow’s lunch, making healthy choices the easy default.' },
  { week: 29, category: 'Recovery', title: 'Stretching and mobility', summary: 'Mobility work keeps joints comfortable as activity increases.', content: 'Gentle stretching for hips, shoulders, and ankles can improve movement quality. Hold stretches 20-30 seconds without pain and breathe steadily.' },
  { week: 30, category: 'Nutrition', title: 'Label reading 101', summary: 'Ingredients and serving size tell the real story.', content: 'Check serving size first, then protein, fiber, added sugar, and sodium. Shorter ingredient lists are often less processed, but context matters for your overall day.' },
  { week: 31, category: 'Fitness', title: 'Progressive overload', summary: 'Gradually increase challenge to keep improving.', content: 'Add a little more weight, one more rep, or slightly longer duration over weeks. Small progressions prevent plateaus and reduce injury risk compared with sudden big jumps.' },
  { week: 32, category: 'Nutrition', title: 'Plant-based meals', summary: 'Even one meatless day per week can add variety and fiber.', content: 'Try lentil stew, bean tacos, tofu stir-fry, or chickpea salad. Plant meals can be high in protein when you combine legumes, grains, and dairy or soy.' },
  { week: 33, category: 'Habits', title: 'Environment design', summary: 'Make healthy choices the easy default at home.', content: 'Keep fruit visible, prep vegetables in clear containers, and place less healthy snacks out of sight. Environment often beats willpower.' },
  { week: 34, category: 'Nutrition', title: 'Pre-workout fuel', summary: 'The right snack can improve training quality.', content: 'For moderate workouts, a small carb plus protein snack 60-90 minutes before exercise may help. Examples: banana with peanut butter or yogurt with fruit.' },
  { week: 35, category: 'Fitness', title: 'Post-workout nutrition', summary: 'Recovery meals support muscle repair and energy replacement.', content: 'After training, include protein and carbohydrates within a few hours. This can be a normal meal rather than a special shake unless that is convenient for you.' },
  { week: 36, category: 'Mindset', title: 'Self-compassion after slip-ups', summary: 'One off-plan day is a data point, not a failure.', content: 'Return to your next meal and next workout without guilt. Long-term health is built from what you do most days, not from one weekend.' },
  { week: 37, category: 'Nutrition', title: 'Sodium and bloating', summary: 'Salt affects water retention and blood pressure.', content: 'Restaurant and packaged foods often contain high sodium. Cooking at home with herbs and citrus can reduce intake while keeping flavor.' },
  { week: 38, category: 'Sleep', title: 'Weekend sleep consistency', summary: 'Large sleep schedule shifts can feel like jet lag.', content: 'Try to keep wake times within 1 hour on weekends. Consistent sleep timing improves energy, appetite regulation, and workout motivation.' },
  { week: 39, category: 'Nutrition', title: 'Seasonal produce', summary: 'Seasonal fruits and vegetables are often fresher and cheaper.', content: 'Rotate produce with the season to keep meals interesting and nutrient-dense. Variety also supports a broader range of vitamins and minerals.' },
  { week: 40, category: 'Fitness', title: 'Active breaks at work', summary: 'Short movement breaks reduce stiffness and support focus.', content: 'Stand, walk, or stretch for 2-3 minutes each hour if you sit often. These micro-breaks add up and complement structured workouts.' },
  { week: 41, category: 'Nutrition', title: 'Alcohol and calories', summary: 'Drinks can add calories without fullness.', content: 'Alcohol can lower inhibitions around food and affect sleep. If you drink, plan it within your calorie budget and prioritize water between drinks.' },
  { week: 42, category: 'Recovery', title: 'Signs you need more rest', summary: 'Listen to fatigue, soreness, and mood.', content: 'Persistent exhaustion, irritability, or declining performance may mean you need lighter training, more sleep, or more food. Recovery is productive.' },
  { week: 43, category: 'Nutrition', title: 'Immune-supporting habits', summary: 'Sleep, protein, vegetables, and hydration support immunity.', content: 'No single food prevents illness, but balanced nutrition and rest strengthen resilience. Focus on whole foods and adequate protein during busy seasons.' },
  { week: 44, category: 'Fitness', title: 'Home workouts that work', summary: 'Effective training needs little equipment.', content: 'Bodyweight circuits, resistance bands, and a sturdy chair can provide full workouts. Consistency and progression matter more than fancy equipment.' },
  { week: 45, category: 'Mindset', title: 'Identity-based habits', summary: 'Think “I am someone who trains” instead of “I must train.”', content: 'Identity-based habits feel more stable than motivation alone. Each logged meal and workout is evidence of the healthy person you are becoming.' },
  { week: 46, category: 'Nutrition', title: 'Holiday planning', summary: 'Enjoy events while keeping weekly balance.', content: 'Eat normally before gatherings, prioritize protein and vegetables on the plate, and log estimates honestly. One celebration fits into a healthy month when surrounding days are steady.' },
  { week: 47, category: 'Fitness', title: 'Stay active in cold weather', summary: 'Indoor options keep momentum through winter.', content: 'Try home circuits, gym classes, mall walking, or layered outdoor walks. Maintaining movement through seasonal changes protects mood and metabolism.' },
  { week: 48, category: 'Nutrition', title: 'Comfort food upgrades', summary: 'Make favorite dishes lighter without losing satisfaction.', content: 'Add vegetables, use lean proteins, reduce heavy cream, or control portions. Healthier versions of comfort foods are easier to sustain than banning them entirely.' },
  { week: 49, category: 'Sleep', title: 'Year-end wind down', summary: 'Protect sleep during busy end-of-year schedules.', content: 'Block a realistic bedtime even when social calendars fill up. Better sleep improves food choices and reduces stress eating the next day.' },
  { week: 50, category: 'Nutrition', title: 'Reflect on your year', summary: 'Notice which habits actually stuck.', content: 'Review your best months: what did you eat, how did you move, how did you sleep? Carry forward what worked instead of chasing a completely new plan every January.' },
  { week: 51, category: 'Mindset', title: 'Set next year’s focus', summary: 'Choose one theme, not ten resolutions.', content: 'Examples: more protein, regular strength training, or consistent sleep. One clear focus is easier to measure and maintain than a long list of goals.' },
  { week: 52, category: 'Basics', title: 'Health is a long game', summary: 'Small weekly improvements compound over years.', content: 'You do not need perfection to be healthy. Keep logging, learning, moving, and adjusting. Next year starts with the habits you practice this week.' },
];

function migrateArticlesSchema(db) {
  return new Promise((resolve) => {
    const sql = `CREATE TABLE IF NOT EXISTS Content_Hub (
      Article_ID INT AUTO_INCREMENT PRIMARY KEY,
      Week_Number INT NOT NULL UNIQUE,
      Title VARCHAR(150) NOT NULL,
      Category VARCHAR(50),
      Summary VARCHAR(255),
      Content TEXT NOT NULL,
      Created_At DATETIME DEFAULT CURRENT_TIMESTAMP
    )`;

    db.query(sql, (err) => {
      if (err) console.error('Content_Hub migration:', err.message);

      db.query('SELECT COUNT(*) AS cnt FROM Content_Hub', (countErr, rows) => {
        if (countErr || !rows?.[0] || rows[0].cnt > 0) return resolve();

        const insertSql = `INSERT INTO Content_Hub (Week_Number, Title, Category, Summary, Content)
          VALUES ?`;
        const values = WEEKLY_ARTICLES.map((a) => [
          a.week,
          a.title,
          a.category,
          a.summary,
          a.content,
        ]);

        db.query(insertSql, [values], (insertErr) => {
          if (insertErr) console.error('Content_Hub seed:', insertErr.message);
          else console.log(`Seeded ${WEEKLY_ARTICLES.length} weekly health articles.`);
          resolve();
        });
      });
    });
  });
}

module.exports = { migrateArticlesSchema, getWeekOfYear };
