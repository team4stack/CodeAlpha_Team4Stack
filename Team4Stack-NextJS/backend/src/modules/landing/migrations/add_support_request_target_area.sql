-- Adds support request routing target to control admin visibility.
ALTER TABLE support_requests
ADD COLUMN IF NOT EXISTS target_area TEXT DEFAULT 'site';

-- Keep values constrained for data safety.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'support_requests_target_area_check'
  ) THEN
    ALTER TABLE support_requests
    ADD CONSTRAINT support_requests_target_area_check
    CHECK (target_area IN ('site', 'course'));
  END IF;
END $$;
