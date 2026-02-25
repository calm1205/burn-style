-- 100件のサンプル支出データ投入SQL

DO $$
DECLARE
  v_user_uuid TEXT := '019c9496a174750ea12ea264b8864bed';
  v_cat_food TEXT;
  v_cat_water TEXT;
  v_cat_electric TEXT;
  v_cat_gas TEXT;
  v_cat_entertainment TEXT;
  v_cat_shopping TEXT;
BEGIN
  -- カテゴリUUID取得
  SELECT uuid INTO v_cat_food FROM categories WHERE name = '食費' AND user_uuid = v_user_uuid LIMIT 1;
  SELECT uuid INTO v_cat_water FROM categories WHERE name = '水道' AND user_uuid = v_user_uuid LIMIT 1;
  SELECT uuid INTO v_cat_electric FROM categories WHERE name = '電気' AND user_uuid = v_user_uuid LIMIT 1;
  SELECT uuid INTO v_cat_gas FROM categories WHERE name = 'ガス' AND user_uuid = v_user_uuid LIMIT 1;
  SELECT uuid INTO v_cat_entertainment FROM categories WHERE name = '娯楽' AND user_uuid = v_user_uuid LIMIT 1;
  SELECT uuid INTO v_cat_shopping FROM categories WHERE name = '買い物' AND user_uuid = v_user_uuid LIMIT 1;

  -- expenses + association を一括投入
  -- 2025/03 ~ 2026/02 の12ヶ月分、各月8~9件

  -- 2025/03
  INSERT INTO expenses (uuid, user_uuid, name, amount, created_at, updated_at) VALUES
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'スーパー', 3200, '2025-03-02 12:00:00', '2025-03-02 12:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ランチ', 980, '2025-03-05 12:30:00', '2025-03-05 12:30:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '電車定期', 12000, '2025-03-06 09:00:00', '2025-03-06 09:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '電気代', 8500, '2025-03-10 10:00:00', '2025-03-10 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'Netflix', 1490, '2025-03-12 20:00:00', '2025-03-12 20:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'コンビニ', 650, '2025-03-15 08:00:00', '2025-03-15 08:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '映画', 1800, '2025-03-20 15:00:00', '2025-03-20 15:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '携帯料金', 5500, '2025-03-25 10:00:00', '2025-03-25 10:00:00');

  -- 2025/04
  INSERT INTO expenses (uuid, user_uuid, name, amount, created_at, updated_at) VALUES
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'スーパー', 4100, '2025-04-01 11:00:00', '2025-04-01 11:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'カフェ', 520, '2025-04-03 14:00:00', '2025-04-03 14:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'タクシー', 2400, '2025-04-05 22:00:00', '2025-04-05 22:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ガス代', 4200, '2025-04-10 10:00:00', '2025-04-10 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '本', 1650, '2025-04-12 16:00:00', '2025-04-12 16:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ランチ', 1100, '2025-04-15 12:30:00', '2025-04-15 12:30:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ドラッグストア', 2300, '2025-04-18 17:00:00', '2025-04-18 17:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '水道代', 3800, '2025-04-22 10:00:00', '2025-04-22 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'サブスク', 980, '2025-04-28 20:00:00', '2025-04-28 20:00:00');

  -- 2025/05
  INSERT INTO expenses (uuid, user_uuid, name, amount, created_at, updated_at) VALUES
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'スーパー', 3800, '2025-05-02 11:00:00', '2025-05-02 11:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'バス', 460, '2025-05-04 08:30:00', '2025-05-04 08:30:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '飲み会', 4500, '2025-05-08 21:00:00', '2025-05-08 21:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '電気代', 7200, '2025-05-10 10:00:00', '2025-05-10 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '携帯料金', 5500, '2025-05-12 10:00:00', '2025-05-12 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'コンビニ', 780, '2025-05-15 07:30:00', '2025-05-15 07:30:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '歯医者', 3000, '2025-05-18 14:00:00', '2025-05-18 14:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '雑貨', 1200, '2025-05-25 16:00:00', '2025-05-25 16:00:00');

  -- 2025/06
  INSERT INTO expenses (uuid, user_uuid, name, amount, created_at, updated_at) VALUES
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'スーパー', 4500, '2025-06-01 10:00:00', '2025-06-01 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ランチ', 1050, '2025-06-03 12:00:00', '2025-06-03 12:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '電車', 680, '2025-06-05 18:00:00', '2025-06-05 18:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ガス代', 3500, '2025-06-10 10:00:00', '2025-06-10 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'Spotify', 980, '2025-06-12 20:00:00', '2025-06-12 20:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'カフェ', 600, '2025-06-16 15:00:00', '2025-06-16 15:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '美容院', 4800, '2025-06-20 13:00:00', '2025-06-20 13:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '携帯料金', 5500, '2025-06-25 10:00:00', '2025-06-25 10:00:00');

  -- 2025/07
  INSERT INTO expenses (uuid, user_uuid, name, amount, created_at, updated_at) VALUES
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'スーパー', 3600, '2025-07-02 11:00:00', '2025-07-02 11:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'タクシー', 1800, '2025-07-04 23:00:00', '2025-07-04 23:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '飲み会', 5200, '2025-07-07 20:00:00', '2025-07-07 20:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '電気代', 9800, '2025-07-10 10:00:00', '2025-07-10 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ジム月会費', 8000, '2025-07-11 10:00:00', '2025-07-11 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'コンビニ', 430, '2025-07-15 08:00:00', '2025-07-15 08:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '映画', 1800, '2025-07-20 14:00:00', '2025-07-20 14:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '水道代', 4100, '2025-07-25 10:00:00', '2025-07-25 10:00:00');

  -- 2025/08
  INSERT INTO expenses (uuid, user_uuid, name, amount, created_at, updated_at) VALUES
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'スーパー', 4300, '2025-08-01 11:00:00', '2025-08-01 11:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ランチ', 1200, '2025-08-04 12:30:00', '2025-08-04 12:30:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'バス', 460, '2025-08-06 09:00:00', '2025-08-06 09:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ガス代', 2800, '2025-08-10 10:00:00', '2025-08-10 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '携帯料金', 5500, '2025-08-12 10:00:00', '2025-08-12 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '旅行', 35000, '2025-08-14 10:00:00', '2025-08-14 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'お土産', 3200, '2025-08-15 16:00:00', '2025-08-15 16:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'コンビニ', 550, '2025-08-20 07:00:00', '2025-08-20 07:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'Netflix', 1490, '2025-08-25 20:00:00', '2025-08-25 20:00:00');

  -- 2025/09
  INSERT INTO expenses (uuid, user_uuid, name, amount, created_at, updated_at) VALUES
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'スーパー', 3900, '2025-09-01 11:00:00', '2025-09-01 11:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'カフェ', 480, '2025-09-03 14:00:00', '2025-09-03 14:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '電車', 520, '2025-09-05 18:00:00', '2025-09-05 18:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '電気代', 6800, '2025-09-10 10:00:00', '2025-09-10 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '飲み会', 4000, '2025-09-13 21:00:00', '2025-09-13 21:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ドラッグストア', 1800, '2025-09-16 17:00:00', '2025-09-16 17:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '本', 2200, '2025-09-20 15:00:00', '2025-09-20 15:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '携帯料金', 5500, '2025-09-25 10:00:00', '2025-09-25 10:00:00');

  -- 2025/10
  INSERT INTO expenses (uuid, user_uuid, name, amount, created_at, updated_at) VALUES
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'スーパー', 4200, '2025-10-02 10:00:00', '2025-10-02 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ランチ', 1080, '2025-10-04 12:00:00', '2025-10-04 12:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'タクシー', 3200, '2025-10-06 23:30:00', '2025-10-06 23:30:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ガス代', 4500, '2025-10-10 10:00:00', '2025-10-10 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'Spotify', 980, '2025-10-12 20:00:00', '2025-10-12 20:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '歯医者', 5000, '2025-10-15 14:00:00', '2025-10-15 14:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '映画', 1800, '2025-10-19 15:00:00', '2025-10-19 15:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '水道代', 3600, '2025-10-25 10:00:00', '2025-10-25 10:00:00');

  -- 2025/11
  INSERT INTO expenses (uuid, user_uuid, name, amount, created_at, updated_at) VALUES
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'スーパー', 5100, '2025-11-01 11:00:00', '2025-11-01 11:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'バス', 460, '2025-11-03 08:30:00', '2025-11-03 08:30:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '飲み会', 6000, '2025-11-07 20:00:00', '2025-11-07 20:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '電気代', 10500, '2025-11-10 10:00:00', '2025-11-10 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '携帯料金', 5500, '2025-11-12 10:00:00', '2025-11-12 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'コンビニ', 890, '2025-11-15 08:00:00', '2025-11-15 08:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '美容院', 4800, '2025-11-20 13:00:00', '2025-11-20 13:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ジム月会費', 8000, '2025-11-25 10:00:00', '2025-11-25 10:00:00');

  -- 2025/12
  INSERT INTO expenses (uuid, user_uuid, name, amount, created_at, updated_at) VALUES
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'スーパー', 6200, '2025-12-01 11:00:00', '2025-12-01 11:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ランチ', 1300, '2025-12-03 12:30:00', '2025-12-03 12:30:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '電車定期', 12000, '2025-12-05 09:00:00', '2025-12-05 09:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ガス代', 5800, '2025-12-10 10:00:00', '2025-12-10 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'クリスマスプレゼント', 8000, '2025-12-20 16:00:00', '2025-12-20 16:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '忘年会', 5500, '2025-12-22 20:00:00', '2025-12-22 20:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'Netflix', 1490, '2025-12-25 20:00:00', '2025-12-25 20:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '年末買い出し', 8500, '2025-12-30 14:00:00', '2025-12-30 14:00:00');

  -- 2026/01
  INSERT INTO expenses (uuid, user_uuid, name, amount, created_at, updated_at) VALUES
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'スーパー', 4800, '2026-01-03 11:00:00', '2026-01-03 11:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '初売り', 12000, '2026-01-02 10:00:00', '2026-01-02 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'カフェ', 550, '2026-01-06 14:00:00', '2026-01-06 14:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '電気代', 12000, '2026-01-10 10:00:00', '2026-01-10 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '携帯料金', 5500, '2026-01-12 10:00:00', '2026-01-12 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '新年会', 5000, '2026-01-15 20:00:00', '2026-01-15 20:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'コンビニ', 720, '2026-01-18 07:30:00', '2026-01-18 07:30:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '水道代', 4200, '2026-01-25 10:00:00', '2026-01-25 10:00:00');

  -- 2026/02
  INSERT INTO expenses (uuid, user_uuid, name, amount, created_at, updated_at) VALUES
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'スーパー', 3500, '2026-02-01 11:00:00', '2026-02-01 11:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ランチ', 1100, '2026-02-03 12:30:00', '2026-02-03 12:30:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'バス', 460, '2026-02-05 08:30:00', '2026-02-05 08:30:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ガス代', 5200, '2026-02-10 10:00:00', '2026-02-10 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'Spotify', 980, '2026-02-12 20:00:00', '2026-02-12 20:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'バレンタイン', 3000, '2026-02-14 15:00:00', '2026-02-14 15:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'コンビニ', 620, '2026-02-18 07:30:00', '2026-02-18 07:30:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, '携帯料金', 5500, '2026-02-20 10:00:00', '2026-02-20 10:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'カフェ', 480, '2026-02-22 14:00:00', '2026-02-22 14:00:00'),
    (replace(gen_random_uuid()::text, '-', ''), v_user_uuid, 'ドラッグストア', 1500, '2026-02-25 17:00:00', '2026-02-25 17:00:00');

  -- カテゴリ紐付け
  INSERT INTO expense_category_association (expense_uuid, category_uuid, created_at)
  SELECT e.uuid, v_cat_food, e.created_at FROM expenses e
  WHERE e.user_uuid = v_user_uuid AND e.name IN ('スーパー', 'コンビニ', 'ランチ', 'カフェ', 'お土産', '年末買い出し')
  ON CONFLICT DO NOTHING;

  INSERT INTO expense_category_association (expense_uuid, category_uuid, created_at)
  SELECT e.uuid, v_cat_water, e.created_at FROM expenses e
  WHERE e.user_uuid = v_user_uuid AND e.name = '水道代'
  ON CONFLICT DO NOTHING;

  INSERT INTO expense_category_association (expense_uuid, category_uuid, created_at)
  SELECT e.uuid, v_cat_electric, e.created_at FROM expenses e
  WHERE e.user_uuid = v_user_uuid AND e.name = '電気代'
  ON CONFLICT DO NOTHING;

  INSERT INTO expense_category_association (expense_uuid, category_uuid, created_at)
  SELECT e.uuid, v_cat_gas, e.created_at FROM expenses e
  WHERE e.user_uuid = v_user_uuid AND e.name = 'ガス代'
  ON CONFLICT DO NOTHING;

  INSERT INTO expense_category_association (expense_uuid, category_uuid, created_at)
  SELECT e.uuid, v_cat_entertainment, e.created_at FROM expenses e
  WHERE e.user_uuid = v_user_uuid AND e.name IN ('映画', '飲み会', 'Netflix', 'Spotify', 'サブスク', '忘年会', '新年会', '初売り', 'ジム月会費')
  ON CONFLICT DO NOTHING;

  INSERT INTO expense_category_association (expense_uuid, category_uuid, created_at)
  SELECT e.uuid, v_cat_shopping, e.created_at FROM expenses e
  WHERE e.user_uuid = v_user_uuid AND e.name IN ('クリスマスプレゼント', 'バレンタイン', '雑貨', '美容院', '本', 'ドラッグストア', '旅行', '電車定期', '電車', 'タクシー', 'バス', '携帯料金', '歯医者')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '100件のサンプル支出データを投入しました';
END $$;
